<template>
  <div class="dashboard-page">
    <!-- 1. HERO & METRIC STATS -->
    <div class="dashboard-hero">
      <div class="hero-main">
        <div class="user-greeting">
          <div class="greeting-text">
            <h2>Xin chào, <strong>{{ displayName }}</strong> 👋</h2>
            <p class="greeting-sub">Chào mừng bạn trở lại với Hệ thống soạn thảo hồ sơ pháp lý TUW</p>
          </div>
          <span class="role-badge" :class="roleClass">{{ roleLabel }}</span>
        </div>

        <div class="hero-metrics-grid">
          <!-- Card 1: Số dư ví -->
          <div class="metric-card metric-balance">
            <div class="metric-head">
              <span class="metric-title">Số dư khả dụng</span>
              <div class="metric-head-actions">
                <button
                  type="button"
                  class="btn-refresh-balance"
                  :class="{ 'spinning': isRefreshing }"
                  @click="manualRefresh"
                  title="Cập nhật số dư mới nhất từ hệ thống"
                >
                  🔄
                </button>
                <span class="metric-icon">💰</span>
              </div>
            </div>
            <div class="metric-val text-green">{{ formattedBalance }}</div>
            <div class="metric-foot">
              <span class="metric-sub">Tổng nạp: {{ formattedDeposited }}</span>
              <button type="button" class="btn-deposit-quick" @click="openDepositModal">
                + Nạp tiền
              </button>
            </div>
          </div>

          <!-- Card 2: Tổng hồ sơ đã tạo -->
          <div class="metric-card">
            <div class="metric-head">
              <span class="metric-title">Tổng hồ sơ đã tạo</span>
              <div class="metric-head-actions">
                <button
                  type="button"
                  class="btn-refresh-balance"
                  :class="{ 'spinning': isRefreshing }"
                  @click="manualRefresh"
                  title="Cập nhật số lượt hồ sơ đã tạo"
                >
                  🔄
                </button>
                <span class="metric-icon">📄</span>
              </div>
            </div>
            <div class="metric-val">{{ exportCount }} <span class="val-unit">lượt</span></div>
            <div class="metric-foot">
              <span class="metric-sub">
                Gần nhất: {{ lastExportFormatted }}
              </span>
            </div>
          </div>

          <!-- Card 3: Phí xuất hồ sơ -->
          <div class="metric-card">
            <div class="metric-head">
              <span class="metric-title">Phí xuất hồ sơ</span>
              <div class="metric-head-actions">
                <button
                  type="button"
                  class="btn-refresh-balance"
                  :class="{ 'spinning': isRefreshing }"
                  @click="manualRefresh"
                  title="Cập nhật biểu phí và gói tài khoản mới nhất"
                >
                  🔄
                </button>
                <span class="metric-icon">🏷️</span>
              </div>
            </div>
            <div class="metric-val" :class="{ 'text-free': isFree }">{{ pricingText }}</div>
            <div class="metric-foot">
              <span class="metric-sub">
                {{ isFree ? 'Đặc quyền miễn phí trọn đời' : 'Trừ tự động khi xuất bộ Word' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. QUICK LAUNCHER (DANH MỤC PHÂN HỆ HỒ SƠ) -->
    <section class="section-launcher">
      <div class="launcher-header">
        <div class="header-titles">
          <h3>Trình Khởi Chạy Hồ Sơ ({{ modules.length }} Phân Hệ Nghiệp Vụ)</h3>
          <p>Chọn phân hệ hoặc gõ tìm kiếm để bắt đầu soạn thảo hồ sơ tức thì</p>
        </div>

        <!-- Ô TÌM KIẾM TỨC THÌ (INSTANT FILTER) -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            v-model="searchQuery"
            placeholder="Tìm theo tên hồ sơ, loại cty (vd: 1tv, giải thể, tăng vốn...)"
            class="search-input"
          />
          <button v-if="searchQuery" class="btn-clear-search" @click="searchQuery = ''">✕</button>
        </div>
      </div>

      <!-- TABS LỌC NHÓM -->
      <div class="category-tabs">
        <button
          class="cat-tab"
          :class="{ active: selectedCategory === 'all' }"
          @click="selectedCategory = 'all'"
        >
          Tất cả ({{ modules.length }})
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          class="cat-tab"
          :class="{ active: selectedCategory === cat.id }"
          @click="selectedCategory = cat.id"
        >
          {{ cat.name }} ({{ countByCategory(cat.id) }})
        </button>
      </div>

      <!-- LƯỚI CARD CÁC PHÂN HỆ HỒ SƠ -->
      <div v-if="filteredModules.length > 0" class="modules-grid">
        <div
          v-for="item in filteredModules"
          :key="item.path"
          class="module-card"
          @click="goTo(item.path)"
        >
          <div class="card-badge-row">
            <span class="cat-pill" :class="item.category">{{ getCategoryName(item.category) }}</span>
            <span class="doc-count-tag">{{ item.docs.length }} biểu mẫu</span>
          </div>

          <h4 class="module-title">{{ item.name }}</h4>
          <p class="module-desc">{{ item.description }}</p>

          <div class="module-docs-preview">
            <span class="docs-label">Các tệp .docx chuẩn xuất ra:</span>
            <ul class="docs-list">
              <li v-for="(doc, dIdx) in item.docs" :key="dIdx">
                <span class="bullet">▪</span> {{ doc }}
              </li>
            </ul>
          </div>

          <div class="module-footer">
            <span class="btn-launch">
              Soạn thảo hồ sơ ➔
            </span>
          </div>
        </div>
      </div>

      <!-- TRẠNG THÁI KHÔNG TÌM THẤY -->
      <div v-else class="empty-search-state">
        <span class="empty-icon">📂</span>
        <p>Không tìm thấy phân hệ nào khớp với từ khóa "<strong>{{ searchQuery }}</strong>"</p>
        <button class="btn-reset-filter" @click="resetFilter">Xóa bộ lọc tìm kiếm</button>
      </div>
    </section>

    <!-- 3. LỊCH SỬ GIAO DỊCH VÍ GẦN ĐÂY -->
    <section class="section-transactions">
      <div class="trans-header">
        <div class="trans-title-wrap">
          <span class="trans-icon">💳</span>
          <h3>Biến Động Số Dư Gần Đây</h3>
        </div>
        <span class="trans-sub">5 giao dịch gần nhất</span>
      </div>

      <div class="trans-body">
        <div v-if="loadingTrans" class="trans-loading">
          <div class="spinner-small"></div>
          <span>Đang tải lịch sử ví...</span>
        </div>

        <div v-else-if="transactions.length === 0" class="trans-empty">
          <span>Chưa có biến động số dư nào phát sinh.</span>
        </div>

        <div v-else class="trans-table-wrap">
          <table class="trans-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Loại giao dịch</th>
                <th>Nội dung</th>
                <th class="text-right">Số tiền</th>
                <th class="text-right">Số dư sau GD</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="t in transactions" :key="t.id">
                <td class="col-date">{{ formatDate(t.createdAt) }}</td>
                <td>
                  <span class="trans-tag" :class="t.type">
                    {{ getTransTypeLabel(t.type) }}
                  </span>
                </td>
                <td class="col-desc">{{ t.description || 'Giao dịch ví' }}</td>
                <td class="text-right font-mono" :class="t.amount > 0 ? 'amount-plus' : 'amount-minus'">
                  {{ t.amount > 0 ? '+' : '' }}{{ t.amount.toLocaleString('vi-VN') }}đ
                </td>
                <td class="text-right font-mono text-muted">
                  {{ t.balanceAfter.toLocaleString('vi-VN') }}đ
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { useAuth } from '@/stores/auth'
import http from '@/lib/http'

export default {
  name: 'Dashboard',
  data() {
    return {
      auth: useAuth(),
      searchQuery: '',
      selectedCategory: 'all',
      transactions: [],
      loadingTrans: false,
      isRefreshing: false,
      categories: [
        { id: 'thanh-lap', name: 'Thành Lập Mới' },
        { id: 'thay-doi-csh', name: 'Đổi CSH / Địa Chỉ' },
        { id: 'von', name: 'Tăng / Giảm Vốn' },
        { id: 'giai-the', name: 'Giải Thể' },
        { id: 'tam-ngung', name: 'Tạm Ngừng' },
      ],
      modules: [
        {
          name: '1. Đăng ký kinh doanh 1 thành viên',
          path: '/',
          category: 'thanh-lap',
          description: 'Soạn hồ sơ thành lập mới Công ty TNHH 1 Thành viên (chủ sở hữu cá nhân/tổ chức).',
          docs: ['Điều lệ.docx', 'GĐN đăng ký doanh nghiệp.docx', 'Giấy ủy quyền.docx', 'Danh sách CSH hưởng lợi.docx'],
        },
        {
          name: '2. Đăng ký kinh doanh nhiều thành viên',
          path: '/dkkdntv',
          category: 'thanh-lap',
          description: 'Thành lập Công ty TNHH 2 Thành viên trở lên (từ 2 đến 50 thành viên góp vốn).',
          docs: ['Điều lệ.docx', 'GĐN đăng ký doanh nghiệp.docx', 'Danh sách thành viên.docx', 'Giấy ủy quyền.docx', 'Danh sách CSH hưởng lợi.docx'],
        },
        {
          name: '3. Thành lập công ty cổ phần',
          path: '/tlctcp',
          category: 'thanh-lap',
          description: 'Thành lập mới Công ty Cổ phần (tối thiểu 3 cổ đông sáng lập, cơ cấu HĐQT/BKS).',
          docs: ['Điều lệ.docx', 'GĐN đăng ký doanh nghiệp.docx', 'Danh sách cổ đông sáng lập.docx', 'Giấy ủy quyền.docx', 'Danh sách CSH hưởng lợi.docx'],
        },
        {
          name: '4. Cập nhật Chủ sở hữu hưởng lợi (CSH)',
          path: '/csh-huong-loi',
          category: 'thay-doi-csh',
          description: 'Kê khai và cập nhật danh sách cá nhân sở hữu từ 25% vốn hoặc cổ phần theo luật.',
          docs: ['GĐN đăng ký thay đổi nội dung ĐKDN.docx', 'Danh sách CSH hưởng lợi (từ 25%).docx', 'Giấy ủy quyền.docx'],
        },
        {
          name: '5. Đổi CSH, địa chỉ cty, địa chỉ đại diện',
          path: '/csh-dia-chi',
          category: 'thay-doi-csh',
          description: 'Cập nhật đồng thời CSH hưởng lợi, chuyển địa chỉ trụ sở chính và địa chỉ nơi ở đại diện PL.',
          docs: ['GĐN thay đổi nội dung ĐKDN.docx', 'Danh sách CSH hưởng lợi.docx', 'Giấy ủy quyền.docx'],
        },
        {
          name: '6. Thay đổi CSH, đại diện cty 1TV',
          path: '/thay-doi-csh-1tv',
          category: 'thay-doi-csh',
          description: 'Chuyển nhượng toàn bộ vốn chủ sở hữu và bổ nhiệm người đại diện PL mới cho Cty 1TV.',
          docs: ['Thông báo thay đổi nội dung ĐKDN.docx', 'Quyết định của CSH.docx', 'Giấy đề nghị CSH.docx', 'Hợp đồng chuyển nhượng vốn.docx'],
        },
        {
          name: '7. Hợp đồng chuyển nhượng & BB thanh lý',
          path: '/hdcn-bbtl',
          category: 'thay-doi-csh',
          description: 'Soạn thảo trọn bộ Hợp đồng chuyển nhượng phần vốn góp và Biên bản thanh lý hợp đồng.',
          docs: ['Hợp đồng chuyển nhượng phần vốn góp.docx', 'Biên bản thanh lý hợp đồng chuyển nhượng.docx'],
        },
        {
          name: '8. Tăng vốn Cty 1 Thành Viên',
          path: '/tang-von-1tv',
          category: 'von',
          description: 'Hồ sơ đăng ký tăng vốn điều lệ do chủ sở hữu góp thêm hoặc huy động vốn.',
          docs: ['Thông báo thay đổi nội dung ĐKDN.docx', 'Quyết định của Chủ sở hữu.docx', 'Giấy ủy quyền.docx'],
        },
        {
          name: '9. Tăng vốn Cty 2 Thành Viên',
          path: '/tang-von-2tv',
          category: 'von',
          description: 'Tăng vốn điều lệ công ty TNHH 2TV: tiếp nhận thành viên mới hoặc thành viên hiện hữu góp thêm.',
          docs: ['Thông báo thay đổi nội dung ĐKDN.docx', 'Nghị quyết HĐTV.docx', 'Biên bản họp HĐTV.docx', 'Danh sách thành viên góp vốn.docx'],
        },
        {
          name: '10. Tăng vốn Cty Cổ Phần',
          path: '/tang-von-cp',
          category: 'von',
          description: 'Chào bán thêm cổ phần để tăng vốn điều lệ công ty cổ phần cho cổ đông hiện hữu hoặc bên ngoài.',
          docs: ['Thông báo thay đổi nội dung ĐKDN.docx', 'Nghị quyết ĐHĐCĐ.docx', 'Biên bản họp ĐHĐCĐ.docx'],
        },
        {
          name: '11. Giảm vốn Cty 1 Thành Viên',
          path: '/giam-von-1tv',
          category: 'von',
          description: 'Thủ tục hoàn trả một phần vốn góp sau hơn 2 năm hoạt động liên tục hoặc không góp đủ 90 ngày.',
          docs: ['Thông báo thay đổi nội dung ĐKDN.docx', 'Quyết định của Chủ sở hữu.docx', 'Báo cáo tài chính cam kết thanh toán nợ.docx'],
        },
        {
          name: '12. Giảm vốn Cty 2 Thành Viên',
          path: '/giam-von-2tv',
          category: 'von',
          description: 'Giảm vốn điều lệ Cty 2TV trở lên kèm danh sách thành viên sau khi giảm.',
          docs: ['Thông báo thay đổi nội dung ĐKDN.docx', 'Nghị quyết HĐTV.docx', 'Biên bản họp HĐTV.docx', 'Danh sách thành viên.docx'],
        },
        {
          name: '13. Giảm vốn Cty Cổ Phần',
          path: '/giam-von-cp',
          category: 'von',
          description: 'Giảm vốn công ty cổ phần bằng hình thức mua lại cổ phần hoặc hoàn vốn theo luật định.',
          docs: ['Thông báo thay đổi nội dung ĐKDN.docx', 'Nghị quyết ĐHĐCĐ.docx', 'Biên bản họp ĐHĐCĐ.docx'],
        },
        {
          name: '14. Tạm ngừng Cty 1 Thành Viên',
          path: '/tam-ngung-1tv',
          category: 'tam-ngung',
          description: 'Thông báo tạm ngừng hoạt động kinh doanh có thời hạn cho Cty TNHH 1TV gửi Phòng ĐKKD.',
          docs: ['Thông báo tạm ngừng kinh doanh.docx', 'Quyết định tạm ngừng của Chủ sở hữu.docx'],
        },
        {
          name: '15. Tạm ngừng Cty 2 Thành Viên',
          path: '/tam-ngung-2tv',
          category: 'tam-ngung',
          description: 'Hồ sơ tạm ngừng hoạt động kinh doanh Cty TNHH 2TV kèm Nghị quyết & Biên bản họp HĐTV.',
          docs: ['Thông báo tạm ngừng kinh doanh.docx', 'Nghị quyết của HĐTV.docx', 'Biên bản họp HĐTV.docx'],
        },
        {
          name: '16. Tạm ngừng Cty Cổ Phần',
          path: '/tam-ngung-cp',
          category: 'tam-ngung',
          description: 'Hồ sơ tạm ngừng hoạt động kinh doanh Cty Cổ phần kèm Nghị quyết HĐQT.',
          docs: ['Thông báo tạm ngừng kinh doanh.docx', 'Nghị quyết của HĐQT.docx', 'Biên bản họp HĐQT.docx'],
        },
        {
          name: '17. Giải thể Cty 1 Thành Viên',
          path: '/giai-the-1tv',
          category: 'giai-the',
          description: 'Bộ hồ sơ giải thể tự nguyện doanh nghiệp 1 thành viên gửi Sở Tài Chính.',
          docs: ['Quyết định giải thể của Chủ sở hữu.docx', 'Thông báo giải thể doanh nghiệp.docx', 'Báo cáo thanh lý tài sản.docx', 'Giấy ủy quyền.docx'],
        },
        {
          name: '18. Giải thể Cty 2 Thành Viên',
          path: '/giai-the-2tv',
          category: 'giai-the',
          description: 'Hồ sơ giải thể công ty TNHH 2TV trở lên thông qua Nghị quyết Hội đồng thành viên.',
          docs: ['Nghị quyết giải thể của HĐTV.docx', 'Biên bản họp HĐTV.docx', 'Thông báo giải thể.docx', 'Báo cáo thanh lý.docx'],
        },
        {
          name: '19. Giải thể Cty Cổ Phần',
          path: '/giai-the-co-phan',
          category: 'giai-the',
          description: 'Hồ sơ giải thể công ty cổ phần thông qua Đại hội đồng cổ đông.',
          docs: ['Nghị quyết giải thể của ĐHĐCĐ.docx', 'Biên bản họp ĐHĐCĐ.docx', 'Thông báo giải thể.docx', 'Danh sách chủ nợ.docx'],
        },
        {
          name: '20. Giải thể thuế (Khóa mã số thuế)',
          path: '/giai-the-thue',
          category: 'giai-the',
          description: 'Hồ sơ nộp Chi cục Thuế đề nghị chấm dứt hiệu lực mã số thuế trước khi giải thể ĐKKD.',
          docs: ['Văn bản đề nghị chấm dứt hiệu lực MST.docx', 'Quyết định giải thể.docx', 'Biên bản họp giải thể.docx'],
        },
      ],
    }
  },
  computed: {
    user() {
      return this.auth.state.user
    },
    displayName() {
      return this.user?.fullName || this.user?.username || 'Quý khách'
    },
    roleLabel() {
      const role = this.user?.role
      if (role === 'ADMIN_SYSTEM') return 'ADMIN SYSTEM'
      if (role === 'PRO') return 'TÀI KHOẢN PRO'
      return 'TÀI KHOẢN THƯỜNG'
    },
    roleClass() {
      const role = this.user?.role
      if (role === 'ADMIN_SYSTEM') return 'tag-admin'
      if (role === 'PRO') return 'tag-pro'
      return 'tag-normal'
    },
    isFree() {
      return this.user?.role === 'ADMIN_SYSTEM'
    },
    pricingText() {
      if (this.isFree) return '0đ (Miễn phí)'
      if (this.user?.role === 'PRO') return '5.000đ / lần'
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
    exportCount() {
      return this.user?.exportCount ?? 0
    },
    lastExportFormatted() {
      if (!this.user?.lastExportAt) return 'Chưa tạo hồ sơ'
      try {
        const d = new Date(this.user.lastExportAt)
        return d.toLocaleDateString('vi-VN')
      } catch {
        return 'Chưa tạo'
      }
    },
    filteredModules() {
      let list = this.modules

      if (this.selectedCategory !== 'all') {
        list = list.filter((m) => m.category === this.selectedCategory)
      }

      if (this.searchQuery && this.searchQuery.trim()) {
        const q = this.searchQuery.toLowerCase().trim()
        list = list.filter(
          (m) =>
            m.name.toLowerCase().includes(q) ||
            m.description.toLowerCase().includes(q) ||
            m.docs.some((d) => d.toLowerCase().includes(q))
        )
      }

      return list
    },
  },
  watch: {
    // Khi user điều hướng từ view khác quay trở lại /dashboard
    '$route.path'(newPath) {
      if (newPath === '/dashboard') {
        this.refreshDashboardData()
      }
    },
  },
  async mounted() {
    if (!this.auth.state.ready) {
      await this.auth.init()
    }
    // Tự động làm mới số dư ví và dữ liệu user mới nhất từ DB khi vào/quay lại Dashboard
    this.refreshDashboardData()

    // Lắng nghe sự kiện window focus (khi user chuyển tab nạp tiền ngân hàng rồi quay lại tab web)
    window.addEventListener('focus', this.onWindowFocus)
  },
  beforeUnmount() {
    window.removeEventListener('focus', this.onWindowFocus)
  },
  methods: {
    async refreshDashboardData() {
      await Promise.allSettled([
        this.auth.refreshUser(),
        this.fetchTransactions(),
      ])
    },
    async manualRefresh() {
      if (this.isRefreshing) return
      this.isRefreshing = true
      await this.refreshDashboardData()
      setTimeout(() => {
        this.isRefreshing = false
      }, 500)
    },
    onWindowFocus() {
      this.refreshDashboardData()
    },
    countByCategory(catId) {
      return this.modules.filter((m) => m.category === catId).length
    },
    getCategoryName(catId) {
      const c = this.categories.find((x) => x.id === catId)
      return c ? c.name : 'Nghiệp vụ'
    },
    goTo(path) {
      this.$router.push(path)
    },
    openDepositModal() {
      window.dispatchEvent(new CustomEvent('open-deposit-modal'))
    },
    resetFilter() {
      this.searchQuery = ''
      this.selectedCategory = 'all'
    },
    async fetchTransactions() {
      this.loadingTrans = true
      try {
        const res = await http.get('/wallet/transactions?limit=5')
        if (res.data?.transactions) {
          this.transactions = res.data.transactions
        }
      } catch (err) {
        // im lặng nếu không tải được sao kê ví phụ
      } finally {
        this.loadingTrans = false
      }
    },
    formatDate(iso) {
      if (!iso) return ''
      try {
        const d = new Date(iso)
        return (
          d.toLocaleDateString('vi-VN') +
          ' ' +
          d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        )
      } catch {
        return ''
      }
    },
    getTransTypeLabel(type) {
      if (type === 'DEPOSIT') return 'Nạp tiền'
      if (type === 'EXPORT_DEDUCT') return 'Xuất hồ sơ'
      if (type === 'ADMIN_ADJUST') return 'Điều chỉnh'
      return type
    },
  },
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px 20px 100px; /* chừa 100px đệm dưới để cuộn thoải mái, không bao giờ bị footer cố định che mất nội dung */
  box-sizing: border-box;
}

/* 1. HERO SECTION */
.dashboard-hero {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px 28px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
}

.user-greeting {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
  flex-wrap: wrap;
}

.greeting-text h2 {
  font-size: 22px;
  color: #0f172a;
  margin: 0 0 4px;
  font-weight: 700;
}

.greeting-text strong {
  color: #0284c7;
}

.greeting-sub {
  font-size: 13.5px;
  color: #64748b;
  margin: 0;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.hero-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);
}

.metric-balance {
  border-color: #bbf7d0;
  background: linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%);
}

.metric-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.metric-head-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.btn-refresh-balance {
  background: transparent;
  border: none;
  font-size: 13px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 4px;
  transition: transform 0.2s ease, opacity 0.2s;
  opacity: 0.7;

  &:hover {
    opacity: 1;
    transform: scale(1.15);
  }

  &.spinning {
    animation: spin 0.6s linear infinite;
  }
}

.metric-title {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.metric-icon {
  font-size: 18px;
}

.metric-val {
  font-size: 24px;
  font-weight: 800;
  color: #0f172a;
  margin-bottom: 10px;
  line-height: 1.2;
}

.val-unit {
  font-size: 14px;
  font-weight: 600;
  color: #64748b;
}

.text-green {
  color: #16a34a !important;
}

.text-free {
  color: #0284c7 !important;
}

.metric-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  font-size: 12px;
  color: #64748b;
}

.btn-deposit-quick {
  background: #0284c7;
  color: #ffffff;
  border: none;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-deposit-quick:hover {
  background: #0369a1;
}

/* 2. SECTION LAUNCHER */
.section-launcher {
  margin-bottom: 32px;
}

.launcher-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 20px;
  margin-bottom: 18px;
  flex-wrap: wrap;
}

.header-titles h3 {
  font-size: 18px;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 4px;
}

.header-titles p {
  font-size: 13px;
  color: #64748b;
  margin: 0;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 380px;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  font-size: 14px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 36px 9px 36px;
  border: 1.5px solid #cbd5e1;
  border-radius: 999px;
  font-size: 13.5px;
  background: #ffffff;
  box-sizing: border-box;
  transition: all 0.15s ease;
}

.search-input:focus {
  outline: none;
  border-color: #0284c7;
  box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
}

.btn-clear-search {
  position: absolute;
  right: 10px;
  background: transparent;
  border: none;
  font-size: 12px;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
}

.category-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 8px;
  margin-bottom: 18px;
}

