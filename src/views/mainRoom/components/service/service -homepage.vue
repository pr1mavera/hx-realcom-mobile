<!-- 客服人员的个人主页 -->
<template>
  <div class="container">
    <div class="wrapper">
      <div class="content">
        <div class="header">
          <swiper dots-class="custom-bottom" dots-position="center">
            <swiper-item></swiper-item>
          </swiper>
        </div>
        <section></section>
      </div>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script>
  import { Swiper, SwiperItem } from 'vux'
  export default {
    // name: "homepage.vue"
    components: {
      Swiper,
      SwiperItem
    },
    data() {
      return {
      }
    }
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
