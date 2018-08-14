<template>
  <section class="section line-up">
    <!--<div class="top"></div>-->
    <main class="main">
      <div class="img-box">
          <img src="/static/img/lineing.png">
        </div>
      <div class="tips">
        <p class="tips-top">当前还有<label class="num">{{num}}</label>人排队.</p>
        <p class="tips-bottom">预计需要等待{{times}}分钟</p>
      </div>
      <a type="reset" class="btn-cancel">取 消</a>
      <connect-success ref="connectSuccess" @confirmToVideo="confirmToVideo"></connect-success>
    </main>
  </section>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapActions } from 'vuex'
// import { queueStatus } from '@/common/js/status'
import { debounce } from '@/common/js/util'
// import ConnectSuccess from '@/views/mainRoom/components/video/connect-success'

export default {
  components: {
    // ConnectSuccess,
    'ConnectSuccess': () => import('@/views/mainRoom/components/video/connect-success')
  },
  computed: {
    ...mapGetters([
      // 'queueMode'
    ])
  },
  data() {
    return {
      num: 3,
      times: 1,
      loginInfo: {
        // userID: localStorage.getItem('userID') || `userid_web_${Date.now().toString()}`,
        userID: `userid_web_${Date.now().toString()}`,
        userName: null
      },
      room: null,
      joinFlag: false,
      nickName: null,
      hasClass: false,
      courseItems: [],
      screenShotImgSrc: ''
    }
  },
  mounted() {
    const self = this
    debounce(() => {
      self.connectComplete()
    }, 1000)()
  },
  methods: {
    connectComplete() {
      this.$refs.connectSuccess.show = true
    },
    confirmToVideo() {
      this.$router.push({
        path: '/room/chat',
        query: {
          cmd: 'create',
          creator: 12345678,
          courseName: 12345678,
          userID: this.loginInfo.userID
        }
      })
      this.$emit('ready')
      this.readyToVideoChat()
    },
    ...mapActions([
      'readyToVideoChat'
    ])
  }
}
</script>

<style scoped lang="less">
  @import '~@/common/style/theme.less';

  .line-up {
    width: 100%;
    height: 100%;
    background-color: @bg-light;
    .main {
      padding: 10rem 0 0;
      .img-box {
        width: 11rem;
        height: 11rem;
        margin: 0 auto;
        line-height: 11rem;
        text-align: center;
        border-radius: 50%;
        background-color: #D7DCE3;
        img {
          width: 5rem;
          vertical-align: middle;
          animation: waiting 8s;
          animation-timing-function: ease-in;
        }
      }
      .tips {
        line-height: 1.75;
        text-align: center;
        padding-top: 5.0rem;
        letter-spacing: .05rem;
        .tips-top {
          color: #909090;
          font-size: 1.8rem;
          font-weight: bold;
          .num {
            color: #ff444a;
          }
        }
        .tips-bottom {
          color: #BBBBBB;
          font-size: 1.6rem;
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
        border-radius: 2rem;
        text-align: center;
        background: linear-gradient(to right, #FF8C6A, #FF80A0);
      }
      /*animation*/
      @keyframes waiting {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(1800deg);
        }
      }
    }
  }
</style>
