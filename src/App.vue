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
      // message: 'Hello Vue!'
      id: 1,
    }
  },
  methods: {
    changeRoute(path, id) {
      this.id = id;
      this.$router.push(path);
    },
    isActiveMenu(path) {
      return this.$route.path === path ? true : false;
    }
  }
}
</script>

