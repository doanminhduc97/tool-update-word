<template>
    <!-- <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" /> -->

    <div>
      <div id="loading-overlay">
        <div class="spinner"></div>
      </div>
      <header v-if="user">
        <nav>
          <!-- Dropdown Thành lập mới -->
          <div class="dropdown-menu-container" :class="{ 'open': isThanhLapMoiOpen }" ref="thanhLapMoiRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isThanhLapMoiActive }" @click="toggleThanhLapMoi">
              Thành lập mới
              <span class="caret"></span>
            </a>
            <div v-show="isThanhLapMoiOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/') }" @click="selectThanhLapMoi('/', 1)">
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

          <!-- Dropdown Giải Thể -->
          <div class="dropdown-menu-container" :class="{ 'open': isGiaiTheOpen }" ref="giaiTheRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isGiaiTheActive }" @click="toggleGiaiThe">
              Giải Thể
              <span class="caret"></span>
            </a>
            <div v-show="isGiaiTheOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/gt') || isActiveMenu('/giai-the-1tv') }" @click="selectGiaiThe('/gt', 4)">
                1. Giải thể 1 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giai-the-2tv') }" @click="selectGiaiThe('/giai-the-2tv', 42)">
                2. Giải thể 2 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giai-the-co-phan') }" @click="selectGiaiThe('/giai-the-co-phan', 43)">
                3. Giải thể cổ phần
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/giai-the-thue') }" @click="selectGiaiThe('/giai-the-thue', 44)">
                4. Giải thể thuế
              </a>
            </div>
          </div>

          <!-- Dropdown Cập nhật / Thay đổi CSH -->
          <div class="dropdown-menu-container" :class="{ 'open': isCshOpen }" ref="cshRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isCshActive }" @click="toggleCsh">
              Cập nhật/Thay đổi CSH
              <span class="caret"></span>
            </a>
            <div v-show="isCshOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/csh-huong-loi') }" @click="selectCsh('/csh-huong-loi', 5)">
                1. Cập nhật CSH hưởng lợi
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/csh-dia-chi') }" @click="selectCsh('/csh-dia-chi')">
                2. Cập nhật CSH hưởng lợi, địa chỉ cty, địa chỉ đại diện PL
                <span v-if="!hasRoute('/csh-dia-chi')" class="badge-coming-soon">Sắp có</span>
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/thay-doi-csh-1tv') }" @click="selectCsh('/thay-doi-csh-1tv')">
                3. Thay đổi CSH, đại diện cty 1TV
                <span v-if="!hasRoute('/thay-doi-csh-1tv')" class="badge-coming-soon">Sắp có</span>
              </a>
            </div>
          </div>

          <a class="btn-menu" :class="{ 'active': isActiveMenu('/hdcn-bbtl') }" @click="changeRoute('/hdcn-bbtl', 6)">HĐCN và BBTL</a>

          <!-- Dropdown Tạm ngừng công ty -->
          <div class="dropdown-menu-container" :class="{ 'open': isDropdownOpen }" ref="dropdownRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isTamNgungActive }" @click="toggleDropdown">
              Tạm ngừng công ty
              <span class="caret"></span>
            </a>
            <div v-show="isDropdownOpen" class="dropdown-list">
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tam-ngung-1tv') }" @click="selectTamNgung('/tam-ngung-1tv', 7)">
                1. Tạm ngừng cty 1 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tam-ngung-2tv') }" @click="selectTamNgung('/tam-ngung-2tv', 8)">
                2. Tạm ngừng cty 2 thành viên
              </a>
              <a class="dropdown-item" :class="{ 'active': isActiveMenu('/tam-ngung-cp') }" @click="selectTamNgung('/tam-ngung-cp', 9)">
                3. Tạm ngừng cty CỔ PHẦN
              </a>
            </div>
          </div>

          <!-- Dropdown Thay Đổi Vốn Điều Lệ -->
          <div class="dropdown-menu-container" :class="{ 'open': isThayDoiVonOpen }" ref="thayDoiVonRef">
            <a class="btn-menu dropdown-toggle" :class="{ 'active': isThayDoiVonActive }" @click="toggleThayDoiVon">
              Thay Đổi Vốn Điều Lệ
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

          <!-- <a href="#">Dịch vụ</a>
          <a href="#">Blog</a>
          <a href="#">Liên hệ</a> -->
          <UserMenu />
        </nav>
      </header>
      <router-view /> <!-- Nơi render page -->
      <!-- <HelloWorld msg="You did it!" /> -->
    </div>
