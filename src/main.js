import './assets/css/global.scss'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // import router
import './style.css';

import PhongDkkdInput from './components/PhongDkkdInput.vue'
import GenderRadio from './components/GenderRadio.vue'
import ProvinceSelectInput from './components/ProvinceSelectInput.vue'
import SearchableSelectInput from './components/SearchableSelectInput.vue'
import PageLoader from './components/PageLoader.vue'

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
app.component('SearchableSelectInput', SearchableSelectInput)
app.component('PhongDkkdInput', PhongDkkdInput)
app.component('GenderRadio', GenderRadio)
app.component('ProvinceSelectInput', ProvinceSelectInput)
app.component('PageLoader', PageLoader)

app.use(router) // gắn router
app.mount('#app')
