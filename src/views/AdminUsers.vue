<template>
  <div class="admin-page">
    <div class="card admin-card">
      <div class="card-head admin-head">
        <div>
          <h2>👑 Quản lý người dùng</h2>
          <p class="admin-subtitle">Xem danh sách, chỉnh sửa thông tin và nạp tiền cho người dùng trong hệ thống.</p>
        </div>
        <button type="button" class="btn-primary btn-sm" @click="fetchUsers" :disabled="loading">
          {{ loading ? 'Đang tải...' : 'Làm mới' }}
        </button>
      </div>

      <div class="admin-stats" v-if="stats">
        <div class="stat-box">
          <span class="stat-label">Tổng người dùng</span>
          <strong class="stat-value">{{ stats.totalUsers }}</strong>
        </div>
        <div class="stat-box">
          <span class="stat-label">Tổng số dư ví</span>
          <strong class="stat-value text-green">{{ formatMoney(stats.totalBalance) }}</strong>
        </div>
        <div class="stat-box">
          <span class="stat-label">Tổng tiền đã nạp</span>
          <strong class="stat-value">{{ formatMoney(stats.totalDeposited) }}</strong>
        </div>
      </div>

      <div class="admin-filters">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm theo email, username, họ tên, SĐT..."
          @input="onSearchInput"
          @keyup.enter="onFilterChange"
        />
        <select v-model="filters.role" @change="onFilterChange">
          <option value="">Tất cả role</option>
          <option value="NORMAL">NORMAL</option>
          <option value="PRO">PRO</option>
          <option value="ADMIN_SYSTEM">ADMIN_SYSTEM</option>
        </select>
        <select v-model="filters.status" @change="onFilterChange">
          <option value="">Tất cả trạng thái</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="BANNED">BANNED</option>
        </select>
        <button type="button" class="btn-refesh btn-sm" @click="onFilterChange">Tìm kiếm</button>
      </div>

      <div v-if="error" class="admin-error">{{ error }}</div>

      <div class="table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Liên hệ</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th class="text-right">Số dư</th>
              <th class="text-right">Đã nạp</th>
              <th>Đăng nhập cuối</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!loading && users.length === 0">
              <td colspan="8" class="empty-cell">Không có người dùng nào phù hợp.</td>
            </tr>
            <tr v-for="u in users" :key="u.id">
              <td>
                <div class="user-cell">
                  <strong>{{ u.fullName || '(Chưa đặt tên)' }}</strong>
                  <span class="sub-text">@{{ u.username || '—' }}</span>
                </div>
              </td>
              <td>
                <div class="user-cell">
                  <span>{{ u.email }}</span>
                  <span class="sub-text">{{ u.phone || '—' }}</span>
                </div>
              </td>
              <td><span class="badge" :class="roleClass(u.role)">{{ u.role }}</span></td>
              <td><span class="status-badge" :class="'status-' + (u.status || 'active').toLowerCase()">{{ u.status }}</span></td>
              <td class="text-right"><strong class="text-green">{{ formatMoney(u.balance) }}</strong></td>
              <td class="text-right">{{ formatMoney(u.totalDeposited) }}</td>
              <td class="sub-text">{{ formatDate(u.lastLoginAt) }}</td>
              <td>
                <div class="action-buttons">
                  <button type="button" class="btn-action btn-edit" @click="openEdit(u)">Sửa</button>
                  <button type="button" class="btn-action btn-deposit" @click="openDeposit(u)">Nạp tiền</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination" v-if="pagination.totalPages > 1">
        <button
          type="button"
          class="btn-page"
          :disabled="pagination.page <= 1 || loading"
          @click="changePage(1)"
          title="Trang đầu"
        >«</button>
        <button
          type="button"
          class="btn-page"
          :disabled="pagination.page <= 1 || loading"
          @click="changePage(pagination.page - 1)"
          title="Trang trước"
        >‹ Trước</button>

        <div class="page-numbers">
          <button
            v-for="p in visiblePages"
            :key="p"
            type="button"
            class="btn-page-number"
            :class="{ active: p === pagination.page }"
            :disabled="loading"
            @click="changePage(p)"
          >{{ p }}</button>
        </div>

        <button
          type="button"
          class="btn-page"
          :disabled="pagination.page >= pagination.totalPages || loading"
          @click="changePage(pagination.page + 1)"
          title="Trang sau"
        >Sau ›</button>
        <button
          type="button"
          class="btn-page"
          :disabled="pagination.page >= pagination.totalPages || loading"
          @click="changePage(pagination.totalPages)"
          title="Trang cuối"
        >»</button>

        <span class="pagination-info">
          Trang <strong>{{ pagination.page }}</strong> / {{ pagination.totalPages }} (Tổng: <strong>{{ pagination.total }}</strong> user)
        </span>
      </div>
    </div>

    <!-- Modal Sửa thông tin -->
    <div v-if="editModal.open" class="modal-overlay" @click.self="closeEdit">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Chỉnh sửa người dùng</h3>
          <button type="button" class="modal-close" @click="closeEdit">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-info">
            <strong>{{ editModal.target?.fullName || editModal.target?.username }}</strong>
            <span class="sub-text">@{{ editModal.target?.username }} · ID: {{ editModal.target?.id }}</span>
          </div>
          <div class="form-group">
            <label>Họ và tên Người được ủy quyền</label>
            <input v-model="editModal.form.fullName" type="text" />
          </div>
          <div class="form-group">
            <label>Giới tính Người được ủy quyền</label>
            <GenderRadio name="admin-edit-gender" v-model="editModal.form.gender" />
          </div>
          <div class="form-group">
            <label>Ngày sinh Người được ủy quyền</label>
            <input v-model="editModal.form.birthday" type="text" placeholder="01/01/1990" />
          </div>
          <div class="form-group">
            <label>Số định danh / CCCD Người được ủy quyền</label>
            <input v-model="editModal.form.idNumber" type="text" />
          </div>
          <div class="form-group">
            <label>Địa chỉ Người được ủy quyền</label>
            <input v-model="editModal.form.address" type="text" />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input v-model="editModal.form.email" type="email" />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input v-model="editModal.form.phone" type="text" />
          </div>
          <div class="form-group">
            <label>Tỉnh/Thành phố</label>
            <input v-model="editModal.form.provinceCity" type="text" />
          </div>
          <div class="form-group">
            <label>Role</label>
            <select v-model="editModal.form.role">
              <option value="NORMAL">NORMAL</option>
              <option value="PRO">PRO</option>
              <option value="ADMIN_SYSTEM">ADMIN_SYSTEM</option>
            </select>
          </div>
          <div class="form-group">
            <label>Trạng thái</label>
            <select v-model="editModal.form.status">
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
              <option value="BANNED">BANNED</option>
            </select>
          </div>
          <div class="form-group">
            <label>Mật khẩu mới (để trống nếu không đổi)</label>
            <input v-model="editModal.form.newPassword" type="password" placeholder="Tối thiểu 6 ký tự" />
          </div>
          <p v-if="editModal.error" class="modal-error">{{ editModal.error }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-refesh" @click="closeEdit">Hủy</button>
          <button type="button" class="btn-primary" @click="submitEdit" :disabled="editModal.saving">
            {{ editModal.saving ? 'Đang lưu...' : 'Lưu thay đổi' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Nạp tiền -->
    <div v-if="depositModal.open" class="modal-overlay" @click.self="closeDeposit">
      <div class="modal-card">
        <div class="modal-header">
          <h3>Nạp / Điều chỉnh số dư</h3>
          <button type="button" class="modal-close" @click="closeDeposit">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-info">
            <strong>{{ depositModal.target?.fullName || depositModal.target?.username }}</strong>
            <span class="sub-text">@{{ depositModal.target?.username }} · Số dư hiện tại: <strong class="text-green">{{ formatMoney(depositModal.target?.balance) }}</strong></span>
            <span class="sub-text" v-if="depositModal.form.amount">
              Số dư sau khi nạp: <strong class="text-blue">{{ formatMoney((depositModal.target?.balance || 0) + (Number(depositModal.form.amount) || 0)) }}</strong>
              <span class="text-muted"> ({{ formatMoney(depositModal.target?.balance) }} + {{ formatMoney(depositModal.form.amount) }})</span>
            </span>
          </div>
          <div class="form-group">
            <label>Số tiền cần nạp thêm (VND)</label>
            <input v-model.number="depositModal.form.amount" type="number" step="1000" placeholder="VD: 50000 (nhập số âm để trừ)" />
            <small class="sub-text">Số tiền này sẽ được cộng trực tiếp vào số dư hiện tại của người dùng.</small>
          </div>
          <div class="quick-amounts">
            <button type="button" class="chip" @click="depositModal.form.amount = 20000">+20.000đ</button>
            <button type="button" class="chip" @click="depositModal.form.amount = 50000">+50.000đ</button>
            <button type="button" class="chip" @click="depositModal.form.amount = 100000">+100.000đ</button>
            <button type="button" class="chip" @click="depositModal.form.amount = 200000">+200.000đ</button>
            <button type="button" class="chip" @click="depositModal.form.amount = 500000">+500.000đ</button>
          </div>
          <div class="form-group">
            <label>Ghi chú (tùy chọn)</label>
            <input v-model="depositModal.form.description" type="text" placeholder="VD: Nạp tiền hỗ trợ khách hàng" />
          </div>
          <p v-if="depositModal.error" class="modal-error">{{ depositModal.error }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-refesh" @click="closeDeposit">Hủy</button>
          <button type="button" class="btn-primary" @click="submitDeposit" :disabled="depositModal.saving">
            {{ depositModal.saving ? 'Đang xử lý...' : 'Xác nhận' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import http from '@/lib/http'
import { hashPasswordClient } from '@/lib/crypto'

export default {
  name: 'AdminUsers',
  data() {
    return {
      users: [],
      stats: null,
      loading: false,
      error: '',
      searchTimer: null,
      filters: {
        search: '',
        role: '',
        status: '',
      },
      pagination: {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 1,
      },
      editModal: {
        open: false,
        target: null,
        saving: false,
        error: '',
        form: {
          fullName: '',
          gender: '',
          birthday: '',
          idNumber: '',
          address: '',
          email: '',
          phone: '',
          provinceCity: '',
          role: 'NORMAL',
          status: 'ACTIVE',
          newPassword: '',
        },
      },
      depositModal: {
        open: false,
        target: null,
        saving: false,
        error: '',
        form: {
          amount: 50000,
          description: '',
        },
      },
    }
  },
  mounted() {
    this.fetchUsers()
  },
  computed: {
    visiblePages() {
      const total = this.pagination.totalPages || 1
      const current = this.pagination.page || 1
      const maxButtons = 5
      let start = Math.max(1, current - Math.floor(maxButtons / 2))
      let end = start + maxButtons - 1
      if (end > total) {
        end = total
        start = Math.max(1, end - maxButtons + 1)
      }
      const pages = []
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      return pages
    },
  },
  beforeUnmount() {
    clearTimeout(this.searchTimer)
  },
  methods: {
    formatMoney(val) {
      return (Number(val) || 0).toLocaleString('vi-VN') + 'đ'
    },
    formatDate(val) {
      if (!val) return '—'
      try {
        return new Date(val).toLocaleString('vi-VN')
      } catch {
        return '—'
      }
    },
    roleClass(role) {
      if (role === 'ADMIN_SYSTEM') return 'tag-admin'
      if (role === 'PRO') return 'tag-pro'
      return 'tag-normal'
    },
    async fetchUsers() {
      this.loading = true
      this.error = ''
      try {
        const { data } = await http.get('/admin/users', {
          params: {
            page: this.pagination.page,
            limit: this.pagination.limit,
            search: this.filters.search || undefined,
            role: this.filters.role || undefined,
            status: this.filters.status || undefined,
          },
        })
        this.users = data.users || []
        this.pagination = data.pagination || this.pagination
        this.stats = data.stats || null
      } catch (err) {
        this.error = err?.response?.data?.error || err?.message || 'Không thể tải danh sách người dùng'
      } finally {
        this.loading = false
      }
    },
    onSearchInput() {
      clearTimeout(this.searchTimer)
      this.searchTimer = setTimeout(() => {
        this.onFilterChange()
      }, 350)
    },
    onFilterChange() {
      clearTimeout(this.searchTimer)
      this.pagination.page = 1
      this.fetchUsers()
    },
    changePage(page) {
      if (page < 1 || (this.pagination.totalPages && page > this.pagination.totalPages) || page === this.pagination.page) {
        return
      }
      this.pagination.page = page
      this.fetchUsers()
    },
    openEdit(user) {
      this.editModal.target = user
      this.editModal.form = {
        fullName: user.fullName || '',
        gender: user.gender || '',
        birthday: user.birthday || '',
        idNumber: user.idNumber || '',
        address: user.address || '',
        email: user.email || '',
        phone: user.phone || '',
        provinceCity: user.provinceCity || '',
        role: user.role || 'NORMAL',
        status: user.status || 'ACTIVE',
        newPassword: '',
      }
      this.editModal.error = ''
      this.editModal.open = true
    },
    closeEdit() {
      this.editModal.open = false
      this.editModal.target = null
      this.editModal.error = ''
    },
    async submitEdit() {
      if (!this.editModal.target) return
      this.editModal.saving = true
      this.editModal.error = ''
      try {
        const payload = { ...this.editModal.form }
        if (!payload.newPassword) {
          delete payload.newPassword
        } else {
          payload.newPassword = await hashPasswordClient(payload.newPassword)
        }
        await http.patch(`/admin/users/${this.editModal.target.id}`, payload)
        this.closeEdit()
        await this.fetchUsers()
      } catch (err) {
        this.editModal.error = err?.response?.data?.error || err?.message || 'Cập nhật thất bại'
      } finally {
        this.editModal.saving = false
      }
    },
    openDeposit(user) {
      this.depositModal.target = user
      this.depositModal.form = {
        amount: 50000,
        description: '',
      }
      this.depositModal.error = ''
      this.depositModal.open = true
    },
    closeDeposit() {
      this.depositModal.open = false
      this.depositModal.target = null
      this.depositModal.error = ''
    },
    async submitDeposit() {
      if (!this.depositModal.target) return
      this.depositModal.saving = true
      this.depositModal.error = ''
      try {
        await http.post(`/admin/users/${this.depositModal.target.id}/deposit`, {
          amount: this.depositModal.form.amount,
          description: this.depositModal.form.description || undefined,
        })
        this.closeDeposit()
        await this.fetchUsers()
      } catch (err) {
        this.depositModal.error = err?.response?.data?.error || err?.message || 'Nạp tiền thất bại'
      } finally {
        this.depositModal.saving = false
      }
    },
  },
}
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 24px auto;
  padding: 0 16px;
}
.admin-card {
  padding: 20px;
}
.admin-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}
.admin-head h2 {
  margin: 0 0 4px 0;
}
.admin-subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}
.admin-stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.stat-box {
  background: #f7f9fc;
  border: 1px solid #e6ecf2;
  border-radius: 10px;
  padding: 12px 14px;
}
.stat-label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 4px;
}
.stat-value {
  font-size: 18px;
}
.admin-filters {
  display: grid;
  grid-template-columns: 1fr 180px 180px auto;
  gap: 10px;
  margin-bottom: 14px;
}
.admin-filters input,
.admin-filters select {
  padding: 8px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
}
.table-wrap {
  overflow-x: auto;
}
.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.admin-table th,
.admin-table td {
  border-bottom: 1px solid #eef2f6;
  padding: 10px 8px;
  text-align: left;
  vertical-align: middle;
}
.admin-table th {
  background: #fafbfd;
  color: #444;
  font-weight: 600;
  white-space: nowrap;
}
.user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sub-text {
  color: #777;
  font-size: 12px;
}
.text-right {
  text-align: right !important;
}
.text-green {
  color: #0a8f3c;
}
.text-blue {
  color: #0284c7;
}
.text-muted {
  color: #64748b;
  font-size: 12px;
}
.empty-cell {
  text-align: center;
  color: #777;
  padding: 24px 8px !important;
}
.action-buttons {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.btn-action {
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;
  color: #fff;
}
.btn-edit {
  background: #2563eb;
}
.btn-deposit {
  background: #0a8f3c;
}
.btn-sm {
  padding: 8px 12px;
  font-size: 14px;
}
.admin-error,
.modal-error {
  background: #fff1f0;
  color: #cf1322;
  border: 1px solid #ffa39e;
  padding: 8px 10px;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 16px;
  font-size: 14px;
  flex-wrap: wrap;
}
.btn-page {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13.5px;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: #9ca3af;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
.page-numbers {
  display: flex;
  gap: 4px;
}
.btn-page-number {
  min-width: 34px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #d1d5db;
  background: #fff;
  color: #374151;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s;

  &:hover:not(:disabled) {
    background: #f3f4f6;
  }

  &.active {
    background: #0284c7;
    color: #fff;
    border-color: #0284c7;
    font-weight: 700;
  }

  &:disabled {
    cursor: not-allowed;
  }
}
.pagination-info {
  margin-left: 10px;
  color: #64748b;
  font-size: 13px;
}
.status-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}
.status-active {
  background: #e6f7ed;
  color: #0a8f3c;
}
.status-inactive {
  background: #fff7e6;
  color: #ad6800;
}
.status-banned {
  background: #fff1f0;
  color: #cf1322;
}
.tag-admin { background: #fee2e2; color: #b91c1c; }
.tag-pro { background: #fef3c7; color: #92400e; }
.tag-normal { background: #e5e7eb; color: #374151; }
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 16px;
}
.modal-card {
  background: #fff;
  border-radius: 12px;
  width: 100%;
  max-width: 520px;
  max-height: 90vh;
  overflow: auto;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #eef2f6;
}
.modal-header h3 {
  margin: 0;
}
.modal-close {
  border: none;
  background: transparent;
  font-size: 22px;
  cursor: pointer;
  line-height: 1;
  color: #555;
}
.modal-body {
  padding: 14px 16px;
}
.modal-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  background: #f7f9fc;
  border: 1px solid #e6ecf2;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
}
.form-group {
  margin-bottom: 12px;
}
.form-group:has(.gender-radio-group) {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  min-height: 38px;
}
.form-group:has(.gender-radio-group) label {
  margin-bottom: 0;
  white-space: nowrap;
}
.form-group label {
  display: block;
  font-size: 13px;
  color: #444;
  margin-bottom: 4px;
  font-weight: 600;
}
.form-group input,
.form-group select {
  width: 100%;
  box-sizing: border-box;
  padding: 9px 10px;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 14px;
}
.quick-amounts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.chip {
  border: 1px solid #cfe3ff;
  background: #f0f7ff;
  color: #1d4ed8;
  border-radius: 999px;
  padding: 5px 10px;
  font-size: 13px;
  cursor: pointer;
}
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 12px 16px 16px;
  border-top: 1px solid #eef2f6;
}
@media (max-width: 900px) {
  .admin-stats { grid-template-columns: 1fr; }
  .admin-filters { grid-template-columns: 1fr; }
  .admin-head { flex-direction: column; }
}
</style>
