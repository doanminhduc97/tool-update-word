/**
 * Tiện ích tự động điền các placeholder có tiền tố "Login_" từ thông tin người dùng đang đăng nhập
 * 
 * Ánh xạ chuẩn:
 * - "Login_Họ tên Người được ủy quyền" -> user.fullName
 * - "Login_Email Người được ủy quyền" -> user.email
 * - "Login_số điện thoại Người được ủy quyền" -> user.phone
 * - "Login_giới tính Người được ủy quyền" -> user.gender
 * - "Login_ngày sinh Người được ủy quyền" -> user.birthday
 * - "Login_số định danh Người được ủy quyền" -> user.idNumber
 * - "Login_địa chỉ Người được ủy quyền" -> user.address
 */

/**
 * Chuyển đổi tên placeholder hiển thị trên label (bỏ tiền tố Login_)
 * Ví dụ: "Login_Họ tên Người được ủy quyền" -> "Họ tên Người được ủy quyền"
 */
export function formatPlaceholderLabel(key) {
  if (!key) return ''
  let label = String(key)
  if (label.startsWith('Login_')) {
    label = label.slice(6)
  }
  return label
}

export function getLoginUserValue(user, key) {
  if (!user || !key) return ''
  const trimmed = key.trim()

  // So sánh chuẩn các trường Người được ủy quyền
  const lower = trimmed.toLowerCase()

  if (lower.includes('họ tên') || lower.includes('ho ten') || lower.includes('fullname')) {
    return user.fullName || ''
  }
  if (lower.includes('email')) {
    return user.email || ''
  }
  if (lower.includes('điện thoại') || lower.includes('dien thoai') || lower.includes('phone') || lower.includes('sđt')) {
    return user.phone || ''
  }
  if (lower.includes('giới tính') || lower.includes('gioi tinh') || lower.includes('gender')) {
    return user.gender || ''
  }
  if (lower.includes('ngày sinh') || lower.includes('ngay sinh') || lower.includes('birthday') || lower.includes('dob')) {
    return user.birthday || ''
  }
  if (lower.includes('định danh') || lower.includes('dinh danh') || lower.includes('cccd') || lower.includes('idnumber')) {
    return user.idNumber || ''
  }
  if (lower.includes('địa chỉ') || lower.includes('dia chi') || lower.includes('address')) {
    return user.address || ''
  }

  return ''
}

/**
 * Sắp xếp danh sách placeholder:
 * Đẩy toàn bộ các trường có tiền tố "Login_" xuống CUỐI CÙNG,
 * các trường thông tin khác giữ nguyên thứ tự hoặc xếp lên trên để user nhập trước.
 */
export function sortPlaceholdersWithLoginAtEnd(arr) {
  if (!Array.isArray(arr)) return []
  const nonLogin = arr.filter(k => !String(k).startsWith('Login_'))
  const loginFields = arr.filter(k => String(k).startsWith('Login_'))
  return [...nonLogin, ...loginFields]
}

import phongDkkdList from '@/data/phong-dkkd.json'

function normalizeVietnamese(str) {
  if (!str) return ''
  return String(str)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
}

const aliasProvinceMap = {
  hcm: 'Hồ Chí Minh',
  'tp hcm': 'Hồ Chí Minh',
  'tphcm': 'Hồ Chí Minh',
  'tp.hcm': 'Hồ Chí Minh',
  'sai gon': 'Hồ Chí Minh',
  saigon: 'Hồ Chí Minh',
  hn: 'Hà Nội',
  'ha noi': 'Hà Nội',
  'tp ha noi': 'Hà Nội',
  'tp.ha noi': 'Hà Nội',
  danang: 'Đà Nẵng',
  'da nang': 'Đà Nẵng',
  hp: 'Hải Phòng',
  'hai phong': 'Hải Phòng',
  cantho: 'Cần Thơ',
  'can tho': 'Cần Thơ',
  hue: 'Huế',
  'thua thien hue': 'Huế',
}

/**
 * Tìm phòng ĐKKD khớp đúng nhất từ chuỗi địa chỉ của người dùng
 * @param {string} address Chuỗi địa chỉ (user.address)
 * @returns {string} Tên đầy đủ của Phòng ĐKKD hoặc '' nếu không tìm thấy
 */
export function findBestMatchingPhongDkkd(address) {
  if (!address) return ''
  const normAddr = normalizeVietnamese(address)

  // 1. Kiểm tra alias viết tắt phổ biến trước (hcm, hn, da nang, hai phong...)
  for (const [alias, targetKey] of Object.entries(aliasProvinceMap)) {
    const reg = new RegExp(`(^|[^a-z0-9])${alias}([^a-z0-9]|$)`)
    if (reg.test(normAddr)) {
      const found = phongDkkdList.find(p => p.includes(targetKey))
      if (found) return found
    }
  }

  // 2. Tìm tên tỉnh/thành xuất hiện trong địa chỉ (ưu tiên tên dài nhất để chính xác nhất)
  let bestMatch = ''
  let maxLen = 0

  for (const item of phongDkkdList) {
    const m = item.match(/(?:Thành Phố|Tỉnh)\s+(.+)$/i)
    if (m && m[1]) {
      const provinceName = m[1].trim()
      const normProv = normalizeVietnamese(provinceName)
      if (normAddr.includes(normProv)) {
        if (normProv.length > maxLen) {
          maxLen = normProv.length
          bestMatch = item
        }
      }
    }
  }

  return bestMatch
}

/**
 * Tự động điền giá trị cho form dựa trên user hiện tại
 * @param {Object} formTarget Object chứa các key placeholder (VD: formValuesCommon hoặc file.formValues)
 * @param {Object} user Thông tin user đang login
 */
export function autofillLoginPlaceholders(formTarget, user) {
  if (!formTarget || !user) return

  // Tự động tìm Phòng ĐKKD mặc định từ địa chỉ người dùng nếu form có trường này
  const matchedDkkd = findBestMatchingPhongDkkd(user.address)

  Object.keys(formTarget).forEach((key) => {
    if (key.startsWith('Login_')) {
      const val = getLoginUserValue(user, key)
      if (val !== undefined && val !== null) {
        formTarget[key] = val
      }
    } else if (
      (key === 'Phòng ĐKKD Tỉnh/TP' || key === 'Cơ quan đăng ký kinh doanh cấp tỉnh') &&
      !formTarget[key]
    ) {
      // Gán giá trị mặc định của ô input từ tỉnh thành của user, nếu không tìm thấy khớp nào thì mặc định để rỗng
      formTarget[key] = matchedDkkd || ''
    }
  })
}
