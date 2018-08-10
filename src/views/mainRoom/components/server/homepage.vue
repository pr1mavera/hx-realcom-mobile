<!-- 客服人员的个人主页 -->
<template>
  <div class="container">
    <div class="wrapper">
      <div class="content">
        <div class="header"></div>
      </div>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script>
  // import { Swiper } from 'vux'
  export default {
    // name: "homepage.vue"
    // components: {
    //   Swiper
    // },
    // data() {
    //   return {
    //     server_img: serverImgList
    //   }
    // }
  }
</script>

<style scoped lang="less">
  html, body, .wrapper {
    height: 100%;
  }

  body > .wrapper {
    height: auto;
    min-height: 100%;
    .content {
      padding-bottom: 4rem; /* 必须使用和footer相同的高度 */
    }
    .footer {
      position: relative;
      margin-top: -4rem; /* footer高度的负值 */
      height: 4rem;
      clear: both;
    }
  }
</style>
