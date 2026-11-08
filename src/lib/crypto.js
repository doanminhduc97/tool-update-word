/**
 * Tiện ích băm mật khẩu phía client (Frontend)
 * Sử dụng Web Crypto API (SubtleCrypto) chuẩn W3C, có sẵn trên mọi trình duyệt hiện đại
 * Không cần cài thêm thư viện npm nặng nề, hoàn toàn bảo mật.
 */

export async function hashPasswordClient(plainPassword) {
  if (!plainPassword) return ''
  const encoder = new TextEncoder()
  const data = encoder.encode(plainPassword)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}
