<template>
  <div class="editor profile-page">
    <PageLoader v-if="pageLoading" title="Đang tải thông tin người được ủy quyền..." />
    <template v-else>
      <div class="card common-card" style="margin-bottom: 24px; text-align: center;">
        <h2 style="font-size: 1.25rem; font-weight: 700; color: #0284c7;">Thông Tin Người Được Ủy Quyền</h2>
        <p class="profile-desc">
          Thông tin này sẽ tự động điền vào các chức năng tạo hồ sơ, bạn không cần nhập lại mỗi lần.
        </p>
      </div>

      <section class="card common-card">
        <form id="profile-form" @submit.prevent="save">
          <div class="form-group">
            <label>Họ tên Người được ủy quyền</label>
            <input type="text" v-model="form.fullName" required>
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
            <input type="text" v-model="form.idNumber" placeholder="Số CCCD">
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
            <input type="text" v-model="form.address" placeholder="Số nhà, đường, phường/xã, tỉnh/TP">
          </div>
          <div class="form-group">
            <label>Email (không thể thay đổi)</label>
            <input type="text" :value="auth.state.user?.email || ''" disabled>
          </div>
        </form>
      </section>

      <!-- Nhóm nút bấm đưa ra ngoài card, canh sát lề phải layout -->
      <section class="btn-group">
        <button type="button" @click="reload" class="btn-refesh">Hoàn Tác</button>
        <button type="submit" form="profile-form" @click="save" :disabled="saving" class="btn-primary">
          {{ saving ? 'Đang Lưu...' : 'Lưu Thông Tin' }}
        </button>
      </section>
    </template>
  </div>
</template>

<script>
import { useAuth } from '@/stores/auth';
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
        const msg = e?.response?.data?.message || e.message;
        alert('Không thể lưu: ' + msg);
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>

<style scoped>
.profile-page {
  max-width: 900px;
}
.profile-desc {
  font-size: 13px;
  color: #64748b;
  margin-top: 0.5rem;
}
</style>
