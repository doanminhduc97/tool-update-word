<template>
    <!-- <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" /> -->

    <div>
      <div id="loading-overlay">
        <div class="spinner"></div>
      </div>
      <header>
        <nav>
          <a class="btn-menu" :class="{ 'active': isActiveMenu('/') }" @click="changeRoute('/', 1)">Đăng kí kinh doanh 1 thành viên</a>
          <a class="btn-menu" :class="{ 'active': isActiveMenu('/dkkdntv') }" @click="changeRoute('/dkkdntv', 2)">Đăng kí kinh doanh nhiều thành viên</a>
          <a class="btn-menu" :class="{ 'active': isActiveMenu('/tlctcp') }" @click="changeRoute('/tlctcp', 3)">Thành lập công ty cổ phần</a>
          <a class="btn-menu" :class="{ 'active': isActiveMenu('/gt') }" @click="changeRoute('/gt', 4)">Giải Thể</a>
          <a class="btn-menu" :class="{ 'active': isActiveMenu('/csh-huong-loi') }" @click="changeRoute('/csh-huong-loi', 5)">Cập nhật CSH hưởng lợi</a>
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
          <!-- <a href="#">Dịch vụ</a>
          <a href="#">Blog</a>
          <a href="#">Liên hệ</a> -->
          <!-- <a href="#" class="btn">Đăng nhập</a> -->
        </nav>
      </header>
      <router-view /> <!-- Nơi render page -->
      <!-- <HelloWorld msg="You did it!" /> -->
    </div>
</template>
<script>
// import axios from 'axios'
export default {
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
    }
  },
  computed: {
    isTamNgungActive() {
      return ['/tam-ngung-1tv', '/tam-ngung-2tv', '/tam-ngung-cp'].includes(this.$route.path);
    }
  },
  mounted() {
    document.addEventListener('click', this.handleOutsideClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick);
  },
  methods: {
    changeRoute(path, id) {
      this.id = id;
      this.isDropdownOpen = false;
      this.$router.push(path);
    },
    toggleDropdown(e) {
      e.stopPropagation();
      this.isDropdownOpen = !this.isDropdownOpen;
    },
    selectTamNgung(path, id) {
      this.id = id;
      this.isDropdownOpen = false;
      this.$router.push(path);
    },
    handleOutsideClick(e) {
      if (this.$refs.dropdownRef && !this.$refs.dropdownRef.contains(e.target)) {
        this.isDropdownOpen = false;
      }
    },
    isActiveMenu(path) {
      return this.$route.path === path ? true : false;
    }
  }
}
</script>

