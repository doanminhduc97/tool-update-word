import axios from 'axios'

// Hỗ trợ cấu hình URL Backend độc lập khi tách repo (VITE_API_BASE_URL)
// Nếu để trống hoặc chạy cùng origin -> mặc định '/api'
const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const baseURL = apiBase ? `${apiBase}/api` : '/api'

const http = axios.create({ baseURL, withCredentials: true, timeout: 20000 })
const raw = axios.create({ baseURL, withCredentials: true, timeout: 20000 })

let accessToken = null
let onRefreshed = null
let refreshPromise = null

export function setAccessToken(token) {
  accessToken = token || null
}

export function getAccessToken() {
  return accessToken
}

export function setOnRefreshed(fn) {
  onRefreshed = fn
}

http.interceptors.request.use((cfg) => {
  if (accessToken) {
    cfg.headers = cfg.headers || {}
    cfg.headers.Authorization = `Bearer ${accessToken}`
  }
  return cfg
})

export function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = raw
      .post('/auth/refresh')
      .then((res) => {
        setAccessToken(res.data.accessToken)
        if (onRefreshed) onRefreshed(res.data.user)
        return res.data
      })
      .catch((err) => {
        setAccessToken(null)
        throw err
      })
      .finally(() => {
        refreshPromise = null
      })
  }
  return refreshPromise
}

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error
    const url = config?.url || ''
    const isAuthCall =
      url.includes('/auth/login') ||
      url.includes('/auth/register') ||
      url.includes('/auth/refresh') ||
      url.includes('/auth/logout')

    // Chỉ thử refresh 1 lần cho các API nghiệp vụ bị 401
    if (!response || response.status !== 401 || !config || config._retry || isAuthCall) {
      throw error
    }

    config._retry = true
    const data = await refreshSession()
    config.headers = config.headers || {}
    config.headers.Authorization = `Bearer ${data.accessToken}`
    return http(config)
  },
)

export default http
