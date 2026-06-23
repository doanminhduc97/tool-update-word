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
<style lang="scss">
* {
  font-size: 14px;
  box-sizing: border-box;
}
*{
      margin:0;
      padding:0;
      box-sizing:border-box;
      font-family:Arial, sans-serif;
    }

    body{
      background:#f5f5f5;
    }

    /* HEADER */
    header{
      width:100%;
      // background:#111827;
      padding:18px 40px;
      display:flex;
      justify-content:space-between;
      align-items:center;
    }

    /* LOGO */
    .logo{
      color:#fff;
      font-size:28px;
      font-weight:bold;
      text-decoration:none;
    }

    /* MENU */
    nav{
      display:flex;
      gap:30px;
      align-items:center;
      top: 0px;
      background: white;
      z-index: 99;
      padding: 20px;
      position: fixed;
    }

    nav a{
      color: black;
      text-decoration:none;
      font-size:16px;
      position:relative;
      transition:0.3s;
    }

    /* Hover underline */
    nav a::after{
      content:"";
      position:absolute;
      left:0;
      bottom:-5px;
      width:0%;
      height:2px;
      background:#38bdf8;
      transition:0.3s;
    }

    nav a:hover::after{
      width:100%;
    }

    /* BUTTON */
    .btn{
      background:#38bdf8;
      padding:10px 18px;
      border-radius:8px;
    }

    .btn:hover{
      background:#0ea5e9;
    }
    .active {
      background: #38bdf8;
    }
    .btn-menu {
      cursor: pointer;
    }
  #loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.7); /* nền mờ */
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
  }

  .spinner {
    width: 60px;
    height: 60px;
    border: 6px solid #e5e7eb;
    border-top: 6px solid #3b82f6;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
