import Tesseract from 'tesseract.js';

const MAX_WIDTH = 1600;

function deaccent(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Không đọc được file ảnh'));
    };
    img.src = url;
  });
}

function preprocess(img) {
  const isCard = img.width / img.height > 1.2 && img.width / img.height < 2.1;
  // crop bỏ cột trái (ảnh chân dung + quốc huy) trước khi OCR để tránh line gộp 2 cột
  const sx = isCard ? Math.round(img.width * 0.3) : 0;
  const sw = img.width - sx;
  const scale = Math.max(1, Math.min(2, MAX_WIDTH / sw)) || 1;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, sx, 0, sw, img.height, 0, 0, canvas.width, canvas.height);

  // Grayscale + stretch contrast cho nền CCCD xanh nhạt / trắng
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const px = data.data;
  let min = 255;
  let max = 0;
  const gray = new Uint8Array(px.length / 4);
  for (let i = 0; i < gray.length; i++) {
    const g = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
    gray[i] = g;
    if (g < min) min = g;
    if (g > max) max = g;
  }
  const range = max - min || 1;
  for (let i = 0; i < gray.length; i++) {
    const v = Math.min(255, Math.round(((gray[i] - min) / range) * 255));
    px[i * 4] = px[i * 4 + 1] = px[i * 4 + 2] = v;
    px[i * 4 + 3] = 255;
  }
  ctx.putImageData(data, 0, 0);
  return canvas;
}

// Flatten blocks → mảng { text, bbox }, chỉ giữ vùng nội dung bên phải (bỏ cột ảnh/cột trái),
// sort theo y rồi x để tái tạo thứ tự đọc đúng.
function layoutLines(blocks, canvasWidth) {
  const items = [];
  const walk = (node) => {
    if (!node) return;
    if (node.lines) {
      for (const line of node.lines) {
        if (line.text && line.text.trim() && line.bbox) {
          items.push({ text: line.text.replace(/\s+/g, ' ').trim(), bbox: line.bbox });
        }
      }
      return;
    }
    if (node.paragraphs) {
      for (const p of node.paragraphs) walk(p);
    } else if (node.blocks) {
      for (const b of node.blocks) walk(b);
    }
  };
  for (const b of blocks || []) walk(b);
  items.sort((a, b) => (a.bbox.y0 - b.bbox.y0) || (a.bbox.x0 - b.bbox.x0));
  return items;
}

// Lấy phần value sau label VN (+ phần tiếng Anh "/...:" phía sau)
function afterLabel(line, labelRe) {
  let plain = line;
  let m;
  if ((m = labelRe.exec(deaccent(line.toLowerCase())))) {
    plain = line.slice(m.index + m[0].length);
  }
  return plain.replace(/^[\s:;,.\/\-|]+/, '').replace(/\s{2,}/g, ' ').trim();
}

  // Chọn giá trị: candidate có tỉ lệ chữ HOA cao (tên trên CCCD in hoa; junk như "SA la BA" tỉ lệ thấp hơn)
  function pickName(cands) {
  const clean = (s) => String(s || '').trim();
  const scored = cands.filter(clean)
    .map((s) => {
      const letters = s.replace(/[^\p{L}]/gu, '');
      if (letters.length < 5) return null;
      const up = (letters.match(/\p{Lu}/gu) || []).length;
      // bỏ đuôi rác như "II", "BA" ≤2 ký tự
      const v = clean(s).replace(/\s+[^\s]{1,3}$/, '').trim();
      return { v, score: (up / letters.length) * 10 + Math.min(letters.length, 30) };
    })
    .filter(Boolean);
  if (!scored.length) return '';
  scored.sort((a, b) => b.score - a.score);
  return scored[0].v;
}

