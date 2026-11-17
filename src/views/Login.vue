<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-brand-header">
        <TuwLogo :size="42" :showText="true" theme="light" />
      </div>
      <h1 class="auth-title">Đăng nhập</h1>
      <p class="auth-sub">Hệ thống tạo hồ sơ pháp lý tự động</p>

      <form class="auth-form" @submit.prevent="submit">
        <label class="auth-field">
          <span>Tài khoản hoặc Email</span>
          <input
            ref="accountInput"
            v-model="account"
            class="auth-input"
            type="text"
            autocomplete="username"
            placeholder="Nhập tên tài khoản hoặc email"
            :disabled="loading"
          />
        </label>

        <label class="auth-field">
          <span>Mật khẩu</span>
          <input
            ref="passwordInput"
            v-model="password"
            class="auth-input"
            type="password"
            autocomplete="current-password"
            placeholder="Nhập mật khẩu"
            :disabled="loading"
          />
        </label>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button class="auth-button" type="submit" :disabled="loading">
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>

      <p class="auth-footer">
        Chưa có tài khoản?
        <router-link to="/register">Đăng ký ngay</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/stores/auth'
import { hashPasswordClient } from '@/lib/crypto'
import TuwLogo from '@/components/TuwLogo.vue'

export default {
  components: { TuwLogo },
  data() {
    return {
      account: '',
      password: '',
      error: '',
      loading: false,
    }
  },
  methods: {
    async submit() {
      this.error = ''

      // Đồng bộ giá trị từ DOM thật (phòng trường hợp trình duyệt tự điền autofill chưa kích hoạt input event của Vue)
      if (this.$refs.accountInput && this.$refs.accountInput.value) {
        this.account = this.$refs.accountInput.value
      }
      if (this.$refs.passwordInput && this.$refs.passwordInput.value) {
        this.password = this.$refs.passwordInput.value
      }

      const rawAccount = (this.account || '').trim()
      const rawPassword = this.password || ''

      if (!rawAccount || !rawPassword) {
        this.error = 'Vui lòng nhập tài khoản/email và mật khẩu'
        return
      }
      this.loading = true
      try {
        const hashedPassword = await hashPasswordClient(rawPassword)
        // Thử tối đa 2 lần: lần đầu có thể rớt do kết nối/proxy chưa sẵn sàng (backend vừa khởi động,
        // MongoDB Atlas cold-start, Vite proxy reset socket) — tự thử lại 1 lần trước khi báo lỗi.
        const maxAttempts = 2
        let lastErr = null
        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
          try {
            await useAuth().login(rawAccount, hashedPassword)
            lastErr = null
            break
          } catch (err) {
            lastErr = err
            const status = err?.response?.status
            // Chỉ tự thử lại khi là lỗi kết nối/máy chủ (network, timeout, 5xx) —
            // 401/400/403 là do sai thông tin, không thử lại.
            const isTransient = !err.response || status >= 500 || err.code === 'ECONNABORTED'
            if (attempt < maxAttempts && isTransient) {
              await new Promise((r) => setTimeout(r, 500))
              continue
            }
            break
          }
        }
        if (lastErr) throw lastErr
        const redirect = this.$route.query.redirect
        const target = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/dashboard'
        this.$router.replace(target)
      } catch (err) {
        this.error = err.response?.data?.error || 'Đăng nhập thất bại, vui lòng thử lại'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.auth-brand-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
