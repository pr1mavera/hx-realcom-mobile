<template>
  <section class="section">
    <div class="top"></div>
    <main class="main">
      <div class="img-box"><img scr=""></div>
      <p class="tip">
        非常抱歉，当前版本过低，无法接入视频客服请把手机系统升级为11.0版本或以上
      </p>
      <p class="update">升级方案：</p>
      <a type="reset" class="btn-cancel">取 消</a>
    </main>
  </section>
</template>

<script>
  export default {
    // name: "low-version"
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
        background-color: #D7DCE3;
        img {
          width: 100%;
          vertical-align: middle;
        }
      }
      .tip .update {
        color: #ADADAD;
        line-height: 1.25;
        font-size: 2.8rem;
      }
      .update {
        margin-top: 3rem;
      }
      .btn-cancel {
        height: 4rem;
        width: 15rem;
        display: block;
        color: #ffffff;
        font-size: 4rem;
        line-height: 4rem;
        margin: 6rem auto 0;
        border-radius: 5px;
        text-align: center;
        background-color: #FF444A;
      }
    }
  }
</style>
