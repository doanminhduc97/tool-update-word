/**
 * Tiện ích chuẩn hoá toàn bộ văn bản trong file docx sang font 'Times New Roman'
 * Xử lý trực tiếp trên cấu trúc OpenXML (PizZip) của file Word (.docx)
 */
export function enforceTimesNewRoman(zip) {
  if (!zip || !zip.files) return

  const targetFont = 'Times New Roman'
  const targetRFonts = `<w:rFonts w:ascii="${targetFont}" w:hAnsi="${targetFont}" w:cs="${targetFont}" w:eastAsia="${targetFont}"/>`

  // 1. Quét và cập nhật tất cả file XML trong thư mục word/ (document, header, footer, footnotes, endnotes, styles...)
  Object.keys(zip.files).forEach((filename) => {
    if (!filename.startsWith('word/') || !filename.endsWith('.xml')) return
    const file = zip.file(filename)
    if (!file) return

    let xml = file.asText()
    let changed = false

    // Chuẩn hoá mọi thẻ <w:rFonts .../> cụ thể về Times New Roman
    if (/<w:rFonts\b[^>]*\/?>/.test(xml)) {
      xml = xml.replace(/<w:rFonts\b[^>]*\/?>/g, targetRFonts)
      changed = true
    }

    // Đảm bảo style mặc định docDefaults trong word/styles.xml luôn dùng Times New Roman
    if (filename === 'word/styles.xml') {
      if (/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/.test(xml)) {
        xml = xml.replace(/<w:docDefaults>[\s\S]*?<\/w:docDefaults>/, (m) => {
          if (/<w:rPrDefault>/.test(m)) {
            if (/<w:rPr>/.test(m)) {
              if (/<w:rFonts\b/.test(m)) {
                return m
              }
              return m.replace(/<w:rPr>/, '<w:rPr>' + targetRFonts)
            } else {
              return m.replace(/<w:rPrDefault>/, '<w:rPrDefault><w:rPr>' + targetRFonts + '</w:rPr>')
            }
          }
          return m.replace(/<w:docDefaults>/, '<w:docDefaults><w:rPrDefault><w:rPr>' + targetRFonts + '</w:rPr></w:rPrDefault>')
        })
        changed = true
      }
    }

    if (changed) {
      zip.file(filename, xml)
    }
  })
}
