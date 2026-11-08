<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Đăng nhập</h1>
      <p class="auth-sub">Hệ thống tạo hồ sơ pháp lý tự động</p>

      <form class="auth-form" @submit.prevent="submit">
        <label class="auth-field">
          <span>Tài khoản hoặc Email</span>
          <input
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

export default {
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
      if (!this.account || !this.password) {
        this.error = 'Vui lòng nhập tài khoản/email và mật khẩu'
        return
      }
      this.loading = true
      try {
        await useAuth().login(this.account, this.password)
        const redirect = this.$route.query.redirect
        const target = typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/'
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
