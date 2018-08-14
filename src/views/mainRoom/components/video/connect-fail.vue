<template>
  <section class="section">
    <div class="top"></div>
    <main class="main">
      <div class="img-box"><img scr=""></div>
      <p class="tip">抱歉网络繁忙，视频连接失败，请稍后重连！</p>
      <!-- todo 设计图有修改，样式还未同步更改 -->
      <a type="reset" class="btn-cancel">取 消</a>
      <!--<connect-success></connect-success>-->
    </main>
  </section>
</template>

<script>
  export default {
    // name: "connect-fail"
  }
</script>

<style scoped lang="less">
  .section {
    width: 100%;
    .top {
      width: 100%;
      height: 5rem;
      position: fixed;
      background-color: #FF444A;
    }
    .main {
      padding: 10rem 0 0;
      .img-box {
        width: 11rem;
        height: 11rem;
        margin: 0 auto;
        text-align: center;
        border-radius: 50%;
        background-color: #D7DCE3;
        img {
          width: 100%;
          vertical-align: middle;
        }
      }
      .tip {
        color: #ADADAD;
        line-height: 1.25;
        font-size: 1.4rem;
        margin-top: 5.0rem;
      }
      .btn-cancel {
        height: 4rem;
        width: 15rem;
        display: block;
        color: #ffffff;
        font-size: 2rem;
        line-height: 4rem;
        margin: 9rem auto 0;
        border-radius: 5px;
        text-align: center;
        background-color: #FF444A;
      }
    }
  }
</style>