.cat-tab {
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  color: #475569;
  font-size: 12.5px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.cat-tab:hover {
  background: #e2e8f0;
}

.cat-tab.active {
  background: #0284c7;
  color: #ffffff;
  border-color: #0284c7;
}

/* MODULES GRID */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 16px;
}

.module-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.module-card:hover {
  transform: translateY(-3px);
  border-color: #38bdf8;
  box-shadow: 0 10px 22px rgba(2, 132, 199, 0.1);
}

.card-badge-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.cat-pill {
  font-size: 10.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 4px;
  background: #e0f2fe;
  color: #0369a1;
}

.cat-pill.von {
  background: #fef3c7;
  color: #92400e;
}

.cat-pill.giai-the {
  background: #fee2e2;
  color: #b91c1c;
}

.cat-pill.tam-ngung {
  background: #f1f5f9;
  color: #475569;
}

.doc-count-tag {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.module-title {
  font-size: 14.5px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 6px;
  line-height: 1.35;
}

.module-desc {
  font-size: 12.5px;
  color: #64748b;
  line-height: 1.45;
  margin: 0 0 12px;
}

.module-docs-preview {
  background: #f8fafc;
  border-radius: 8px;
  padding: 8px 10px;
  margin-bottom: 14px;
}

.docs-label {
  font-size: 11px;
  font-weight: 700;
  color: #475569;
  display: block;
  margin-bottom: 4px;
}

.docs-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.docs-list li {
  font-size: 11.5px;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.bullet {
  color: #0284c7;
  font-size: 10px;
  margin-right: 4px;
}

.module-footer {
  margin-top: auto;
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px dashed #e2e8f0;
}

.btn-launch {
  font-size: 12.5px;
  font-weight: 700;
  color: #0284c7;
  display: inline-flex;
  align-items: center;
  transition: transform 0.15s;
}

.module-card:hover .btn-launch {
  transform: translateX(3px);
}

/* EMPTY SEARCH */
.empty-search-state {
  text-align: center;
  padding: 48px 16px;
  background: #f8fafc;
  border: 1px dashed #cbd5e1;
  border-radius: 12px;
}

.empty-icon {
  font-size: 36px;
  display: block;
  margin-bottom: 8px;
}

.empty-search-state p {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 14px;
}

.btn-reset-filter {
  background: #0284c7;
  color: #fff;
  border: none;
  padding: 6px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

/* 3. SECTION TRANSACTIONS */
.section-transactions {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 20px 24px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
}

.trans-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.trans-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.trans-icon {
  font-size: 18px;
}

.trans-title-wrap h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.trans-sub {
  font-size: 12px;
  color: #64748b;
}

.trans-loading,
.trans-empty {
  padding: 24px;
  text-align: center;
  font-size: 13px;
  color: #64748b;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-top-color: #0284c7;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  vertical-align: middle;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.trans-table-wrap {
  overflow-x: auto;
}

.trans-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
  text-align: left;
}

.trans-table th {
  padding: 8px 12px;
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
}

.trans-table td {
  padding: 10px 12px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
}

.col-date {
  font-size: 12px;
  color: #64748b;
  white-space: nowrap;
}

.col-desc {
  max-width: 320px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.font-mono {
  font-family: monospace;
  font-size: 13px;
}

.text-right {
  text-align: right;
}

.text-muted {
  color: #64748b;
}

.amount-plus {
  color: #16a34a;
  font-weight: 700;
}

.amount-minus {
  color: #dc2626;
  font-weight: 700;
}

.trans-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.trans-tag.DEPOSIT {
  background: #dcfce7;
  color: #15803d;
}

.trans-tag.EXPORT_DEDUCT {
  background: #fee2e2;
  color: #b91c1c;
}

.trans-tag.ADMIN_ADJUST {
  background: #fef3c7;
  color: #92400e;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .hero-metrics-grid {
    grid-template-columns: 1fr;
  }
  .launcher-header {
    flex-direction: column;
    align-items: stretch;
  }
  .search-box {
    max-width: 100%;
  }
}
</style>
