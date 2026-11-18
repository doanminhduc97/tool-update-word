<template>
    <div>
      <div id="loading-overlay">
        <div class="spinner"></div>
      </div>
      <header v-if="user" class="app-main-header">
        <nav>
          <!-- Brand Logo TUW -->
          <router-link to="/dashboard" class="nav-brand-btn" title="Trang chủ Bảng Điều Khiển TUW">
            <TuwLogo :size="28" :showText="true" theme="light" />
          </router-link>

          <!-- Nút điều hướng Dashboard -->
          <router-link to="/dashboard" class="btn-menu btn-nav-dashboard" :class="{ 'active': isActiveMenu('/dashboard') }" title="Bảng điều khiển trung tâm">
            <span class="nav-icon-dash">📊</span>
            <span class="nav-label-long">Bảng Điều Khiển</span>
            <span class="nav-label-short">Dashboard</span>
          </router-link>

          <!-- Dropdown Thành lập mới -->
          <div class="dropdown-menu-container" :class="{ 'open': isThanhLapMoiOpen }" ref="thanhLapMoiRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isThanhLapMoiActive }" @click="toggleThanhLapMoi">
              Thành lập mới
              <span class="caret"></span>
            </a>
            <div v-show="isThanhLapMoiOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/dkkd1tv') }" @click="selectThanhLapMoi('/dkkd1tv', 1)">
                1. Đăng ký kinh doanh 1 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/dkkdntv') }" @click="selectThanhLapMoi('/dkkdntv', 2)">
                2. Đăng ký kinh doanh nhiều thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tlctcp') }" @click="selectThanhLapMoi('/tlctcp', 3)">
                3. Thành lập công ty cổ phần
              </a>
            </div>
          </div>

          <!-- Dropdown Cập nhật / Thay đổi CSH -->
          <div class="dropdown-menu-container" :class="{ 'open': isCshOpen }" ref="cshRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isCshActive }" @click="toggleCsh">
              <span class="nav-label-long">Cập nhật/Thay đổi CSH</span>
              <span class="nav-label-short">Đổi CSH</span>
              <span class="caret"></span>
            </a>
            <div v-show="isCshOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/csh-huong-loi') }" @click="selectCsh('/csh-huong-loi', 5)">
                1. Cập nhật CSH hưởng lợi
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/csh-dia-chi') }" @click="selectCsh('/csh-dia-chi')">
                2. Cập nhật CSH hưởng lợi, địa chỉ cty, địa chỉ đại diện PL
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/thay-doi-csh-1tv') }" @click="selectCsh('/thay-doi-csh-1tv')">
                3. Thay đổi CSH, đại diện cty 1TV
              </a>
            </div>
          </div>

          <a class="btn-menu" :class="{ 'active': isActiveMenu('/hdcn-bbtl') }" @click="changeRoute('/hdcn-bbtl', 6)">HĐCN và BBTL</a>

          <!-- Dropdown Thay Đổi Vốn Điều Lệ -->
          <div class="dropdown-menu-container" :class="{ 'open': isThayDoiVonOpen }" ref="thayDoiVonRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isThayDoiVonActive }" @click="toggleThayDoiVon">
              <span class="nav-label-long">Thay Đổi Vốn Điều Lệ</span>
              <span class="nav-label-short">Thay Đổi Vốn</span>
              <span class="caret"></span>
            </a>
            <div v-show="isThayDoiVonOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tang-von-1tv') }" @click="selectThayDoiVon('/tang-von-1tv')">
                1. Tăng Vốn Cty 1 Thành Viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tang-von-2tv') }" @click="selectThayDoiVon('/tang-von-2tv')">
                2. Tăng Vốn Cty 2 Thành Viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tang-von-cp') }" @click="selectThayDoiVon('/tang-von-cp')">
                3. Tăng Vốn Cty Cổ Phần
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giam-von-1tv') }" @click="selectThayDoiVon('/giam-von-1tv')">
                4. Giảm Vốn Cty 1 Thành Viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giam-von-2tv') }" @click="selectThayDoiVon('/giam-von-2tv')">
                5. Giảm Vốn Cty 2 Thành Viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giam-von-cp') }" @click="selectThayDoiVon('/giam-von-cp')">
                6. Giảm Vốn Cty Cổ Phần
              </a>
            </div>
          </div>

          <!-- Dropdown Tạm ngừng / Giải thể -->
          <div class="dropdown-menu-container" :class="{ 'open': isTamNgungGiaiTheOpen }" ref="tamNgungGiaiTheRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isTamNgungGiaiTheActive }" @click="toggleTamNgungGiaiThe">
              <span class="nav-label-long">Tạm ngừng / Giải thể</span>
              <span class="nav-label-short">Tạm ngừng/Giải thể</span>
              <span class="caret"></span>
            </a>
            <div v-show="isTamNgungGiaiTheOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tam-ngung-1tv') }" @click="selectTamNgungGiaiThe('/tam-ngung-1tv', 7)">
                1. Tạm ngừng cty 1 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tam-ngung-2tv') }" @click="selectTamNgungGiaiThe('/tam-ngung-2tv', 8)">
                2. Tạm ngừng cty 2 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tam-ngung-cp') }" @click="selectTamNgungGiaiThe('/tam-ngung-cp', 9)">
                3. Tạm ngừng cty CỔ PHẦN
              </a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/gt') || isActiveMenu('/giai-the-1tv') }" @click="selectTamNgungGiaiThe('/gt', 4)">
                4. Giải thể 1 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giai-the-2tv') }" @click="selectTamNgungGiaiThe('/giai-the-2tv', 42)">
                5. Giải thể 2 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giai-the-co-phan') }" @click="selectTamNgungGiaiThe('/giai-the-co-phan', 43)">
                6. Giải thể cổ phần
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giai-the-thue') }" @click="selectTamNgungGiaiThe('/giai-the-thue', 44)">
                7. Giải thể thuế
              </a>
            </div>
          </div>

          <!-- <a href="#">Dịch vụ</a>
          <a href="#">Blog</a>
          <a href="#">Liên hệ</a> -->
          <UserMenu />
        </nav>
      </header>
      <router-view :key="$route.fullPath" /> <!-- Nơi render page -->
      <footer v-if="user" class="app-footer">
        <span>© {{ year }} Tool Update Word — Thiết kế &amp; phát triển bởi <strong>Đoàn Minh Đức (Liam)</strong></span>
        <span class="app-footer-links">
          <a href="mailto:ducdm.aptech@gmail.com">ducdm.aptech@gmail.com</a>
          <span class="app-footer-sep">|</span>
          <a href="tel:0974255602">Hotline: 0974255602</a>
        </span>
      </footer>
    </div>
