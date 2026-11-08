<template>
  <div class="auth-page">
    <div class="auth-card">
      <h1 class="auth-title">Đăng ký</h1>
      <p class="auth-sub">Tạo tài khoản để sử dụng hệ thống</p>

      <form class="auth-form" @submit.prevent="submit">
        <label class="auth-field">
          <span>Tên tài khoản (đăng nhập) *</span>
          <input
            v-model="username"
            class="auth-input"
            type="text"
            autocomplete="username"
            placeholder="Ví dụ: nguyenvana hoặc an_legal"
            :disabled="loading"
          />
        </label>

        <label class="auth-field">
          <span>Họ và tên *</span>
          <input
            v-model="fullName"
            class="auth-input"
            type="text"
            autocomplete="name"
            placeholder="Nguyễn Văn A"
            :disabled="loading"
          />
        </label>

        <label class="auth-field">
          <span>Số điện thoại cá nhân *</span>
          <input
            v-model="phone"
            class="auth-input"
            type="tel"
            autocomplete="tel"
            placeholder="0912345678"
            :disabled="loading"
          />
        </label>

        <label class="auth-field">
          <span>Tỉnh / Thành phố làm việc *</span>
          <input
            v-model="provinceCity"
            class="auth-input"
            type="text"
            placeholder="Hà Nội, TP. Hồ Chí Minh, Đà Nẵng..."
            :disabled="loading"
          />
        </label>

        <label class="auth-field">
          <span>Email (nhận thông báo & bảo trì) *</span>
          <input
            v-model="email"
            class="auth-input"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
            :disabled="loading"
          />
        </label>

        <label class="auth-field">
          <span>Mật khẩu *</span>
          <input
            v-model="password"
            class="auth-input"
            type="password"
            autocomplete="new-password"
            placeholder="Tối thiểu 8 ký tự"
            :disabled="loading"
          />
        </label>

        <label class="auth-field">
          <span>Xác nhận mật khẩu *</span>
          <input
            v-model="confirmPassword"
            class="auth-input"
            type="password"
            autocomplete="new-password"
            placeholder="Nhập lại mật khẩu"
            :disabled="loading"
          />
        </label>

        <p v-if="error" class="auth-error">{{ error }}</p>

        <button class="auth-button" type="submit" :disabled="loading">
          {{ loading ? 'Đang tạo tài khoản...' : 'Đăng ký' }}
        </button>
      </form>

      <p class="auth-footer">
        Đã có tài khoản?
        <router-link to="/login">Đăng nhập</router-link>
      </p>
    </div>
  </div>
</template>

<script>
import { useAuth } from '@/stores/auth'

export default {
  data() {
    return {
      username: '',
      fullName: '',
      phone: '',
      provinceCity: '',
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      loading: false,
    }
  },
  methods: {
    async submit() {
      this.error = ''
      if (
        !this.username.trim() ||
        !this.fullName.trim() ||
        !this.phone.trim() ||
        !this.provinceCity.trim() ||
        !this.email.trim() ||
        !this.password
      ) {
        this.error = 'Vui lòng điền đầy đủ các thông tin bắt buộc (*)'
        return
      }
      if (this.username.trim().length < 3) {
        this.error = 'Tên tài khoản tối thiểu 3 ký tự'
        return
      }
      if (this.password.length < 8) {
        this.error = 'Mật khẩu tối thiểu 8 ký tự'
        return
      }
      if (this.password !== this.confirmPassword) {
        this.error = 'Mật khẩu xác nhận không khớp'
        return
      }

      this.loading = true
      try {
        await useAuth().register({
          username: this.username.trim(),
          fullName: this.fullName.trim(),
          phone: this.phone.trim(),
          provinceCity: this.provinceCity.trim(),
          email: this.email.trim(),
          password: this.password,
        })
        this.$router.replace('/')
      } catch (err) {
        this.error = err.response?.data?.error || 'Đăng ký thất bại, vui lòng thử lại'
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