// Chọn giá trị: candidate có tỉ lệ chữ HOA cao (tên trên CCCD in hoa; junk như "SA la BA" tỉ lệ thấp hơn)
function extractFields(lines) {
  const result = { idNumber: '', name: '', gender: '', birthday: '', homeNumber: '', ward: '', city: '' };

  // Số CCCD: 12 chữ số ưu tiên; fallback 9/11 số
  const idAll = lines.map((l) => l.norm).join(' \n ').match(/\b\d{12}\b/);
  if (idAll) result.idNumber = idAll[0];

  // Ngày sinh dd/mm/yyyy (lấy dòng chứa "ngay sinh" trước, digits có thể ở dòng kế tiếp)
  const dobRe = /(\d{2}[/.\-]\d{2}[/.\-]\d{4})/;
  const dobIdx = lines.findIndex((l) => /ngay,.?thang,?nam sinh|date of birth|ngay sinh/.test(l.norm));
  let dobSource = dobIdx >= 0
    ? (lines[dobIdx].norm.match(dobRe) || (lines[dobIdx + 1] && lines[dobIdx + 1].norm.match(dobRe)))
    : null;
  if (!dobSource) dobSource = lines.map((l) => l.norm).join(' \n ').match(dobRe);
  if (dobSource) result.birthday = dobSource[1].replace(/[.\-]/g, '/');

  const labelName = /ho[,.\s]+(?:chu\s*de\w+)?(?:va\s*)?(?:[tl]e?e?n)\b|ho\s+va\s+ten|full\s*nam/;
  const labelResidence = /noi o hien tai|noi thuong tru|noi cu tru|place of residence|noi (?:o|cu)\b|thuong tru/;
  const labelIssue = /ngay cap|date of issue|ngay het han|date of expiry|co gia tri|cap nhat lan cuoi|dac diem nhan dang/;

  // Ưu tiên block "Nơi ở hiện tại" (theo yêu cầu nghiệp vụ); fallback label residence khác
  const resStart = lines.findIndex((l) => /noi o hien tai/.test(l.norm));
  const resStartFallback = lines.findIndex((l) => labelResidence.test(l.norm));
  const residenceStart = resStart >= 0 ? resStart : resStartFallback;

  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    const next = lines[i + 1];

    // Họ và tên: chọn candidate (value trên label line hoặc dòng kế) có tỉ lệ chữ HOA cao nhất
    if (labelName.test(l.norm) && !result.name) {
      let val = afterLabel(l.raw, labelName);
      val = val.replace(/^\/?\s*[Ff]ul?\w?\s*nam\w*\s*:?\s*/g, '');
      const nextVal = next ? next.raw : '';
      result.name = pickName([val, nextVal]);
    }

    // Giới tính
    if (!result.gender && /gioi tinh|\bsex\b|gender/.test(l.norm)) {
      let val = afterLabel(l.raw, /gioi tinh|\bsex\b|gender/);
      if ((!val || val.length < 2) && next) val = next.raw;
      const g = deaccent(val).match(/\b(Nam|Nu|Female|Male)\b/i);
      if (g) {
        const v = g[0].toLowerCase();
        result.gender = v === 'nam' || v === 'male' ? 'Nam' : 'Nữ';
      }
    }

    // Nơi cư trú: gom nguyên khối (label + các dòng tiếp theo) rồi tách theo dấu phẩy
    if (i === residenceStart && residenceStart >= 0) {
      let home = afterLabel(l.raw, labelResidence)
        .replace(/^\/?\s*[Pp]lace\s*of\s*[A-Za-z]{4,12}\s*[-:.]?\s*/, '')
        .replace(/^\/?\s*[Nn]o\.?\s*[-:.]?\s*/, '');
      for (let j = i + 1; j < lines.length; j++) {
        if (/noi tam tru|tam tru\b|noi o\b|que quan|place of origin|ngay cap|co gia tri|date of expiry|dac diem|cap nhat|lich su|the can/.test(lines[j].norm)) break;
        home += (home && !/[,\s]$/.test(home) ? ' ' : '') + lines[j].raw;
      }
      applyResidence(home, result);
      break;
    }
  }

  // Fallback giới tính khi label bị OCR nuốt: token Nam/Nữ standalone (bỏ qua dòng Quốc tịch)
  if (!result.gender) {
    for (const l of lines) {
      if (/[Nn]ationality|quoc tich/.test(l.norm)) continue;
      const g = l.norm.match(/(?:^|[\s:.])(Nam|Nu|Female|Male)(?:[\s.,:]|$)/);
      if (g) {
        result.gender = /nam|male/i.test(g[1]) ? 'Nam' : 'Nữ';
        break;
      }
    }
  }

  return cleanup(result);
}

