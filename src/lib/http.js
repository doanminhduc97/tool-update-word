import axios from 'axios'

// Hỗ trợ cấu hình URL Backend độc lập khi tách repo (VITE_API_BASE_URL)
// Nếu để trống hoặc chạy cùng origin -> mặc định '/api'
const apiBase = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')
const baseURL = apiBase ? `${apiBase}/api` : '/api'

const http = axios.create({ baseURL, withCredentials: true, timeout: 20000 })
const raw = axios.create({ baseURL, withCredentials: true, timeout: 20000 })

// Cookie Helpers cho Client
function getCookie(name) {
  const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'))
  return matches ? decodeURIComponent(matches[1]) : null
}

function setCookie(name, value, minutes) {
  let expires = ''
  if (minutes) {
    const d = new Date()
    d.setTime(d.getTime() + minutes * 60 * 1000)
    expires = '; expires=' + d.toUTCString()
  }
  const isSecure = location.protocol === 'https:' ? '; Secure; SameSite=Lax' : '; SameSite=Lax'
  document.cookie = name + '=' + encodeURIComponent(value || '') + expires + '; path=/' + isSecure
}

function deleteCookie(name) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
}

// Timeout phiên treo máy là 60 phút (1 giờ)
const SESSION_COOKIE_NAME = 'tuw_at'
const SESSION_TIMEOUT_MINUTES = 60

let accessToken = getCookie(SESSION_COOKIE_NAME) || null
let onRefreshed = null
let refreshPromise = null

export function setAccessToken(token) {
  accessToken = token || null
  if (token) {
    setCookie(SESSION_COOKIE_NAME, token, SESSION_TIMEOUT_MINUTES)
  } else {
    deleteCookie(SESSION_COOKIE_NAME)
  }
}

// Tự động gia hạn thêm 60 phút (1 giờ) mỗi khi người dùng thao tác
export function touchSession() {
  if (accessToken) {
    setCookie(SESSION_COOKIE_NAME, accessToken, SESSION_TIMEOUT_MINUTES)
  }
}

export function getAccessToken() {
  return accessToken
}

export function setOnRefreshed(fn) {
  onRefreshed = fn
}

http.interceptors.request.use((cfg) => {
  // Lấy lại token từ cookie (nếu còn hạn 1 giờ)
  if (!accessToken) {
    accessToken = getCookie(SESSION_COOKIE_NAME) || null
  }
  if (accessToken) {
    touchSession() // Gia hạn thêm 1 giờ mỗi khi gọi request
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
  (res) => {
    // Tự động cập nhật accessToken mới từ response header do Backend cấp (refresh sliding 1h)
    const newToken = res.headers?.['x-new-access-token']
    if (newToken && newToken !== accessToken) {
      setAccessToken(newToken)
    }
    return res
  },
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
