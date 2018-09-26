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
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { loginMixin, IMMixin } from '@/common/js/mixin'
import { ERR_OK, videoQueue } from '@/server/index.js'
import { queueStatus } from '@/common/js/status'

export default {
  mixins: [
    loginMixin,
    IMMixin
  ],
  components: {
    // ConnectSuccess,
    'ConnectSuccess': () => import('@/views/mainRoom/components/video/connect-success')
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  data() {
    return {
      num: 3,
      times: 1,
      loginInfo: {
        // userId: `userid_web_${Date.now().toString()}`,
        userId: 'cust-test',
        userName: '田老师红烧肉盖饭'
      }
      // loginInfo: {
      //   // userId: `userid_web_${Date.now().toString()}`,
      //   userId: 'cs-test',
      //   userName: '膳当家黄焖鸡米饭'
      // }
    }
  },
  mounted() {
    this.setQueueMode(queueStatus.queuing)
    if (!this.userInfo.sdkAppID) {
      this.login()
    }
    this.initQueue()
  },
  methods: {
    async login() {
      const params = this.$route.params
      const info = {
        userId: params.userId,
        userName: '某用户'
      }
      this.setUserInfo(info)
      await this.getUserInfo()
      await this.initIM()
    },
    async initQueue() {
      const res = await videoQueue(this.userInfo.userId, '00235530bcdd11e8bac9b72d08583918', 1)
      if (res.result.code === ERR_OK) {
        console.log('===============================> 排队啊 排队啊 排队啊 <===============================')
        return new Promise((resolve) => {
          this.num = res.data.queueNum
          resolve()
        })
      } else {
        console.log('error in videoQueue')
      }
    },
    confirmToVideo() {
      this.$router.push({path: `/room/chat/${this.userInfo.openId}`})
      this.readyToVideoChat()
      // this.$emit('ready')
    },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setQueueMode: 'SET_QUEUE_MODE'
    }),
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
    min-height: 100%;
    background-color: @bg-normal;
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
