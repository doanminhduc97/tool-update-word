<template>
  <div class="user-menu" ref="root">
    <!-- Hiển thị nhanh số dư ví & role trên header kèm nút Nạp tiền -->
    <div class="wallet-badge" :title="`Role: ${roleLabel} | Phí xuất: ${pricingText}`">
      <span class="role-tag" :class="roleClass">{{ roleLabel }}</span>
      <span class="balance-amount">💰 {{ formattedBalance }}</span>
      <button type="button" class="btn-deposit-badge" @click="openDepositModal" title="Nạp tiền vào tài khoản">
        + Nạp tiền
      </button>
    </div>

    <button class="user-menu-toggle" type="button" @click="toggle">
      <span class="user-avatar">{{ initials }}</span>
      <span class="user-name">{{ displayName }}</span>
      <span class="caret"></span>
    </button>

    <div v-show="open" class="user-menu-list">
      <div class="user-menu-head">
        <strong>{{ displayName }}</strong>
        <span class="user-menu-sub">@{{ user?.username || 'user' }} · {{ user?.email }}</span>
      </div>

      <div class="user-wallet-info">
        <div class="wallet-row">
          <span>Gói tài khoản:</span>
          <span class="badge" :class="roleClass">{{ roleLabel }}</span>
        </div>
        <div class="wallet-row">
          <span>Số dư trong ví:</span>
          <strong class="text-green">{{ formattedBalance }}</strong>
        </div>
        <div class="wallet-row">
          <span>Tổng tiền đã nạp:</span>
          <span>{{ formattedDeposited }}</span>
        </div>
        <div class="wallet-row">
          <span>Phí mỗi lần tạo file:</span>
          <span><strong>{{ pricingText }}</strong></span>
        </div>
        <button type="button" class="btn-deposit-full" @click="openDepositModal">
          💳 Nạp thêm tiền vào ví
        </button>
      </div>

      <a v-if="user?.role === 'ADMIN_SYSTEM'" class="user-menu-item admin-item" @click="goAdminUsers">
        <span class="admin-icon">👑</span>
        <span>Quản lý người dùng</span>
      </a>
      <a class="user-menu-item logout-item" @click="doLogout">
        <span class="logout-icon">🚪</span>
        <span>Đăng xuất</span>
      </a>
    </div>

    <!-- Modal Nạp Tiền -->
    <DepositModal ref="depositModal" />
  </div>
</template>

<script>
import { useAuth } from '@/stores/auth'
import DepositModal from '@/components/DepositModal.vue'

export default {
  components: { DepositModal },
  data() {
    return {
      open: false,
      auth: useAuth(),
    }
  },
  computed: {
    user() {
      return this.auth.state.user
    },
    displayName() {
      return this.user?.fullName || this.user?.username || this.user?.email || 'Tài khoản'
    },
    initials() {
      const source = this.user?.fullName || this.user?.username || this.user?.email || '?'
      return source.trim().charAt(0).toUpperCase()
    },
    roleLabel() {
      const role = this.user?.role
      if (role === 'ADMIN_SYSTEM') return 'ADMIN SYSTEM'
      if (role === 'PRO') return 'PRO'
      return 'THƯỜNG'
    },
    roleClass() {
      const role = this.user?.role
      if (role === 'ADMIN_SYSTEM') return 'tag-admin'
      if (role === 'PRO') return 'tag-pro'
      return 'tag-normal'
    },
    pricingText() {
      const role = this.user?.role
      if (role === 'ADMIN_SYSTEM') return '0đ (Free)'
      if (role === 'PRO') return '5.000đ / lần'
      return '2.000đ / lần'
    },
    formattedBalance() {
      const bal = this.user?.balance ?? 0
      return bal.toLocaleString('vi-VN') + 'đ'
    },
    formattedDeposited() {
      const dep = this.user?.totalDeposited ?? 0
      return dep.toLocaleString('vi-VN') + 'đ'
    },
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick)
    window.addEventListener('open-deposit-modal', this.openDepositModal)
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
    window.removeEventListener('open-deposit-modal', this.openDepositModal)
  },
  methods: {
    toggle(e) {
      e.stopPropagation()
      this.open = !this.open
    },
    handleOutsideClick(e) {
      if (this.$refs.root && !this.$refs.root.contains(e.target)) {
        this.open = false
      }
    },
    openDepositModal() {
      this.open = false
      if (this.$refs.depositModal) {
        this.$refs.depositModal.open()
      }
    },
    goAdminUsers() {
      this.open = false
      if (this.$route.path !== '/admin/users') {
        this.$router.push('/admin/users')
      }
    },
    async doLogout() {
      this.open = false
      await this.auth.logout()
      this.$router.replace('/login')
    },
  },
}
</script>
