import { createRouter, createWebHistory } from 'vue-router'

// import các component page
import Home from '@/views/Home.vue'
import About from '@/views/About.vue'
import Home2 from '@/views/Home2.vue'
import Home3 from '@/views/Home3.vue'
import Home4 from '@/views/Home4.vue'
import Home5 from '@/views/Home5.vue'
import Home6 from '@/views/Home6.vue'
import Home7 from '@/views/Home7.vue'

const routes = [
  // Đăng kí kinh doanh 1 thành viên
  { path: '/', component: Home },
  // Đăng kí kinh doanh nhiều thành viên
  { path: '/dkkdntv', component: Home2 },
  { path: '/tlctcp', component: Home3 },
  { path: '/gt', component: Home4 },
  { path: '/csh-huong-loi', component: Home5 },
  { path: '/hdcn-bbtl', component: Home6 },
  // Tạm ngừng công ty
  { path: '/tam-ngung-1tv', component: Home7, props: { type: '1tv' } },
  { path: '/tam-ngung-2tv', component: Home7, props: { type: '2tv' } },
  { path: '/tam-ngung-cp', component: Home7, props: { type: 'cp' } },

  { path: '/:pathMatch(.*)*', redirect: '/' } // redirect tất cả route không tồn tại về Home
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router