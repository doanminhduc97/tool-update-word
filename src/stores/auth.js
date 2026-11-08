import { reactive, computed } from 'vue'
import http, { setAccessToken, setOnRefreshed, refreshSession } from '@/lib/http'

const state = reactive({
  user: null,
  ready: false,
})

const isAuthenticated = computed(() => !!state.user)

let initPromise = null
let listeners = []

setOnRefreshed((user) => {
  state.user = user || null
})

function notify() {
  for (const fn of listeners) {
    try {
      fn(state.user)
    } catch {
      // bỏ qua listener lỗi
    }
  }
}

export function onAuthChange(fn) {
  listeners.push(fn)
  return () => {
    listeners = listeners.filter((item) => item !== fn)
  }
}

async function init(force = false) {
  if (state.ready && !force) return state.user
  if (initPromise) return initPromise

  initPromise = (async () => {
    try {
      await refreshSession()
    } catch {
      state.user = null
      setAccessToken(null)
    } finally {
      state.ready = true
      initPromise = null
      notify()
    }
    return state.user
  })()

  return initPromise
}

async function login(account, password) {
  const { data } = await http.post('/auth/login', { account, password })
  setAccessToken(data.accessToken)
  state.user = data.user
  state.ready = true
  notify()
  return data.user
}

async function register(payload) {
  const { data } = await http.post('/auth/register', payload)
  setAccessToken(data.accessToken)
  state.user = data.user
  state.ready = true
  notify()
  return data.user
}

async function logout() {
  try {
    await http.post('/auth/logout')
  } catch {
    // vẫn xoá phiên phía client dù API lỗi
  }
  setAccessToken(null)
  state.user = null
  notify()
}

async function updateProfile(fullName) {
  const { data } = await http.patch('/auth/me', { fullName })
  state.user = data.user
  notify()
  return data.user
}

async function changePassword(currentPassword, newPassword) {
  await http.post('/auth/change-password', { currentPassword, newPassword })
  setAccessToken(null)
  state.user = null
  notify()
}

export function useAuth() {
  return {
    state,
    isAuthenticated,
    init,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    onAuthChange,
  }
}
