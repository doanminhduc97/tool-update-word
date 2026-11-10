/**
 * Helper lọc danh sách Chủ sở hữu hưởng lợi (CSH hưởng lợi) theo quy định Luật Doanh nghiệp:
 * - Chỉ cá nhân sở hữu từ 25% trở lên mới được xem là Chủ sở hữu hưởng lợi.
 * - Đối với file CSH hưởng lợi có tỷ lệ sở hữu vốn điều lệ (cột 9 & 11): phải >= 25% mới giữ lại row.
 * - Đối với file CSH hưởng lợi có tỷ lệ sở hữu cổ phần biểu quyết (cột 12 & 14): phải >= 25% mới giữ lại row.
 */

export function parsePercentage(val) {
  if (val === null || val === undefined) return 0
  if (typeof val === 'number') return val
  const str = String(val).replace('%', '').replace(',', '.').trim()
  const num = parseFloat(str)
  return isNaN(num) ? 0 : num
}

/**
 * Lọc mảng listUser cho file "DANH SÁCH CHỦ SỞ HỮU HƯỞNG LỢI"
 * @param {Array} list - Danh sách thành viên / cổ đông
 * @param {'von' | 'cophan' | 'auto'} type - Loại tỷ lệ cần kiểm tra (mặc định 'auto')
 *   - 'von': kiểm tra tỷ lệ sở hữu vốn điều lệ (cột 9, 11) >= 25%
 *   - 'cophan': kiểm tra tỷ lệ sở hữu cổ phần biểu quyết (cột 12, 14) >= 25%
 *   - 'auto': nếu có tỷ lệ cổ phần thì kiểm tra cổ phần, nếu không thì kiểm tra vốn điều lệ
 */
export function filterCshHuongLoiList(list, type = 'auto') {
  if (!Array.isArray(list)) return []

  return list.filter((item) => {
    const tlVon = parsePercentage(
      item.tl ??
      item['tỷ lệ % tv1'] ??
      item['tv1_tỉ lệ %'] ??
      item['tv1_tỷ lệ %'] ??
      item['cđ1_tỷ lệ %'] ??
      item['Tỷ lệ % sở hữu vốn điều lệ'] ??
      item['tỷ lệ %'] ??
      0
    )

    const tlCoPhan = parsePercentage(
      item.tlcd ??
      item['tỷ lệ % cđ1'] ??
      item['tv1_tỷ lệ % cđ'] ??
      item['cđ1_tỷ lệ % cđ'] ??
      item['Tỷ lệ % sở hữu cổ phần có quyền biểu quyết'] ??
      item['Tỷ lệ % vốn góp mới'] ??
      0
    )

    if (type === 'von') {
      return tlVon >= 25
    }

    if (type === 'cophan') {
      return tlCoPhan >= 25
    }

    // Auto: nếu có giá trị cổ phần > 0 thì xét cổ phần, ngược lại xét vốn điều lệ
    if (tlCoPhan > 0) {
      return tlCoPhan >= 25
    }
    return tlVon >= 25
  })
}
