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
 * Tự động điền giá trị cho form dựa trên user hiện tại
 * @param {Object} formTarget Object chứa các key placeholder (VD: formValuesCommon hoặc file.formValues)
 * @param {Object} user Thông tin user đang login
 */
export function autofillLoginPlaceholders(formTarget, user) {
  if (!formTarget || !user) return
  Object.keys(formTarget).forEach((key) => {
    if (key.startsWith('Login_')) {
      const val = getLoginUserValue(user, key)
      if (val !== undefined && val !== null) {
        formTarget[key] = val
      }
    }
  })
}
