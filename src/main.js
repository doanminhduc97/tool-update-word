import './assets/css/global.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // import router
import './style.css';

import PhongDkkdInput from './components/PhongDkkdInput.vue'

// Tự động gán tooltip (thuộc tính title) cho mọi ô input khi hover vào để show giá trị bên trong
if (typeof window !== 'undefined') {
  document.addEventListener('mouseenter', (e) => {
    const el = e.target
    if (!el) return
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') {
      // Bỏ qua checkbox, radio, file, password (để bảo mật)
      const type = (el.getAttribute('type') || 'text').toLowerCase()
      if (['password', 'file', 'checkbox', 'radio'].includes(type)) return
      if (el.value) {
        el.setAttribute('title', el.value)
      } else {
        el.removeAttribute('title')
      }
    }
  }, true) // dùng capture phase để bắt được mọi hover của input ngay cả khi render động
}

const app = createApp(App)
app.component('PhongDkkdInput', PhongDkkdInput)

app.use(router) // gắn router
app.mount('#app')
