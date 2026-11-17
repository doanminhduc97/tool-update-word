<template>
  <div class="editor profile-page">
    <PageLoader v-if="pageLoading" title="Đang tải thông tin người được ủy quyền..." />
    <template v-else>
      <div class="card common-card profile-header-card">
        <h2 class="profile-header-title">Thông Tin Người Được Ủy Quyền</h2>
        <p class="profile-desc">
          Thông tin này sẽ tự động điền vào các chức năng tạo hồ sơ, bạn không cần nhập lại mỗi lần.
        </p>
      </div>

      <!-- Card Thông tin cá nhân -->
      <section class="card common-card">
        <form id="profile-form" @submit.prevent="save">
          <div class="form-group">
            <label>Họ tên Người được ủy quyền</label>
            <input type="text" v-model="form.fullName" required placeholder="Ví dụ: NGUYỄN VĂN A">
          </div>
          <div class="form-group">
            <label>Số điện thoại Người được ủy quyền</label>
            <input type="text" v-model="form.phone" placeholder="Ví dụ: 0974255602">
          </div>
          <div class="form-group">
            <label>Giới tính Người được ủy quyền</label>
            <GenderRadio name="profile-gender" v-model="form.gender" />
          </div>
          <div class="form-group">
            <label>Ngày sinh Người được ủy quyền</label>
            <input type="text" v-model="form.birthday" placeholder="DD/MM/YYYY">
          </div>
          <div class="form-group">
            <label>Số định danh Người được ủy quyền</label>
            <input type="text" v-model="form.idNumber" placeholder="Số CCCD (12 chữ số)">
          </div>
          <div class="form-group">
            <label>Tỉnh / Thành phố làm việc</label>
            <ProvinceSelectInput
              v-model="form.provinceCity"
              placeholder="Tìm hoặc chọn Tỉnh / Thành phố..."
            />
          </div>
          <div class="form-group">
            <label>Địa chỉ Người được ủy quyền</label>
            <input type="text" v-model="form.address" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/TP">
          </div>
          <div class="form-group">
            <label>Email đăng nhập (không thể thay đổi)</label>
            <input type="text" :value="auth.state.user?.email || ''" disabled class="input-disabled">
          </div>
        </form>

        <div class="profile-actions-row">
          <button type="button" @click="reload" class="btn-refesh">Hoàn Tác</button>
          <button type="submit" form="profile-form" :disabled="saving" class="btn-primary">
            {{ saving ? 'Đang Lưu...' : 'Lưu Thông Tin' }}
          </button>
        </div>
      </section>

      <!-- Card Đổi Mật Khẩu -->
      <section class="card common-card pwd-card">
        <div class="pwd-card-head">
          <div class="pwd-title-wrap">
            <span class="pwd-icon">🔐</span>
            <h3 class="pwd-title">Đổi Mật Khẩu Đăng Nhập</h3>
          </div>
          <p class="pwd-desc">
            Để bảo vệ an toàn cho tài khoản, mật khẩu mới cần có tối thiểu 8 ký tự.
          </p>
        </div>

        <!-- Thông báo lỗi hoặc thành công -->
        <div v-if="pwdError" class="pwd-alert pwd-alert-error">
          <span class="alert-icon">⚠️</span>
          <span>{{ pwdError }}</span>
        </div>
        <div v-if="pwdSuccess" class="pwd-alert pwd-alert-success">
          <span class="alert-icon">✓</span>
          <span>{{ pwdSuccess }}</span>
        </div>

        <form id="password-form" @submit.prevent="submitChangePassword" class="pwd-form">
          <div class="form-group">
            <label>Mật khẩu hiện tại <span class="req-star">*</span></label>
            <div class="pwd-input-wrap">
              <input
                :type="showCurrent ? 'text' : 'password'"
                v-model="pwdForm.currentPassword"
                placeholder="Nhập mật khẩu đang sử dụng"
                autocomplete="current-password"
                :disabled="pwdLoading"
              />
              <button
                type="button"
                class="btn-toggle-eye"
                @click="showCurrent = !showCurrent"
                :title="showCurrent ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
              >
                {{ showCurrent ? '👁️' : '🙈' }}
              </button>
            </div>
          </div>

          <div class="pwd-row-cols">
            <div class="form-group">
              <label>Mật khẩu mới (tối thiểu 8 ký tự) <span class="req-star">*</span></label>
              <div class="pwd-input-wrap">
                <input
                  :type="showNew ? 'text' : 'password'"
                  v-model="pwdForm.newPassword"
                  placeholder="Nhập mật khẩu mới"
                  autocomplete="new-password"
                  :disabled="pwdLoading"
                />
                <button
                  type="button"
                  class="btn-toggle-eye"
                  @click="showNew = !showNew"
                  :title="showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                >
                  {{ showNew ? '👁️' : '🙈' }}
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Xác nhận mật khẩu mới <span class="req-star">*</span></label>
              <div class="pwd-input-wrap">
                <input
                  :type="showConfirm ? 'text' : 'password'"
                  v-model="pwdForm.confirmPassword"
                  placeholder="Nhập lại mật khẩu mới"
                  autocomplete="new-password"
                  :disabled="pwdLoading"
                />
                <button
                  type="button"
                  class="btn-toggle-eye"
                  @click="showConfirm = !showConfirm"
                  :title="showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'"
                >
                  {{ showConfirm ? '👁️' : '🙈' }}
                </button>
              </div>
            </div>
          </div>

          <div class="pwd-actions-row">
            <button
              type="submit"
              class="btn-primary btn-pwd-submit"
              :disabled="pwdLoading"
            >
              {{ pwdLoading ? 'Đang Đổi Mật Khẩu...' : 'Xác Nhận Đổi Mật Khẩu' }}
            </button>
          </div>
        </form>
      </section>
    </template>
  </div>
