<template>
  <section class="section line-up">
    <!--<div class="top"></div>-->
    <main class="main">
      <div class="img-box">
          <img src="/video/static/img/lineing.gif">
        </div>
      <div class="tips">
        <p class="tips-top" v-if="isQueuingTextShow">当前还有<label class="num">{{this.queueNum}}</label>人排队.</p>
        <p class="tips-top" v-else>排队成功，正在为您转接视频客服</p>
      </div>
      <a type="reset" class="btn-cancel" @click="clickToCancelLineUp">取 消</a>
      <connect-success ref="connectSuccess"></connect-success>
       <!-- @confirmToVideo="confirmToVideo" -->
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
  mounted() {
    this.initQueue()
  },
  methods: {
    async initQueue() {
      /* map -> {
        userId,
        userName,
        csId,
        csName,
        nickName,
        toCsFlag,
        origin,
        userPriority,
        robotSessionId
      } */
      const query = this.$route.query
      const res = await videoQueue(
        this.userInfo.userId,
        this.userInfo.userName,
        query.csId,
        query.csName,
        this.userInfo.nickName,
        true,
        this.userInfo.origin || 'WE',
        this.userInfo.userPriority,
        this.sessionId
      )
      if (res.result.code === ERR_OK) {
        console.log('===============================> 排队啊 排队啊 排队啊 <===============================')
        this.setQueueMode({
          mode: roomStatus.AIChat,
          status: queueStatus.queuing
        })
        // 记录排队开始时间
        window.sessionStorage.setItem('queue_start_time', new Date().getTime())

        const data = res.data
        // 记录accessId
        this.accessId = data.accessId
        if (+data.queueNum === 0) {
          // 当前队列无人排队，直接推送排队成功的消息给坐席
          this.isQueuingTextShow = false
          const msg = {
            code: systemMsgStatus.VIDEO_REQUEST_CS_ENTENCE,
            csId: query.csId,
            csName: query.csName,
            accessId: data.accessId,
            startTime: data.startTime,
            endTime: data.endTime
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
          this.setQueueNum(+data.queueNum)
        }
        // 开启心跳
        this.startHeartBeat()
      } else {
        console.log('error in videoQueue')
      }
    },
    startHeartBeat() {
      this.heart = true
      const query = this.$route.query
      this.heartBeatTimer = setInterval(async() => {
        console.warn('====== 我现在请求心跳 ======')
        if (!this.heart || !query.csId) {
          // 非常规退出 & 浏览器回退
          this.stopHeartBeat()
          return
        }
        this.heartBeatReq = await videoQueueHeartBeat(query.csId, this.userInfo.userId)
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
      const query = this.$route.query
      // 停止心跳
      this.stopHeartBeat()
      // 取消排队
      const res = await videoQueueCancel(this.userInfo.userId, query.csId, this.accessId)
      if (res.result.code === ERR_OK) {
        console.log('===============================> 取消排队 啊 取消排队 <===============================')
        this.$vux.toast.text('取消排队')
        this.$emit('cancelVideoLineUp')
      } else {
        console.log('error in videoQueueCancel')
      }
    },
    // confirmToVideo() {
    //   // 停止心跳
    //   this.stopHeartBeat()
    //   this.$router.replace({path: `/room/chat?openId=${this.userInfo.openId}`})
    //   this.afterQueueSuccess(roomStatus.videoChat)
    // },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setQueueMode: 'SET_QUEUE_MODE',
      setQueueNum: 'SET_QUEUE_NUM'
    }),
    ...mapActions([
      'configSendSystemMsg',
      // 'afterQueueSuccess',
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
        width: 15.3rem;
        /*height: 15.3rem;*/
        margin: 0 auto;
        line-height: 11rem;
        text-align: center;
        img {
          width: 100%;
          vertical-align: middle;
          /*animation: waiting 30s;*/
          /*animation-timing-function: ease-in;*/
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
/*      @keyframes waiting {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(7200deg);
        }
      }*/
    }
  }
</style>
