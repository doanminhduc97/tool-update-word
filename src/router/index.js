import { createRouter, createWebHistory } from 'vue-router'

// import các component page
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/about', component: About },
  { path: '/:pathMatch(.*)*', redirect: '/' } // redirect tất cả route không tồn tại về Home
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router