/**
 * Kiểm tra xem 1 tên trường / placeholder có phải là trường Giới tính hay không
 */
export function isGenderField(fieldName) {
  if (!fieldName || typeof fieldName !== 'string') return false
  const lower = fieldName.trim().toLowerCase()
  // Bỏ tiền tố Login_ nếu có
  const clean = lower.startsWith('login_') ? lower.slice(6) : lower
  
  if (clean === 'giới tính' || clean === 'gioi tinh' || clean === 'gender') return true
  if (clean.endsWith('giới tính') || clean.endsWith('gioi tinh')) return true
  if (clean.includes('giới tính') || clean.includes('gioi tinh')) return true
  return false
}
