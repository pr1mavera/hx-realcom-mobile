<template>
  <section class="section line-up">
    <!--<div class="top"></div>-->
    <main class="main">
      <div class="img-box">
          <img src="/static/img/lineing.png">
        </div>
      <div class="tips">
        <p class="tips-top">当前还有<label class="num">{{this.queueNum}}</label>人排队.</p>
        <!-- <p class="tips-bottom">预计需要等待{{times}}分钟</p> -->
      </div>
      <a type="reset" class="btn-cancel" @click="clickToCancelLineUp">取 消</a>
      <connect-success ref="connectSuccess" @confirmToVideo="confirmToVideo"></connect-success>
    </main>
  </section>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { IMMixin, RTCSystemMsg } from '@/common/js/mixin'
import { ERR_OK, videoQueue, queueHeartBeat, videoQueueCancel } from '@/server/index.js'
import { queueStatus } from '@/common/js/status'

export default {
  mixins: [
    IMMixin
  ],
  components: {
    'ConnectSuccess': () => import('@/views/mainRoom/components/video/connect-success')
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'queueNum'
    ])
  },
  data() {
    return {
      times: 1,
      videoQueueNum: 0,
      heart: false, // 判断心跳变量
      heartBeatTimer: 0,
      heartBeatReq: null,
      heartBeatFailCount: 0 // 心跳包超时失败次数
    }
  },
  async mounted() {
    this.setQueueMode(queueStatus.queuing)
    window.sessionStorage.setItem('queue_start_time', new Date().getTime())
    const queueNum = await this.initQueue()
    if (queueNum === 0) {
      // 当前队列无人排队，直接推送排队成功的消息给坐席
      const msg = {
        csId: this.$route.params.csId
      }
      RTCSystemMsg.responseVideoQueuesSuccess(msg, this.userInfo)
    }
    // 开启心跳
    this.startHeartBeat()
  },
  methods: {
    async initQueue() {
      const res = await videoQueue(this.userInfo.userId, this.$route.params.csId, 1)
      if (res.result.code === ERR_OK) {
        console.log('===============================> 排队啊 排队啊 排队啊 <===============================')
        // return new Promise((resolve) => {
        //   this.setQueueNum(res.data.queueNum)
        //   resolve()
        // })
        return res.data.queueNum
      } else {
        console.log('error in videoQueue')
      }
    },
    startHeartBeat() {
      this.heart = true
      this.heartBeatTimer = setInterval(async() => {
        console.warn('====== 我现在请求心跳 ======')
        if (!this.heart || !this.$route.params.csId) {
          // 非常规退出 & 浏览器回退
          this.stopHeartBeat()
          return
        }
        this.heartBeatReq = await queueHeartBeat(this.$route.params.csId, this.userInfo.userId)
        if (this.heartBeatReq.code === ERR_OK) {
          console.info('心跳成功')
          this.heartBeatFailCount = 0
        } else {
          this.heartBeatFailCount++
          if (this.heartBeatFailCount > 2) {
            console.error('心跳失败 辣')
          }
        }
      }, 7000)
    },
    stopHeartBeat() {
      this.heart = false
      this.heartBeatTimer = clearInterval(this.heartBeatTimer)
      if (this.heartBeatReq) {
        this.heartBeatReq = null
      }
    },
    async clickToCancelLineUp() {
      // 停止心跳
      this.stopHeartBeat()
      // 取消排队
      const res = await videoQueueCancel(this.userInfo.userId, this.$route.params.csId)
      if (res.result.code === ERR_OK) {
        console.log('===============================> 取消排队 啊 取消排队 <===============================')
        if (this.$route.query.goindex === 'true') {
          debugger
          this.$router.push('/')
        } else {
          this.$router.back(-1)
        }
      } else {
        console.log('error in videoQueueCancel')
      }
    },
    queueListReduce() {
      this.videoQueueNum -= 1
    },
    confirmToVideo() {
      // 停止心跳
      this.stopHeartBeat()
      this.$router.push({path: `/room/chat?openId=${this.userInfo.openId}`})
      this.readyToVideoChat()
      // this.$emit('ready')
    },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setQueueMode: 'SET_QUEUE_MODE',
      setQueueNum: 'SET_QUEUE_NUM'
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
