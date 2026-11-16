import http from '@/lib/http'
import { useAuth } from '@/stores/auth'

/**
 * Kiểm tra trước số dư trong ví của người dùng trước khi tiến hành xử lý tạo file.
 * KHÔNG trừ tiền. Nếu không đủ tiền -> bắn modal nạp tiền và chặn ngay từ đầu.
 *
 * @returns {Promise<boolean>}
 */
export async function checkExportBalance() {
  try {
    await http.get('/wallet/check-balance')
    return true
  } catch (err) {
    const errorMsg =
      err.response?.data?.error ||
      'Không thể kiểm tra số dư hoặc số dư không đủ. Vui lòng nạp thêm tiền để tiếp tục.'

    if (err.response?.status === 402) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('open-deposit-modal'))
      }
    } else {
      alert(errorMsg)
    }
    throw new Error(errorMsg)
  }
}

/**
 * Chỉ gọi trừ tiền và ghi nhận số lần tạo hồ sơ SAU KHI file đã được render và tải về máy thành công.
 *
 * @param {string} docName Tên tài liệu đang xuất
 * @returns {Promise<boolean>}
 */
export async function deductExportFee(docName = '') {
  const auth = useAuth()
  try {
    const res = await http.post('/wallet/deduct-export', { docName })
    if (res.data?.user) {
      auth.state.user = res.data.user
    }
    return true
  } catch (err) {
    console.error('Lỗi khi ghi nhận trừ phí tải file:', err)
    return false
  }
}