</template>
<script>
// import axios from 'axios'
import UserMenu from '@/components/UserMenu.vue'
import TuwLogo from '@/components/TuwLogo.vue'
import { useAuth } from '@/stores/auth'
import { touchSession } from '@/lib/http'

export default {
  components: { UserMenu, TuwLogo },
  data() {
    return {
      id: 1,
      isThanhLapMoiOpen: false,
      isTamNgungGiaiTheOpen: false,
      isThayDoiVonOpen: false,
      isCshOpen: false,
      auth: useAuth(),
      touchTimer: null,
      year: new Date().getFullYear(),
    }
  },
  computed: {
    user() {
      return this.auth.state.user;
    },
    isThanhLapMoiActive() {
      return ['/dkkd1tv', '/dkkdntv', '/tlctcp'].includes(this.$route.path);
    },
    isTamNgungGiaiTheActive() {
      return [
        '/tam-ngung-1tv', '/tam-ngung-2tv', '/tam-ngung-cp',
        '/gt', '/giai-the-1tv', '/giai-the-2tv', '/giai-the-co-phan', '/giai-the-thue'
      ].includes(this.$route.path);
    },
    isCshActive() {
      return ['/csh-huong-loi', '/csh-dia-chi', '/thay-doi-csh-1tv'].includes(this.$route.path);
    },
    isThayDoiVonActive() {
      return this.$route.path.startsWith('/tang-von') || this.$route.path.startsWith('/giam-von');
    }
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach((ev) => {
      window.addEventListener(ev, this.onUserActivity, { passive: true });
    });
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
    ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'].forEach((ev) => {
      window.removeEventListener(ev, this.onUserActivity);
    });
  },
  methods: {
    onUserActivity() {
      // Throttle: chỉ cập nhật gia hạn cookie 1 lần mỗi 30 giây khi có thao tác người dùng
      if (!this.touchTimer) {
        touchSession();
        this.touchTimer = setTimeout(() => {
          this.touchTimer = null;
        }, 30000);
      }
    },
    changeRoute(path, id) {
      this.id = id;
      this.isTamNgungGiaiTheOpen = false;
      this.isThanhLapMoiOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.$router.push(path);
    },
    toggleThanhLapMoi(e) {
      e.stopPropagation();
      this.isTamNgungGiaiTheOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.isThanhLapMoiOpen = !this.isThanhLapMoiOpen;
    },
    selectThanhLapMoi(path, id) {
      this.id = id;
      this.isThanhLapMoiOpen = false;
      this.$router.push(path);
    },
    toggleTamNgungGiaiThe(e) {
      e.stopPropagation();
      this.isThanhLapMoiOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.isTamNgungGiaiTheOpen = !this.isTamNgungGiaiTheOpen;
    },
    selectTamNgungGiaiThe(path, id) {
      if (id) this.id = id;
      this.isTamNgungGiaiTheOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.$router.push(path);
    },
    toggleThayDoiVon(e) {
      e.stopPropagation();
      this.isTamNgungGiaiTheOpen = false;
      this.isThanhLapMoiOpen = false;
      this.isCshOpen = false;
      this.isThayDoiVonOpen = !this.isThayDoiVonOpen;
    },
    selectThayDoiVon(path) {
      this.isThayDoiVonOpen = false;
      this.$router.push(path);
    },
    toggleCsh(e) {
      e.stopPropagation();
      this.isTamNgungGiaiTheOpen = false;
      this.isThanhLapMoiOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = !this.isCshOpen;
    },
    selectCsh(path, id) {
      if (id) this.id = id;
      this.isCshOpen = false;
      if (this.hasRoute(path)) {
        this.$router.push(path);
      } else {
        const featureNames = {
          '/csh-dia-chi': 'Cập nhật CSH hưởng lợi, địa chỉ cty, địa chỉ đại diện PL',
          '/thay-doi-csh-1tv': 'Thay đổi CSH, đại diện cty 1TV'
        };
        this.notifyComingSoon(featureNames[path] || path);
      }
    },
    hasRoute(path) {
      return this.$router.getRoutes().some(r => r.path === path);
    },
    notifyComingSoon(featureName) {
      alert(`Chức năng "${featureName}" đang được chuẩn bị và sẽ sớm ra mắt!`);
    },
    handleOutsideClick(e) {
      if (this.$refs.tamNgungGiaiTheRef && !this.$refs.tamNgungGiaiTheRef.contains(e.target)) {
        this.isTamNgungGiaiTheOpen = false;
      }
      if (this.$refs.thanhLapMoiRef && !this.$refs.thanhLapMoiRef.contains(e.target)) {
        this.isThanhLapMoiOpen = false;
      }
      if (this.$refs.thayDoiVonRef && !this.$refs.thayDoiVonRef.contains(e.target)) {
        this.isThayDoiVonOpen = false;
      }
      if (this.$refs.cshRef && !this.$refs.cshRef.contains(e.target)) {
        this.isCshOpen = false;
      }
    },
    isActiveMenu(path) {
      return this.$route.path === path ? true : false;
    }
  }
}
</script>