// CCCD thật: "Nơi thường trú: 2211 T22 Tòa S2, Số 47 Nguyễn Tuân, TXT, Thanh Xuân, Hà Nội"
// → city = phần cuối, ward = phần có keyword hoặc phần ngay trước city, còn lại = homeNumber
function applyResidence(text, r) {
  const parts = text.split(/[,;]+/).map((s) => s.trim().replace(/^[-–\s]+/, '')).filter(Boolean);
  if (!parts.length) return;
  r.city = String(parts[parts.length - 1]).replace(/^(?:Th[àa]nh\s+ph[oỏồóơа]|TP\.?|T[ỉi]nh|Tinh)\s+/i, '');
  if (!r.city) r.city = parts[parts.length - 1];

  // duyệt ngược từ trước Tỉnh: gom các phần có keyword Phường/Xã/Quận/Huyện vào ward
  const wardRe = /\b(phuong|xa\b|thi tran|quan\b|huyen|thi xa)\b/;
  let k = parts.length - 2;
  const wards = [];
  while (k >= 0 && wardRe.test(deaccent(parts[k].toLowerCase()))) {
    wards.unshift(parts[k]);
    k--;
  }
  // không keyword nào nhưng có ≥1 phần trước đó → phần ngay trước Tỉnh là cấp ward/quận
  if (!wards.length && k >= 0) {
    wards.unshift(parts[k]);
    k--;
  }
  const homes = parts.slice(0, k + 1);
  if (!r.ward) r.ward = wards.join(', ');
  if (!r.homeNumber) r.homeNumber = homes.join(', ');
}

function cleanup(r) {
  for (const k of Object.keys(r)) {
    r[k] = String(r[k] || '')
      .replace(/[|~«»"“”'\`ˆˇ¸ː]/g, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/[\s,]+$/, '')
      .trim();
  }
  if (r.name && r.name.includes(':')) {
    const idx = r.name.lastIndexOf(':');
    r.name = r.name.slice(idx + 1).trim();
  }
  return r;
}

export function __debugExtract(lines) {
  return extractFields(lines.map((l) => (typeof l === 'string' ? { raw: l, norm: deaccent(l.toLowerCase()) } : l)));
}

export function __debugPickName(cands) {
  return pickName(cands);
}

export async function parseCccdFront(file, onProgress) {
  const img = await loadImage(file);
  const canvas = preprocess(img);
  const worker = await Tesseract.createWorker('vie', 1);
  try {
    const { data } = await worker.recognize(canvas, {}, { text: true, blocks: true, hocr: false, tsv: false });
    if (onProgress) onProgress({ status: 'done', progress: 1, image: file.name });
    const lineItems = layoutLines(data.blocks, canvas.width);
    const lines = lineItems.map((it) => ({
      raw: it.text,
      norm: deaccent(it.text.toLowerCase()),
      bbox: it.bbox,
    }));
    const fields = extractFields(lines);
    if (!fields.idNumber && !fields.name) {
      throw new Error('Không nhận diện được dữ liệu CCCD trong ảnh. Vui lòng chụp rõ ràng hơn (mặt trước).');
    }
    return fields;
  } finally {
    await worker.terminate();
  }
}
