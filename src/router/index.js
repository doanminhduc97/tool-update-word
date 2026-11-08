import { createRouter, createWebHistory } from 'vue-router'

// import các component page
import Home from '@/views/Home.vue'
import Home2 from '@/views/Home2.vue'
import Home3 from '@/views/Home3.vue'
import Home4 from '@/views/Home4.vue'
import Home5 from '@/views/Home5.vue'
import Home6 from '@/views/Home6.vue'
import Home7 from '@/views/Home7.vue'
import Home8 from '@/views/Home8.vue'
import { useAuth } from '@/stores/auth'

const routes = [
  // Auth
  { path: '/login', component: () => import('@/views/Login.vue'), meta: { public: true } },
  { path: '/register', component: () => import('@/views/Register.vue'), meta: { public: true } },

  // Admin
  { path: '/admin/users', component: () => import('@/views/AdminUsers.vue'), meta: { requiresAuth: true, requiresAdmin: true } },

  // Đăng kí kinh doanh 1 thành viên
  { path: '/', component: Home, meta: { requiresAuth: true } },
  // Đăng kí kinh doanh nhiều thành viên
  { path: '/dkkdntv', component: Home2, meta: { requiresAuth: true } },
  { path: '/tlctcp', component: Home3, meta: { requiresAuth: true } },
  // Giải thể
  { path: '/gt', component: Home4, meta: { requiresAuth: true } },
  { path: '/giai-the-1tv', component: Home4, meta: { requiresAuth: true } },
  { path: '/giai-the-thue', component: Home8, meta: { requiresAuth: true } },
  { path: '/csh-huong-loi', component: Home5, meta: { requiresAuth: true } },
  { path: '/hdcn-bbtl', component: Home6, meta: { requiresAuth: true } },
  // Tạm ngừng công ty
  { path: '/tam-ngung-1tv', component: Home7, props: { type: '1tv' }, meta: { requiresAuth: true } },
  { path: '/tam-ngung-2tv', component: Home7, props: { type: '2tv' }, meta: { requiresAuth: true } },
  { path: '/tam-ngung-cp', component: Home7, props: { type: 'cp' }, meta: { requiresAuth: true } },

  { path: '/:pathMatch(.*)*', redirect: '/' } // redirect tất cả route không tồn tại về Home
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  const auth = useAuth()

  if (!auth.state.ready) {
    await auth.init()
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && auth.state.user?.role !== 'ADMIN_SYSTEM') {
    return { path: '/' }
  }

  if (to.meta.public && auth.isAuthenticated.value) {
    return { path: '/' }
  }

  return true
})

export default router