<style scoped>
.app-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem 1.5rem;
  padding: 0.6rem 1rem;
  margin: 0;
  border-top: 1px solid #e2e8f0;
  font-size: 13px;
  color: #64748b;
  background: rgba(248, 250, 252, 0.95);
  backdrop-filter: blur(8px);
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.03);
}
.app-footer strong {
  color: #0284c7;
}
.app-footer-links a {
  color: #0369a1;
  text-decoration: none;
  font-weight: 600;
}
.app-footer-links a:hover {
  text-decoration: underline;
}
.app-footer-sep {
  margin: 0 0.5rem;
  color: #cbd5e1;
}

/* Nav brand logo button */
.nav-brand-btn {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  padding: 3px 6px;
  border-radius: 8px;
  transition: all 0.2s;
  margin-right: 2px;
  flex-shrink: 0;
}
.nav-brand-btn:hover {
  background: #f1f5f9;
  transform: translateY(-1px);
}

.btn-nav-dashboard {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f0f9ff;
  color: #0369a1 !important;
  font-weight: 700;
  border: 1px solid #bae6fd;

  &:hover {
    background: #e0f2fe !important;
  }

  &.active {
    background: #0284c7 !important;
    color: #ffffff !important;
    border-color: #0284c7;
  }
}

.nav-icon-dash {
  font-size: 14px;
}
</style>
