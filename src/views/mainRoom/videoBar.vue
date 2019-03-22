<template>
  <div class="video-bar" :class="{'mini-screen': !fullScreen}">
    <audio id="videoRing" loop v-show="false" src="/video/static/audio/ring.mp3" type="audio/mpeg"></audio>
    <div class="video-window" v-show="!RTCconnecting" :class="remoteVideo" :style="remoteVideoBg">
    <!-- <div class="video-window" :class="remoteVideo"> -->
      <video
        height=100%
        id="remoteVideo"
        :class="{'invisible': RTCconnecting || serviceBreakOff || RTC === null}"
        :muted="videoFilter.muted"
        autoplay
        playsinline
      ></video>
      <!-- v-show="!RTCconnecting && !serviceBreakOff && RTC" -->
      <div class="video-mask">
        <!-- 视频水印 -->
        <water-mark :style="`opacity: ${isVideoFilter ? 1 : 0}`" :blur="false" :img="`/video/static/img/video/hx-watermark.png`"></water-mark>
        <!-- 客服暂离icon -->
        <img width=60% v-show="isVideoFilter" src="/video/static/img/video/video-filter.png" class="video-watermark">
        <!-- 最小化时的缩放按钮 -->
        <div class="full-screen-btn" :style="`opacity: ${fullScreen ? '0' : '0.7'};`" v-show="!fullScreen" @click="openVideoBar">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-quanping"></use>
          </svg>
        </div>
      </div>
    </div>
    <!-- <div class="video-window" :class="localVideo"> -->
    <div class="video-window" :class="localVideo" v-show="!serviceBreakOff && RTC !== null">
      <video
        height=100%
        id="localVideo"
        muted
        autoplay
        playsinline
      ></video>
      <!-- :class="{'invisible': serviceBreakOff || RTC === null}" -->
      <div class="video-mask"></div>
    </div>
    <div v-transfer-dom>
      <toast v-model="isUnsmoothTextShow" :time="10000000" type="text" position="default" width="80%">您的网络上行速度较差</toast>
    </div>
    <div class="full-screen-container" v-show="fullScreen">
      <!-- 重连按钮 -->
      <div class="reconnect" v-show="serviceBreakOff && RTC">
        <img class="xiaohua" src="/video/static/img/video/xiaohua.png">
        <p class="text">{{this.getCurConnectStateText()}}</p>
        <!-- '视频已经结束啦~' : '连接超时啦' -->
        <x-button
          class="reconnect-btn"
          :gradients="['#FF8C6A', '#FF80A0']"
          @click.native="reconnectVideo">
          重新连接
        </x-button>
        <!-- :class="{'disable': connectCount === 0}"
        :disabled="connectCount === 0" -->
        <!-- <button class="reconnect-btn" @click="reconnectVideo">重新连接</button> -->
      </div>
      <!-- 客服头像 -->
      <div class="video-header">
        <div class="avatar" @click="stopRTC">
          <img v-lazy="this.csInfo.csAvatar">
        </div>
        <div class="name">{{this.csInfo.csNick || '--'}}</div>
      </div>
      <!-- 底部操作按钮区 -->
      <video-footer
        ref="videoFooter"
        :videoConnected="!RTCconnecting"
        @hangUpVideo="handleHangUpVideo"
        @sendGift="giftSectionShow = true"
        @changeCamera="isChangeCamera = !isChangeCamera"
        @minimizeVideoBar="closeVideoBar"
      ></video-footer>
      <!-- 礼物点赞消息区 -->
      <video-msg-list></video-msg-list>
      <!-- 侧边按钮区 -->
      <div class="video-fload-btn">
        <div class="item">
          <div class="item-icon icon-hongxin extend-click" @click="sendLike">
            <svg class="icon" aria-hidden="true">
              <use :xlink:href="likesCountStyle"></use>
            </svg>
          </div>
          <div class="text">{{likesCount || 0}}</div>
        </div>
      </div>
      <!-- 礼物列表区 -->
      <section class="send-gift-section" v-show="giftSectionShow" @click.stop="giftSectionShow = false">
        <send-gift :theme="`dark`" @selectGift="selectGift"></send-gift>
      </section>
    </div>
    <canvas id="videoCanvas" v-show="false"></canvas>
  </div>
</template>

