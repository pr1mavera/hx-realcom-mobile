<template>
  <section class="section line">
    <div class="top"></div>
    <main class="main">
      <div class="img-box"><img scr=""></div>
      <div class="tips">
        <p class="tips-top">当前还有<label class="num">{{num}}</label>人排队.</p>
        <p class="tips-bottom">预计需要等待{{times}}分钟</p>
      </div>
      <a type="reset" class="btn-cancel">取 消</a>
      <connect-success v-if="connect"></connect-success>
    </main>
  </section>
</template>

<script type="text/ecmascript-6">
// import ConnectSuccess from '@/views/mainRoom/components/video/connect-success'

export default {
  components: {
    // ConnectSuccess,
    'ConnectSuccess': () => import('@/views/mainRoom/components/video/connect-success')
  },
  data() {
    return {
      connect: false,
      num: 3,
      times: 1
    }
  }
}
</script>

<style scoped lang="less">
  .line {
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
      .tips {
        line-height: 1.75;
        text-align: center;
        padding-top: 5.0rem;
        letter-spacing: .05rem;
        .tips-top {
          color: #909090;
          font-size: 3.6rem;
          font-weight: bold;
          .num {
            color: #ff444a;
          }
        }
        .tips-bottom {
          color: #BBBBBB;
          font-size: 3.2rem;
        }
      }
      .btn-cancel {
        height: 4rem;
        width: 15rem;
        display: block;
        color: #ffffff;
        font-size: 2rem;
        line-height: 4rem;
        margin: 10rem auto 0;
        border-radius: 5px;
        text-align: center;
        background-color: #FF444A;
      }
    }
  }
</style>
