import { createRouter, createWebHistory } from 'vue-router'

// import các component page
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Home2 from '@/views/Home2.vue'
import Home3 from '@/views/Home3.vue'
import Home4 from '@/views/Home4.vue'

const routes = [
  // Đăng kí kinh doanh 1 thành viên
  { path: '/', component: Home },
  // Đăng kí kinh doanh nhiều thành viên
  { path: '/dkkdntv', component: Home2 },
  { path: '/tlctcp', component: Home3 },
  { path: '/gt', component: Home4 },

  { path: '/:pathMatch(.*)*', redirect: '/' } // redirect tất cả route không tồn tại về Home
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router