<script type="text/ecmascript-6">
import { Toast, XButton, TransferDom } from 'vux'
import Tools from '@/common/js/tools'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { ERR_OK, enterVideoRTCRoom, getSessionDetail } from '@/server'
import { RTCRoomMixin, IMMixin, sendMsgsMixin } from '@/common/js/mixin'
import { msgStatus, msgTypes } from '@/common/js/status'
import IM from '@/server/im.js'

export default {
  directives: {
    TransferDom
  },
  mixins: [
    RTCRoomMixin,
    IMMixin,
    sendMsgsMixin
  ],
  components: {
    'VideoFooter': () => import('@/views/mainRoom/components/video/video-footer'),
    'VideoMsgList': () => import('@/views/mainRoom/components/video/video-msg-list'),
    'SendGift': () => import('@/views/mainRoom/components/chat/send-gift'),
    'Assess': () => import('@/views/mainRoom/components/assess'),
    'WaterMark': () => import('@/views/mainRoom/components/video/water-mark'),
    Toast,
    XButton
  },
  computed: {
    likesCountStyle() {
      return this.likes ? '#icon-xin-hong' : '#icon-dianzanqian'
    },
    isVideoFilter: {
      get() {
        return this.videoFilter.blur
      },
      set() {}
    },
    localVideo() {
      // if (!this.isLocalVideoView.state) {
      //   return 'invisible'
      // }
      return this.isChangeCamera
                ? 'big'
                : this.isLocalVideoView.state ? 'small' : 'small invisible'
    },
    remoteVideo() {
      return this.isChangeCamera ? 'small' : 'big'
    },
    remoteVideoBg() {
      return this.videoScreenShotSrc
              ? `background-image: url('${this.videoScreenShotSrc}');`
              : 'background-color: #666;'
      // return 'background-color: #666;'
    },
    ...mapGetters([
      'fullScreen',
      'roomMode',
      'queueMode',
      'userInfo',
      'csInfo',
      'roomId',
      'sessionId',
      'hasAssess',
      'serverTime',
      'videoFilter',
      'sessionRamId'
    ])
  },
  data() {
    return {
      isLocalVideoView: {
        state: true,
        timeout: null
      },
      // 视频截图数据，base64，在每次连接成功的时候截取并设置
      videoScreenShotSrc: '',
      // 通话开始时间缓存
      startTimeTrunk: [],
      // 通话结束时间缓存
      endTimeTrunk: [],
      // 是否切换客服跟用户的摄像头位置：[false 客户窗口小窗] / [true 客户窗口大窗]
      isChangeCamera: false,
      // 礼物列表弹层开关：[false 开启 / [true 关闭]
      giftSectionShow: false,
      // 添加喜爱状态，只修改一次
      likes: false,
      // 被添加的喜爱次数
      likesCount: 0,
      // 视频是否建立成功状态，只要成功连接一次就设置为 [成功]，之后不再改变
      isVideoConnectSuccess: false,
      // 连接过程状态记录
      connectProcess: [],
      // 视频连接中状态
      RTCconnecting: false,
      // 服务中断，显示重连按钮
      serviceBreakOff: false,
      // 本地网络上行不佳提示信息
      isUnsmoothTextShow: false,
      // 视频总延迟上限（毫秒）
      totalDelay: 0,
      // 视频延迟上限（毫秒）
      delay: 0,
      // 视频帧率上限
      byteRate: 0,
      // 重连次数
      connectCount: 0,
      // 视频连接超时时长（毫秒）
      connectTimeout: 0,
      // fps 为0 次数
      fpsOutTimes: 0,
      // 卡顿计数上限
      netPoorTimes: 0,
      // fps
      fps: 0,
      // 是否监听 bps，第一次连接的时候是默认监听的，重连时设置为 [关闭]，等到坐席推送的RTC初始化消息之后再 [开启]
      // isBpsListen: true,
      // 卡顿 监听回调
      unsmoothCount: null,
      // 断连 监听回调
      brZeroCount: null
    }
  },
  async mounted() {
    // 初始化重连次数、重连超时时长、视频总延迟上限，视频延迟上限
    const [ connectCount, connectTimeout, totalDelay, delay, fpsOutTimes, fps, byteRate, netPoorTimes ] = await Promise.all([
      this.systemConfig('connectTimes'),
      this.systemConfig('connectTimeout'),
      this.systemConfig('videoTotalDelay'),
      this.systemConfig('videoDelay'),
      this.systemConfig('fpsOutTimes'),
      this.systemConfig('fps'),
      this.systemConfig('byteRate'),
      this.systemConfig('netPoorTimes')
    ])
    this.connectCount = +connectCount.get()
    this.connectTimeout = +connectTimeout.get()
    this.totalDelay = +totalDelay.get()
    this.delay = +delay.get()
    this.fpsOutTimes = +fpsOutTimes.get()
    this.fps = +fps.get()
    this.byteRate = +byteRate.get()
    this.netPoorTimes = +netPoorTimes.get()

    // 初始化bps监听回调，第一次连接，10次，绑定在 data
    // this.bpsCb = this.bps_cb_init(10)
    // 初始化视频
    this.readyToVideo()
    // 进入 RTC 房间
    this.enterVideoRTCRoomAPI(this.csInfo.csId, this.userInfo.userId, this.userInfo.openId, this.sessionId)

    this.$nextTick(() => {
      this.likesCount = +this.csInfo.likesCount
    })
  },
  methods: {
    _getVideoTime([ dateBegin, dateEnd ]) {
      const dateDiff = Tools.getVideoDateDiff([ dateBegin, dateEnd ])
      // const dateEnd = new Date() // 获取当前时间
      // const dateDiff = dateEnd.getTime() - dateBegin.getTime() // 时间差的毫秒数
      // 计算出相差天数
      // const day = Math.floor(dateDiff / (24 * 3600 * 1000))
      const leave1 = dateDiff % (24 * 3600 * 1000) // 计算天数后剩余的毫秒数
      const hours = Math.floor(leave1 / (3600 * 1000)) // 计算出小时数
      const leave2 = leave1 % (3600 * 1000) // 计算小时数后剩余的毫秒数
      // 计算相差分钟数
      const minutes = Math.floor(leave2 / (60 * 1000)).toString().padStart(2, '0')
      const leave3 = leave2 % (60 * 1000) // 计算分钟数后剩余的毫秒数
      // 计算相差秒数
      const seconds = Math.round(leave3 / 1000).toString().padStart(2, '0')
      return `${hours}:${minutes}:${seconds}`
    },
    resetLocalVideoView() {
      const lv = this.isLocalVideoView
      clearTimeout(lv.timeout)
      lv.timeout = null
    },
    openVideoBar() {
      this.isLocalVideoView.state = true
      this.isLocalVideoView.timeout && this.resetLocalVideoView()
      this.setFullScreen(true)
    },
    closeVideoBar() {
      this.isChangeCamera = false
      this.setFullScreen(false)
      this.isLocalVideoView.timeout = setTimeout(() => {
        this.isLocalVideoView.state = false
        this.resetLocalVideoView()
      }, 2000)
    },
    selectGift(giftInfo) {
      console.log('发礼物辣：', giftInfo)
      this.$emit('showGiftAnime', giftInfo)
      this.sendGiftMsg(giftInfo)
    },
    sendLike() {
      if (this.likes) {
        return
      }
      this.likesCount += 1
      this.sendLikeMsg()
      this.likes = true
    },
    // 计数器
    recordCount(limit = 5) {
      let count = 0
      return {
        resetCount() {
          count = 0
          return count
        },
        addCount(cb) {
          count += 1
          if (count >= limit) {
            cb && cb()
            // self.showToast('当前网络状况不佳', 3000)
            return this.resetCount()
          } else {
            return count
          }
        }
      }
    },
    setStateConnecting() {
      // 开始连接，设置状态
      const self = this
      // 响铃
      document.getElementById('videoRing').play()
      // 初始化视频质量监控计数
      // this.fpsCb = this.fps_cb_init(this.fpsOutTimes)
      this.unsmoothCount = this.recordCount(this.netPoorTimes)
      this.brZeroCount = this.recordCount(this.fpsOutTimes)
      // 关闭重连按钮
      self.serviceBreakOff = false
      // 初始化摄像头
      self.isChangeCamera = true
      // 初始化视频连接中状态
      self.RTCconnecting = true
      // 记录连接
      self.connectProcess.push({
        timeoutId: setTimeout(() => {
                                // 发送自定义指令
                                this.sendCustomDirective({
                                  msg: '客户挂断',
                                  msgStatus: msgStatus.msg,
                                  msgType: msgTypes.msg_video_hang_up,
                                  MsgLifeTime: 0
                                })
                                self.clearConnectTimeoutWithState('fail')
                                self.setStateUnconnect()
                              }, self.connectTimeout),
        state: 'connecting'
      })
    },
    setStateConnected() {
      // 连接成功，设置状态
      // 记录连接
      this.clearConnectTimeoutWithState('succ')
      // 设置时长节点及连接次数
      if (this.startTimeTrunk.length === this.endTimeTrunk.length) {
        // 设置剩余重连次数
        this.connectCount -= 1
        // 记录视频开始时间节点
        this.startTimeTrunk.push(new Date().getTime())
      }
      // 提示视频加载成功
      // this.$vux.toast.text('客服视频载入成功', 'default')
      // 记录视频接通成功状态
      this.isVideoConnectSuccess = true
      // 初始化重连按钮
      this.serviceBreakOff = false
      // 暂停铃声
      document.getElementById('videoRing').pause()
      // 初始化视频窗口位置
      this.isChangeCamera = false
      // 初始化提示按钮
      this.$vux.toast.hide()
      // 初始化连接状态
      this.RTCconnecting = false
      // 截图
      !this.videoScreenShotSrc && this.getVideoScreenShot()
    },
    setStateUnconnect() {
      this.openVideoBar()
      // 初始化提示按钮
      this.$vux.toast.hide()
      // 断开连接，设置状态
      this.clearConnectTimeoutWithState('fail')
      // 显示重连按钮
      this.serviceBreakOff = true
      // 停止推流
      this.quitRTC()
      // 暂停铃声
      document.getElementById('videoRing').pause()
      // 重置视频模糊状态
      this.setVideoBlur(false)
    },
    clearConnectTimeoutWithState(state) {
      const curConn = this.connectProcess[this.connectProcess.length - 1]
      curConn.state = state
      // this.connectProcess.map(({ timeoutId }) => clearTimeout(timeoutId))
      clearTimeout(curConn.timeoutId)
    },
    async readyToVideo() {
      // 初始化开始连接状态
      this.setStateConnecting()
      // 初始化 RTC
      this.initRTC()
      .then(() => this.enterRoom(this.roomId), err => {
        console.log(err)
        alert('初始化RTC失败！')
      })
      .then(() => this.getLocalStream(), err => {
        console.log(err)
        alert('进房失败！')
      })
      .then(info => this.startRTC(info.stream), err => {
        console.log(err)
        alert('获取本地视频失败！')
      })
      // .then(() => {
      //   // 记录视频开始时间节点
      //   // this.startTimeTrunk.push(new Date().getTime())
      // })
      .catch(err => {
        console.log(err)
        // alert('视频通话建立失败！')
      })
    },
    async reconnectVideo() {
      // 初始化视频卡顿提示信息
      this.isUnsmoothTextShow = false
      // 初始化提示按钮
      this.$vux.toast.hide()

      // 剩余重连次数如果不足，不允许重连
      if (this.connectCount === 0) {
        this.$vux.toast.text('您已经不能再重连啦~')
        await Tools.AsyncTools.sleep(2000)
        return this.hangUpVideo()
      }

      const res = await getSessionDetail(this.sessionRamId, this.userInfo.userId, this.sessionId)
      if (res.result.code === ERR_OK && !res.data.sectionId) {
        IM.sendNormalMsg(this.userInfo.userId, this.csInfo.csId, {
          sessionId: this.sessionId,
          toUserName: this.csInfo.csName,
          msg: '重连',
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_video_reconnect,
          MsgLifeTime: 0
        })
      } else {
        this.$vux.toast.text('本次会话已结束')
        await Tools.AsyncTools.sleep(2000)
        return this.hangUpVideo()
      }
      // 重置 bps 监听状态
      // this.isBpsListen = false
      // 重置截图
      this.videoScreenShotSrc = ''
      // 初始化bps监听回调，重连，5次，绑定在 data
      // this.bpsCb = this.bps_cb_init(5)
      // 重启视频
      this.readyToVideo()
    },
    async enterVideoRTCRoomAPI(roomId, userId, openId, sessionId) {
      const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')
      const clientType = enterVideoStatus === 'Android' ? 'Android' : 'iOS'
      await enterVideoRTCRoom(roomId, userId, openId, sessionId, clientType)
      // if (res.result.code === ERR_OK) {
      //   // this.$vux.toast.text('进房成功')
      // } else {
      //   // this.$vux.toast.text('进房失败')
      // }
    },
    async handleHangUpVideo() {
      // 当前为正在连接状态
      if (this.RTCconnecting) {
        // 关闭铃声
        document.getElementById('videoRing').pause()
        // 记录连接
        const curConn = this.connectProcess[this.connectProcess.length - 1]
        curConn.state = 'fail'
        clearTimeout(curConn.timeoutId)
      }
      // 停止推流
      await this.quitRTC()
      // 关闭 RTC
      this.RTC = null

      this.hangUpVideo()
    },
    async hangUpVideo() {
      this.$vux.toast.hide()
      // 恢复全屏
      !this.fullScreen && this.setFullScreen(true)
      // 恢复摄像头默认位置
      this.isChangeCamera && (this.isChangeCamera = false)
      // 计算通话时间
      const time = this._getVideoTime([ this.startTimeTrunk, this.endTimeTrunk ])
      this.setServerTime(time)
      // 清空时间
      this.startTimeTrunk = []
      this.endTimeTrunk = []
      // 初始化重连按钮
      this.serviceBreakOff = false
      // 判断当前是否评价过
      if (this.isVideoConnectSuccess && !this.hasAssess) {
        this.setAssessView({
          show: true,
          task: {
            csInfo: Object.assign({}, this.csInfo),
            sessionId: this.sessionId,
            mode: this.roomMode
          }
        })
      } else {
        this.$emit('videoOver')
      }
    },
    getVideoScreenShot() {
      return new Promise(resolve => {
        const canvas = document.getElementById('videoCanvas')
        var canvasCtx = canvas.getContext('2d')
        var video = document.getElementById('remoteVideo')
        video.crossOrigin = ''
        canvas.width = video.clientWidth
        canvas.height = video.clientHeight
        // 坐原图像的x,y轴坐标，大小，目标图像的x，y轴标，大小。
        canvasCtx.drawImage(video, 0, 0, video.clientWidth, video.clientHeight)
        // 高斯模糊
        const oData = canvasCtx.getImageData(0, 0, video.clientWidth, video.clientHeight)
        canvasCtx.putImageData(Tools.gaussBlur(oData), 0, 0)
        // 把图标base64编码后变成一段url字符串
        canvas.toBlob(blob => {
          const _URL = window.URL || window.webkitURL
          this.videoScreenShotSrc = _URL.createObjectURL(blob)
        })
        // this.videoScreenShotShow = true
        resolve()
      }).catch(err => {
        console.log('ERROR in getVideoScreenShot', err)
      })
    },

    changeUnsmoothTextShow(state) {
      if (this.RTCconnecting) {
        return undefined
      }
      this.isUnsmoothTextShow = state
    },

    showShare(csId, csName) {
      this.$emit('showShare', csId, csName)
    },

    // // bps 不达标时候的回调
    // bps_cb_init: function(limit) {
    //   let count = 0
    //   return function cb(toast, text) {
    //     return count > limit
    //             ? console.log(text)
    //             : ++count
    //   }
    // },

    // // fps
    // fps_cb_init: function(limit) {
    //   let count = 0
    //   return function fps_cb(cb) {
    //     return count > limit
    //             ? cb && cb()
    //             : ++count
    //   }
    // },

    getCurConnectStateText() {
      const curConn = this.connectProcess[this.connectProcess.length - 1]
      if (curConn) {
        switch (curConn.state) {
          case 'succ':
            return '视频已经结束啦~'
          case 'fail':
            return '连接超时啦'
          default:
            return '视频已经结束啦~'
        }
      } else {
        return '视频已经结束啦~'
      }
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setAssessView: 'SET_ASSESS_VIEW',
      setServerTime: 'SET_SERVER_TIME'
    }),
    ...mapActions([
      'systemConfig'
    ])
  },
  filters: {
    videoTimeFormat(val) {
      const temp = val.split(':')
      return temp.filter(item => item !== '0').join(':')
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.video-bar {
  position: relative;
  background-color: #333;
  width: 100%;
  height: 100%;
  transform-origin: calc(~'100% - .5rem') .5rem;
  transition: transform .5s ease-in-out;
  // &.full-screen {
  //   width: 100%;
  //   height: 100%;
  //   // z-index: 0;
  // }
  &.mini-screen {
    // margin: .5rem .5rem 0 0;
    // width: 9rem;
    // height: 16.5rem;
    transform: scale(.25);
    border-radius: 1.4rem;
    overflow: hidden;
  }
  .video-window {
    position: absolute;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    overflow: hidden;
    z-index: 1;
    transition: opacity .5s ease-in-out;
    // filter: blur(50px);
    &.big {
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
    }
    &.small {
      top: .5rem;
      right: .5rem;
      width: 9rem;
      height: 16.5rem;
      border-radius: .4rem;
      overflow: hidden;
      transform: translateZ(100px);
      z-index: 100;
    }
    &.invisible {
      opacity: 0;
    }
    video {
      position: absolute;
      top: 0;
      // bottom: 0;
      // left: 0;
      // right: 0;
      // margin: auto;
      left: 50%;
      transform: translateX(-50%);
      // width: 100%;
      height: 100%;
      object-fit: cover;
      // transition: filter ease-in-out .5s;
      // &#remoteVideo {
      //   background-color: #666;
      // }
      // &#localVideo {
      //   background-color: #333;
      // }
      // &.video-blur {
      //   filter: blur(50px);

      // }
      &.invisible {
        opacity: 0;
      }
      &::-webkit-media-controls {
        display: none !important;
      }
    }
    .video-mask {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 10;
      background-color: unset;
      // .screen-shot-section {
      //   position: absolute;
      //   top: 0;
      //   bottom: 0;
      //   left: 0;
      //   right: 0;
      //   margin: auto;
      //   background-position: center;
      //   background-size: cover;
      //   background-repeat: no-repeat;
      //   filter: blur(50px);
      // }
      .water-mark {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        width: 100%;
        height: 100%;
        // z-index: 1000000;
      }
      .video-watermark {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        object-fit: contain;
      }
      .full-screen-btn {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        opacity: 0;
        transition: opacity .5s ease 1s;
        .icon {
          position: absolute;
          top: 1.4rem;
          left: 1.4rem;
          width: 8rem;
          height: 8rem;
          fill: #fff;
        }
      }
    }
  }
  .full-screen-container {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    margin: auto;
    overflow: hidden;
    z-index: 199;
    .reconnect {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      margin: auto;
      z-index: 200;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, .1);
      // max-width: 80%;
      font-size: 1.4rem;
      color: #fff;
      // height: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      .xiaohua {
        height: 15rem;
        object-fit: contain;
      }
      .text {
        margin-top: 2rem;
        text-align: center;
        font-size: 1.6rem;
      }
      .reconnect-btn {
        width: 13rem;
        height: 3rem;
        line-height: 3rem;
        margin-top: 2rem;
        &.disable {
          opacity: .3;
        }
      }
    }
    .video-header {
      position: absolute;
      top: 2.6rem;
      left: 1.8rem;
      width: 6rem;
      height: 14rem;
      text-align: center;
      z-index: 100;
      .avatar {
        width: 6rem;
        height: 6rem;
        border-radius: 50%;
        background: linear-gradient(to right, #FF8C6A, #FF80A0);
        img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          padding: 0.25rem;
          box-sizing: border-box;
          object-fit: cover;
        }
      }
      .name {
        display: inline-block;
        vertical-align: top;
        line-height: 1.6;
        background-color: rgb(228, 169, 183);
        border-radius: 1.5rem;
        font-size: 1.2rem;
        padding: 0.01rem 1rem;
        color: @text-lighter;
        margin: 1rem 0;
      }
    }
    .video-footer {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 300;
    }
    .video-msg-list {
      position: absolute;
      bottom: 9.8rem;
      left: 2rem;
      right: 2rem;
      height: 11rem;
      // background-color: #000;
      z-index: 10;
    }
    .video-fload-btn {
      position: absolute;
      top: 0;
      bottom: 0;
      right: 2rem;
      margin: auto;
      width: 4rem;
      height: 14rem;
      z-index: 300;
      .item {
        width: 100%;
        text-align: center;
        padding-bottom: 2rem;
        .item-icon {
          position: relative;
          width: 4rem;
          height: 4rem;
          .icon {
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
          }
          &.icon-hongxin {
            background-color: unset;
            .icon {
              width: 4rem;
              height: 3rem;
              fill: #FF959C;
            }
          }
          &.icon-zhuanfa {
            border-radius: 50%;
            background-color: rgba(0, 0, 0, .2);
            .icon {
              width: 2.25rem;
              height: 1.55rem;
              fill: #fff;
            }
          }
        }
        .text {
          line-height: 2rem;
          font-size: 1.2rem;
          margin-top: 0.3rem;
          color: #fff;
          // color: @text-normal;
        }
      }
    }
    .send-gift-section {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 999;
      .send-gift {
        position: absolute;
        bottom: 0;
        width: 100%;
        box-sizing: border-box;
      }
    }
  }
}
</style>
