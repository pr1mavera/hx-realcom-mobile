<template>
  <section class="section line-up">
    <!--<div class="top"></div>-->
    <main class="main">
      <div class="img-box">
          <img src="/video/static/img/lineing.png">
        </div>
      <div class="tips">
        <p class="tips-top" v-if="isQueuingTextShow">当前还有<label class="num">{{this.queueNum}}</label>人排队.</p>
        <p class="tips-top" v-else>排队成功，正在为您转接视频客服</p>
      </div>
      <a type="reset" class="btn-cancel" @click="clickToCancelLineUp">取 消</a>
      <connect-success ref="connectSuccess" @confirmToVideo="confirmToVideo"></connect-success>
    </main>
  </section>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { IMMixin } from '@/common/js/mixin'
import IM from '@/server/im'
import { ERR_OK, videoQueue, videoQueueCancel, videoQueueHeartBeat } from '@/server/index.js'
import { roomStatus, queueStatus, systemMsgStatus } from '@/common/js/status'

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
      'queueNum',
      'sessionId'
    ])
  },
  data() {
    return {
      accessId: null,
      isQueuingTextShow: true,
      heart: false, // 判断心跳变量
      heartBeatTimer: 0,
      heartBeatReq: null,
      heartBeatFailCount: 0 // 心跳包超时失败次数
    }
  },
  async mounted() {
    this.setQueueMode({
      mode: roomStatus.AIChat,
      status: queueStatus.queuing
    })
    const res = await this.initQueue()
    if (+res.queueNum === 0) {
      // 当前队列无人排队，直接推送排队成功的消息给坐席
      this.isQueuingTextShow = false
      const msg = {
        code: systemMsgStatus.VIDEO_REQUEST_CS_ENTENCE,
        csId: this.$route.query.csId,
        csName: this.$route.query.csName,
        accessId: res.accessId,
        startTime: res.startTime,
        endTime: res.endTime
      }
      const config = await this.configSendSystemMsg(msg)
      await IM.sendSystemMsg(config)

      // 客服转接定时器
      const VIDEO_CS_REQ_TRANS_FAIL_msg = {
        code: systemMsgStatus.VIDEO_CS_REQ_TRANS_FAIL,
        csId: msg.csId
      }
      this.reqTransTimeout({
        msg: VIDEO_CS_REQ_TRANS_FAIL_msg,
        toast: this.$vux.toast,
        delay: 30000
      }).then(() => {
        if (this.$route.query.goindex === 'true') {
          this.$router.push('/')
        } else {
          this.$router.back(-1)
        }
        this.afterQueueFailed()
      })
    } else {
      this.setQueueNum(+res.queueNum)
    }
    // 开启心跳
    this.startHeartBeat()
  },
  methods: {
    async initQueue() {
      // const data = {
      //   userId: this.userInfo.userId,
      //   userName: this.userInfo.userName,
      //   csId: this.$route.query.csId,
      //   csName: this.$route.query.csName,
      //   nickName: this.userInfo.userName,
      //   toCsFlag: true,
      //   origin: 'WE',
      //   userPriority: this.userInfo.userPriority,
      //   robotSessionId: this.sessionId
      // }
      const res = await videoQueue(
        this.userInfo.userId,
        this.userInfo.userName,
        this.$route.query.csId,
        this.$route.query.csName,
        this.userInfo.userName,
        true,
        'WE',
        this.userInfo.userPriority,
        this.sessionId
      )
      if (res.result.code === ERR_OK) {
        console.log('===============================> 排队啊 排队啊 排队啊 <===============================')
        window.sessionStorage.setItem('queue_start_time', new Date().getTime())
        this.accessId = res.data.accessId
        return res.data
      } else {
        console.log('error in videoQueue')
      }
    },
    startHeartBeat() {
      this.heart = true
      this.heartBeatTimer = setInterval(async() => {
        console.warn('====== 我现在请求心跳 ======')
        if (!this.heart || !this.$route.query.csId) {
          // 非常规退出 & 浏览器回退
          this.stopHeartBeat()
          return
        }
        this.heartBeatReq = await videoQueueHeartBeat(this.$route.query.csId, this.userInfo.userId)
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
      const res = await videoQueueCancel(this.userInfo.userId, this.$route.query.csId, this.accessId)
      if (res.result.code === ERR_OK) {
        console.log('===============================> 取消排队 啊 取消排队 <===============================')
        debugger
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
    confirmToVideo() {
      // 停止心跳
      this.stopHeartBeat()
      this.$router.replace({path: `/room/chat?openId=${this.userInfo.openId}`})
      this.afterQueueSuccess(roomStatus.videoChat)
    },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setQueueMode: 'SET_QUEUE_MODE',
      setQueueNum: 'SET_QUEUE_NUM'
    }),
    ...mapActions([
      'configSendSystemMsg',
      'afterQueueSuccess',
      'reqTransTimeout',
      'afterQueueFailed'
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
          animation: waiting 30s;
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
          transform: rotate(7200deg);
        }
      }
    }
  }
</style>