</template>
<script>
// import axios from 'axios'
import UserMenu from '@/components/UserMenu.vue'
import { useAuth } from '@/stores/auth'
import { touchSession } from '@/lib/http'

export default {
  components: { UserMenu },
  //  async created() {
  //   const url = '/api/macros/s/AKfycby4Z-N86_35u1CmHhQVA0Edz8TzQKHUFX1jJMCxTBCvB6Pcz4uFvLrXcHtBF8YOSC4E-A/exec';
  //   axios.get(url).then(res => {
  //     console.log(res);
  //   }).catch(err => {

  //   })
  // },
  data() {
    return {
      id: 1,
      isDropdownOpen: false,
      isThanhLapMoiOpen: false,
      isGiaiTheOpen: false,
      isThayDoiVonOpen: false,
      isCshOpen: false,
      auth: useAuth(),
      touchTimer: null,
    }
  },
  computed: {
    user() {
      return this.auth.state.user;
    },
    isThanhLapMoiActive() {
      return ['/', '/dkkdntv', '/tlctcp'].includes(this.$route.path);
    },
    isGiaiTheActive() {
      return ['/gt', '/giai-the-1tv', '/giai-the-2tv', '/giai-the-co-phan', '/giai-the-thue'].includes(this.$route.path);
    },
    isTamNgungActive() {
      return ['/tam-ngung-1tv', '/tam-ngung-2tv', '/tam-ngung-cp'].includes(this.$route.path);
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
      this.isDropdownOpen = false;
      this.isThanhLapMoiOpen = false;
      this.isGiaiTheOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.$router.push(path);
    },
    toggleThanhLapMoi(e) {
      e.stopPropagation();
      this.isDropdownOpen = false;
      this.isGiaiTheOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.isThanhLapMoiOpen = !this.isThanhLapMoiOpen;
    },
    selectThanhLapMoi(path, id) {
      this.id = id;
      this.isThanhLapMoiOpen = false;
      this.$router.push(path);
    },
    toggleGiaiThe(e) {
      e.stopPropagation();
      this.isDropdownOpen = false;
      this.isThanhLapMoiOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.isGiaiTheOpen = !this.isGiaiTheOpen;
    },
    selectGiaiThe(path, id) {
      this.id = id;
      this.isGiaiTheOpen = false;
      this.isThayDoiVonOpen = false;
      this.$router.push(path);
    },
    toggleThayDoiVon(e) {
      e.stopPropagation();
      this.isDropdownOpen = false;
      this.isThanhLapMoiOpen = false;
      this.isGiaiTheOpen = false;
      this.isCshOpen = false;
      this.isThayDoiVonOpen = !this.isThayDoiVonOpen;
    },
    selectThayDoiVon(path) {
      this.isThayDoiVonOpen = false;
      this.$router.push(path);
    },
    toggleCsh(e) {
      e.stopPropagation();
      this.isDropdownOpen = false;
      this.isThanhLapMoiOpen = false;
      this.isGiaiTheOpen = false;
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
    toggleDropdown(e) {
      e.stopPropagation();
      this.isThanhLapMoiOpen = false;
      this.isGiaiTheOpen = false;
      this.isThayDoiVonOpen = false;
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectTamNgung(path, id) {
      this.id = id;
      this.isDropdownOpen = false;
      this.isThayDoiVonOpen = false;
      this.isCshOpen = false;
      this.$router.push(path);
    },
    handleOutsideClick(e) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(e.target)) {
        this.isDropdownOpen = false;
      }
      if (this.$refs.thanhLapMoiRef && !this.$refs.thanhLapMoiRef.contains(e.target)) {
        this.isThanhLapMoiOpen = false;
      }
      if (this.$refs.giaiTheRef && !this.$refs.giaiTheRef.contains(e.target)) {
        this.isGiaiTheOpen = false;
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

