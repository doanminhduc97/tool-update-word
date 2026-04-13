import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'  // import router
import './style.css';

const app = createApp(App)

app.use(router) // gắn router
app.mount('#app')
