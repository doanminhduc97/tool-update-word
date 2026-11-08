<template>
  <div class="auth-page">
    <div class="auth-card auth-card-wide">
      <h1 class="auth-title">Đăng ký tài khoản</h1>
      <p class="auth-sub">Tạo tài khoản để sử dụng hệ thống</p>

      <!-- Ghi chú ủy quyền -->
      <div class="auth-notice-box">
        <span class="notice-icon">ℹ️</span>
        <div>
          <strong>Lưu ý quan trọng:</strong> Các thông tin đăng ký sẽ được tự động điền vào thông tin Ủy Quyền trong hồ sơ. Vui lòng chú ý.
        </div>
      </div>

      <form class="auth-form" @submit.prevent="submit">
        <div class="auth-form-grid">
          <!-- Cột 1: Thông tin tài khoản & định danh -->
          <label class="auth-field">
            <span>Tên tài khoản (đăng nhập) <span class="req-star">*</span></span>
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
            <span>Họ và tên <span class="req-star">*</span></span>
            <input
              v-model="fullName"
              class="auth-input"
              type="text"
              autocomplete="name"
              placeholder="Ví dụ: Nguyễn Văn A"
              :disabled="loading"
            />
          </label>

          <label class="auth-field">
            <span>Giới tính <span class="req-star">*</span></span>
            <select v-model="gender" class="auth-input" :disabled="loading">
              <option value="">-- Chọn giới tính --</option>
              <option value="Nam">Nam</option>
              <option value="Nữ">Nữ</option>
            </select>
          </label>

          <label class="auth-field">
            <span>Ngày sinh <span class="req-star">*</span></span>
            <input
              v-model="birthday"
              class="auth-input"
              type="text"
              placeholder="Ví dụ: 01/01/1990 hoặc 1990-01-01"
              :disabled="loading"
            />
          </label>

          <label class="auth-field">
            <span>Số định danh / CCCD <span class="req-star">*</span></span>
            <input
              v-model="idNumber"
              class="auth-input"
              type="text"
              placeholder="Ví dụ: 001090012345"
              :disabled="loading"
            />
          </label>

          <label class="auth-field">
            <span>Số điện thoại <span class="req-star">*</span></span>
            <input
              v-model="phone"
              class="auth-input"
              type="tel"
              autocomplete="tel"
              placeholder="Ví dụ: 0912345678"
              :disabled="loading"
            />
          </label>

          <label class="auth-field">
            <span>Email <span class="req-star">*</span></span>
            <input
              v-model="email"
              class="auth-input"
              type="email"
              autocomplete="email"
              placeholder="Ví dụ: you@example.com"
              :disabled="loading"
            />
          </label>

          <label class="auth-field">
            <span>Tỉnh / Thành phố làm việc</span>
            <input
              v-model="provinceCity"
              class="auth-input"
              type="text"
              placeholder="Hà Nội, TP. Hồ Chí Minh..."
              :disabled="loading"
            />
          </label>

          <label class="auth-field field-full">
            <span>Địa chỉ <span class="req-star">*</span></span>
            <input
              v-model="address"
              class="auth-input"
              type="text"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP"
              :disabled="loading"
            />
          </label>

          <label class="auth-field">
            <span>Mật khẩu <span class="req-star">*</span></span>
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
            <span>Xác nhận mật khẩu <span class="req-star">*</span></span>
            <input
              v-model="confirmPassword"
              class="auth-input"
              type="password"
              autocomplete="new-password"
              placeholder="Nhập lại mật khẩu"
              :disabled="loading"
            />
          </label>
        </div>

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
import { hashPasswordClient } from '@/lib/crypto'

export default {
  data() {
    return {
      username: '',
      fullName: '',
      gender: '',
      birthday: '',
      idNumber: '',
      address: '',
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
        !this.gender.trim() ||
        !this.birthday.trim() ||
        !this.idNumber.trim() ||
        !this.address.trim() ||
        !this.phone.trim() ||
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
        const hashedPassword = await hashPasswordClient(this.password)
        await useAuth().register({
          username: this.username.trim(),
          fullName: this.fullName.trim(),
          gender: this.gender.trim(),
          birthday: this.birthday.trim(),
          idNumber: this.idNumber.trim(),
          address: this.address.trim(),
          phone: this.phone.trim(),
          provinceCity: this.provinceCity.trim(),
          email: this.email.trim(),
          password: hashedPassword,
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
