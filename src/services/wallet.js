import http from '@/lib/http'
import { useAuth } from '@/stores/auth'

/**
 * Kiểm tra và trừ tiền tài khoản trước khi xuất file.
 * - ADMIN_SYSTEM: Miễn phí (0đ).
 * - NORMAL: 2.000đ / lần.
 * - PRO: 5.000đ / lần.
 * Nếu số dư không đủ -> alert thông báo nạp thêm tiền và quăng lỗi chặn xuất file.
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
    const errorMsg =
      err.response?.data?.error ||
      'Không thể trừ phí xuất file hoặc số dư không đủ. Vui lòng nạp thêm tiền để tiếp tục.'

    // Tự động mở Modal Nạp tiền ngay khi không đủ số dư
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