</template>

<script>
import { useAuth } from '@/stores/auth';
import { hashPasswordClient } from '@/lib/crypto';
import GenderRadio from '@/components/GenderRadio.vue';
import ProvinceSelectInput from '@/components/ProvinceSelectInput.vue';

export default {
  name: 'Profile',
  components: { GenderRadio, ProvinceSelectInput },
  data() {
    const auth = useAuth();
    const u = auth.state.user || {};
    return {
      auth,
      pageLoading: !auth.state.ready,
      saving: false,
      form: {
        fullName: u.fullName || '',
        phone: u.phone || '',
        gender: u.gender || 'Nam',
        birthday: u.birthday || '',
        idNumber: u.idNumber || '',
        provinceCity: u.provinceCity || '',
        address: u.address || '',
      },
      // State đổi mật khẩu
      pwdForm: {
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      showCurrent: false,
      showNew: false,
      showConfirm: false,
      pwdLoading: false,
      pwdError: '',
      pwdSuccess: '',
    };
  },
  async mounted() {
    if (!this.auth.state.ready) {
      await this.auth.init();
    }
    this.fillFromUser();
    this.pageLoading = false;
  },
  methods: {
    fillFromUser() {
      const u = this.auth.state.user || {};
      this.form = {
        fullName: u.fullName || '',
        phone: u.phone || '',
        gender: u.gender || 'Nam',
        birthday: u.birthday || '',
        idNumber: u.idNumber || '',
        provinceCity: u.provinceCity || '',
        address: u.address || '',
      };
    },
    reload() {
      this.fillFromUser();
    },
    async save() {
      this.saving = true;
      try {
        await this.auth.updateProfile({
          fullName: this.form.fullName.trim(),
          phone: this.form.phone.trim(),
          gender: this.form.gender,
          birthday: this.form.birthday.trim(),
          idNumber: this.form.idNumber.trim(),
          provinceCity: this.form.provinceCity.trim(),
          address: this.form.address.trim(),
        });
        alert('Đã lưu thông tin Người được ủy quyền!');
      } catch (e) {
        const msg = e?.response?.data?.error || e?.response?.data?.message || e.message;
        alert('Không thể lưu: ' + msg);
      } finally {
        this.saving = false;
      }
    },
    async submitChangePassword() {
      this.pwdError = '';
      this.pwdSuccess = '';

      const current = this.pwdForm.currentPassword.trim();
      const next = this.pwdForm.newPassword.trim();
      const confirm = this.pwdForm.confirmPassword.trim();

      if (!current) {
        this.pwdError = 'Vui lòng nhập mật khẩu hiện tại';
        return;
      }
      if (!next) {
        this.pwdError = 'Vui lòng nhập mật khẩu mới';
        return;
      }
      if (next.length < 8) {
        this.pwdError = 'Mật khẩu mới phải có tối thiểu 8 ký tự';
        return;
      }
      if (next === current) {
        this.pwdError = 'Mật khẩu mới không được trùng với mật khẩu hiện tại';
        return;
      }
      if (next !== confirm) {
        this.pwdError = 'Mật khẩu xác nhận không khớp';
        return;
      }

      this.pwdLoading = true;
      try {
        const hashedCurrent = await hashPasswordClient(current);
        const hashedNew = await hashPasswordClient(next);

        await this.auth.changePassword(hashedCurrent, hashedNew);
        this.pwdSuccess = 'Đổi mật khẩu thành công! Hệ thống sẽ chuyển về trang đăng nhập sau 2 giây...';
        this.pwdForm.currentPassword = '';
        this.pwdForm.newPassword = '';
        this.pwdForm.confirmPassword = '';

        setTimeout(() => {
          this.$router.replace('/login');
        }, 2000);
      } catch (err) {
        this.pwdError = err?.response?.data?.error || err?.response?.data?.message || err.message || 'Đổi mật khẩu thất bại, vui lòng thử lại';
      } finally {
        this.pwdLoading = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-page {
  max-width: 900px;
  margin: 0 auto;
}

.profile-header-card {
  margin-bottom: 24px;
  text-align: center;
}

.profile-header-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #0284c7;
  margin: 0;
}

.profile-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 0.5rem;
  line-height: 1.5;
}

.input-disabled {
  background: #f1f5f9;
  color: #64748b;
  cursor: not-allowed;
}

.profile-actions-row {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

/* ---------- CARD ĐỔI MẬT KHẨU ---------- */
.pwd-card {
  margin-top: 28px;
}

.pwd-card-head {
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid #e2e8f0;
}

.pwd-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pwd-icon {
  font-size: 20px;
}

.pwd-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.pwd-desc {
  font-size: 13px;
  color: #64748b;
  margin: 6px 0 0;
}

.req-star {
  color: #ef4444;
  font-weight: 700;
}

/* Alerts */
.pwd-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13.5px;
  margin-bottom: 18px;
  line-height: 1.4;
}

.pwd-alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
}

.pwd-alert-success {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #15803d;
  font-weight: 600;
}

.alert-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.pwd-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pwd-row-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

@media (max-width: 680px) {
  .pwd-row-cols {
    grid-template-columns: 1fr;
  }
}

.pwd-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.pwd-input-wrap input {
  width: 100%;
  height: 40px !important;
  line-height: 38px !important;
  font-family: inherit !important;
  font-size: 14px !important;
  padding: 0 40px 0 12px !important;
  border: 1px solid #d1d5db !important;
  border-radius: 6px !important;
  box-sizing: border-box !important;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.pwd-input-wrap input:focus {
  outline: none;
  border-color: #38bdf8 !important;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2) !important;
}

.btn-toggle-eye {
  position: absolute;
  right: 6px;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  border-radius: 4px;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.15s;
  user-select: none;
}

.btn-toggle-eye:hover {
  opacity: 0.75;
}

.pwd-actions-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.btn-pwd-submit {
  padding: 8px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
}
</style>
