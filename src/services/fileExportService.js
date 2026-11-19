import { convert } from 'docx-to-pdf-wasm';
import wasmBinaryUrl from 'docx-to-pdf-wasm/wasm?url';
import PizZip from 'pizzip';
import { saveAs } from 'file-saver';
import { deductExportFee } from '@/services/wallet';

// Cache WebAssembly Module fallback
let cachedWasmModule = null;

async function getWasmModule() {
  if (cachedWasmModule) {
    return cachedWasmModule;
  }

  try {
    cachedWasmModule = await WebAssembly.compileStreaming(fetch(wasmBinaryUrl));
  } catch (err) {
    const res = await fetch(wasmBinaryUrl);
    const wasmBytes = await res.arrayBuffer();
    cachedWasmModule = await WebAssembly.compile(wasmBytes);
  }

  return cachedWasmModule;
}

/**
 * Chuẩn hóa các file XML trong cấu trúc DOCX (PizZip) để loại bỏ số thực thập phân
 * phòng ngừa cho parser WASM fallback.
 */
export function sanitizeDocxXmlForWasm(zip) {
  if (!zip || !zip.files) return;

  for (const [filename, file] of Object.entries(zip.files)) {
    if (filename.startsWith('word/') && filename.endsWith('.xml')) {
      let text = file.asText();
      if (/(\bw:[a-zA-Z0-9]+=")\d+\.\d+(")/.test(text)) {
        text = text.replace(/(\bw:[a-zA-Z0-9]+=")(\d+)\.(\d+)(")/g, (match, prefix, intPart, decPart, suffix) => {
          const rounded = Math.round(parseFloat(`${intPart}.${decPart}`));
          return `${prefix}${rounded}${suffix}`;
        });
        zip.file(filename, text);
      }
    }
  }
}

/**
 * Chuyển đổi DOCX sang PDF chất lượng cao nhất:
 *
 * THỨ TỰ ƯU TIÊN KIỂM CHỨNG:
 * 1. LOCAL API & BACKEND: Gọi `/api/convert/docx-to-pdf` (đã tích hợp LibreOffice engine chuẩn xác 100% tại local).
 * 2. CLOUD MICROSERVICE: Nếu có cấu hình VITE_PDF_CONVERTER_URL (Gotenberg trên Render.com).
 * 3. WASM FALLBACK: Nếu cả 2 service trên không khả dụng.
 *
 * @param {Blob|ArrayBuffer} docxData
 * @param {string} fileName
 * @returns {Promise<Blob>}
 */
export async function convertDocxToPdfBlob(docxData, fileName = 'document') {
  const converterUrl = import.meta.env.VITE_PDF_CONVERTER_URL;

  // Đảm bảo dữ liệu dạng Blob
  let docxBlob;
  if (docxData instanceof Blob) {
    docxBlob = docxData;
  } else {
    docxBlob = new Blob([docxData], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
  }

  // 1. Ưu tiên số 1: Microservice Render.com (nếu có cấu hình VITE_PDF_CONVERTER_URL)
  if (converterUrl) {
    try {
      const endpoint = `${converterUrl.replace(/\/+$/, '')}/convert`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/octet-stream' },
        body: docxBlob,
      });

      if (response.ok) {
        const pdfBlob = await response.blob();
        return pdfBlob;
      }
    } catch (_) {}
  }

  // 2. Ưu tiên số 2: Backend nội bộ (/api/convert/docx-to-pdf)
  try {
    const res = await fetch('/api/convert/docx-to-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: docxBlob,
    });
    if (res.ok) {
      const pdfBlob = await res.blob();
      return pdfBlob;
    }
  } catch (_) {}

  // 3. Fallback: WebAssembly Engine
  const wasmModule = await getWasmModule();
  const rawBuffer = await docxBlob.arrayBuffer();
  const zip = new PizZip(rawBuffer);
  sanitizeDocxXmlForWasm(zip);
  const sanitizedDocxBytes = zip.generate({ type: 'uint8array' });

  const pdfBytes = await convert(wasmModule, sanitizedDocxBytes);
  return new Blob([pdfBytes], { type: 'application/pdf' });
}

/**
 * Service tải hàng loạt file hồ sơ (hỗ trợ cả DOCX lẫn PDF theo từng file).
 * Tự động download và gọi trừ phí ví sau khi tất cả file hoàn tất.
 *
 * @param {Array<{ name: string, data: Blob }>} fileArr Danh sách file đã render bởi docxtemplater
 * @param {Record<string, 'docx'|'pdf'>} formatMap Bản đồ định dạng từng file: { [fileName]: 'docx' | 'pdf' }
 * @param {string} moduleTitle Tên phân hệ để ghi nhận trừ ví
 * @returns {Promise<void>}
 */
export async function exportFilesWithFormats(fileArr, formatMap = {}, moduleTitle = 'Tạo hồ sơ') {
  if (!fileArr || !fileArr.length) return;

  for (const item of fileArr) {
    const chosenFormat = (formatMap[item.name] || 'docx').toLowerCase();

    if (chosenFormat === 'pdf') {
      const pdfBlob = await convertDocxToPdfBlob(item.data, item.name);
      saveAs(pdfBlob, `${item.name}.pdf`);
    } else {
      saveAs(item.data, `${item.name}.docx`);
    }

    await new Promise(r => setTimeout(r, 150));
  }

  await deductExportFee(moduleTitle);
}
