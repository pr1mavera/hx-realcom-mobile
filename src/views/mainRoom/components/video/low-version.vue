<template>
  <section class="section">
    <main class="main">
      <div class="img-box"><img src="/static/img/systemUpgrade.png"></div>
      <p class="tips">
        非常抱歉，当前版本过低，无法接入视频客服</p>
      <p class="tips">请把手机系统升级为11.0版本或以上</p>
      <p class="update">升级方案：****</p>
      <x-button :gradients="['#FF8C6A', '#FF80A0']" style="width: 12rem; margin-top: 6rem;">取 消</x-button>
    </main>
  </section>
</template>

<script>
  import { XButton } from 'vux'
  export default {
    // name: "low-version"
    components: {
      XButton
    }
  }
</script>

<style scoped lang="less">
  .section {
    width: 100%;
    min-height: 100vh;
    position: fixed;
    top: 0;
    z-index: 2;
    background: #ffffff;
    .main {
      padding: 10rem 0 0;
      .img-box {
        width: 14.6rem;
        margin: 0 auto;
        text-align: center;
        img {
          width: 100%;
          vertical-align: middle;
        }
      }
      .tips, .update {
        color: #ADADAD;
        line-height: 1.5;
        font-size: 1.4rem;
        text-align: center;
      }
      .update {
        margin-top: 3rem;
      }
    }
  }
</style>
