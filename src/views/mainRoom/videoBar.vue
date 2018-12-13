<template>
  <div class="video-bar">
    <!-- 排队 -->
    <!-- <line-up
      class="line-up"
      v-show="isLineUpShow"
      @ready="readyToVideo"
    ></line-up> -->
    <!-- 最大化 -->
    <div class="video-window" :class="server" @click="openVideoBar">
      <video height=100%
        id="remoteVideo"
        autoplay
        playsinline
      ></video>
      <img width=100% height=100% v-if="videoScreenShotShow" :src="videoScreenShotSrc" class="video-screen-shot">
    </div>
    <div class="video-window" :class="customer" v-show="fullScreen">
      <video height=100%
        id="localVideo"
        v-if="!videoScreenShotShow"
        muted
        autoplay
        playsinline
      ></video>
    </div>
    <div class="full-screen-container" v-show="fullScreen && !videoScreenShotShow">
      <div class="video-header">
        <div class="avatar">
          <img v-lazy="this.csInfo.csAvatar">
        </div>
        <div class="name">{{this.csInfo.csNick}}</div>
      </div>
      <video-footer
        @hangUpVideo="hangUpVideo"
        @handleAssess="setAssessView(true)"
        @sendGift="giftSectionShow = true"
        @changeCamera="isChangeCamera = !isChangeCamera"
        @minimizeVideoBar="closeVideoBar"
      ></video-footer>
      <video-msg-list></video-msg-list>
      <div class="video-fload-btn">
        <div class="item">
          <div class="item-icon icon-hongxin extend-click" @click.once="sendLike">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-xin-hong"></use>
            </svg>
          </div>
          <div class="text">{{this.likesCount}}</div>
        </div>
        <!-- <div class="item">
          <div class="item-icon icon-zhuanfa">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-zhuanfa"></use>
            </svg>
          </div>
          <div class="text">100</div>
        </div> -->
      </div>
      <section class="send-gift-section" v-show="giftSectionShow" @click.stop="giftSectionShow = false">
        <send-gift :theme="`dark`" @selectGift="selectGift"></send-gift>
      </section>
      <div v-transfer-dom>
        <x-dialog v-model="isVideoOverReportShow" :dialog-style="{'max-width': '100%', width: '100%', height: '100%', 'background-color': 'transparent'}">
          <video-over-toast
            :csId="this.csInfo.csId"
            :csName="this.csInfo.csName"
            :time="this.serverTime"
            @goBackToChat="goBackToChat"
            @showShare="showShare"
          ></video-over-toast>
        </x-dialog>
      </div>
    </div>
    <!-- 最小化 -->
    <!-- <div class="mini-container" v-show="isMiniBarOpen" @click="openVideoBar">
      <div class="server-video-window">
        <video
          id="remoteVideoMini"
          autoplay
          playsinline
        ></video>
      </div>
    </div> -->
    <canvas id="videoCanvas" v-show="false"></canvas>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { XDialog, TransferDomDirective as TransferDom } from 'vux'
import { queueStatus, sessionStatus } from '@/common/js/status'
import { RTCRoomMixin, sendMsgsMixin } from '@/common/js/mixin'
// import IM from '@/server/im.js'

export default {
  directives: {
    TransferDom
  },
  mixins: [
    RTCRoomMixin,
    sendMsgsMixin
  ],
  components: {
    // 'LineUp': () => import('@/views/mainRoom/components/video/line-up'),
    'VideoFooter': () => import('@/views/mainRoom/components/video/video-footer'),
    'VideoMsgList': () => import('@/views/mainRoom/components/video/video-msg-list'),
    'SendGift': () => import('@/views/mainRoom/components/chat/send-gift'),
    'Assess': () => import('@/views/mainRoom/components/assess'),
    'videoOverToast': () => import('@/views/mainRoom/components/video/video-over-toast'),
    XDialog
  },
  computed: {
    // isVideoBarOpen() {
    //   // return this.queueMode === queueStatus.queuing || this.queueMode === queueStatus.queueSuccess || this.queueMode === queueStatus.queueOver
    //   return this.roomMode === roomStatus.videoChat
    // },
    isMiniBarOpen() {
      return (!this.fullScreen && this.queueMode.status === queueStatus.queueOver) && !this.videoScreenShotShow
    },
    // isLineUpShow() {
    //   return this.queueMode === queueStatus.queuing || this.queueMode === queueStatus.queueSuccess
    // },
    isVideoOverReportShow() {
      return this.hasAssess && this.serverTime !== ''
      // return true
    },
    customer() {
      return this.isChangeCamera ? 'big' : 'small'
    },
    server() {
      return this.isChangeCamera || !this.fullScreen ? 'small' : 'big'
    },
    ...mapGetters([
      'fullScreen',
      'roomMode',
      'queueMode',
      'userInfo',
      'csInfo',
      'roomId',
      'hasAssess',
      'serverTime'
    ])
  },
  data() {
    return {
      videoScreenShotShow: false,
      videoScreenShotSrc: '',
      // 通话开始时间
      startTimeStamp: null,
      // 是否切换客服跟用户的摄像头位置：[false 客户窗口大窗] / [true 客户窗口小窗]
      isChangeCamera: false,
      // 礼物列表弹层开关：[false 开启 / [true 关闭]
      giftSectionShow: false,
      likesCount: 0
    }
  },
  mounted() {
    this.readyToVideo()
    this.startTimeStamp = new Date()
    this.likesCount = this.csInfo.likesCount
  },
  methods: {
    _getVideoTime(dateBegin) {
      const dateEnd = new Date() // 获取当前时间
      const dateDiff = dateEnd.getTime() - dateBegin.getTime() // 时间差的毫秒数
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
    openVideoBar() {
      this.setFullScreen(true)
    },
    selectGift(giftInfo) {
      console.log('发礼物辣：', giftInfo)
      this.$emit('showGiftAnime', giftInfo)
      this.sendGiftMsg(giftInfo)
    },
    sendLike() {
      this.sendLikeMsg()
      this.likesCount++
    },
    closeVideoBar() {
      this.setFullScreen(false)
    },
    readyToVideo() {
      // IM.joinGroup(this.roomId, this.userInfo.userId)
      this.initRTC(this.roomId)
    },
    async hangUpVideo() {
      // 恢复全屏
      !this.fullScreen && this.setFullScreen(true)
      // 恢复摄像头默认位置
      this.isChangeCamera && (this.isChangeCamera = false)
      // 截取坐席视频
      await this.getVideoScreenShot()
      // 停止推流
      this.quitRTC()
      // 记录通话时间
      const time = this._getVideoTime(this.startTimeStamp)
      this.setServerTime(time)
      // 判断当前是否评价过
      !this.hasAssess && this.setAssessView(true)
    },
    getVideoScreenShot() {
      return new Promise((resolve) => {
        const canvas = document.getElementById('videoCanvas')
        var canvasCtx = canvas.getContext('2d')
        var video = document.getElementById('remoteVideo')
        canvas.width = video.clientWidth
        canvas.height = video.clientHeight
        // 坐原图像的x,y轴坐标，大小，目标图像的x，y轴标，大小。
        canvasCtx.drawImage(video, 0, 0, video.clientWidth, video.clientHeight)
        // 把图标base64编码后变成一段url字符串
        this.videoScreenShotSrc = canvas.toDataURL('image/png')
        this.videoScreenShotShow = true
        resolve()
      })
    },
    showShare(csId, csName) {
      this.$emit('showShare', csId, csName)
    },
    goBackToChat() {
      // 退群
      // IM.quitGroup(this.roomId)
      // action
      this.afterServerFinish(sessionStatus.video)
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setAssessView: 'SET_ASSESS_VIEW',
      setServerTime: 'SET_SERVER_TIME'
    }),
    ...mapActions([
      'afterServerFinish'
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
  .line-up {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 102;
  }
  .video-window {
    position: fixed;
    top: 0;
    right: 0;
    &.big {
      width: 100%;
      height: 100%;
      z-index: 0;
      // background-color: #666;
    }
    &.small {
      margin: .5rem .5rem 0 0;
      width: 9rem;
      height: 16.5rem;
      border-radius: .4rem;
      z-index: 200;
      overflow: hidden;
      z-index: 1;
      // background-color: #222;
    }
    video {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      height: 100%;
      &#remoteVideo {
        background-color: #666;
      }
      &#localVideo {
        background-color: #222;
      }
      &::-webkit-media-controls {
        display:none !important;
      }
    }
    .video-screen-shot {
      object-fit: cover;
      filter: blur(10px);
    }
  }
  .full-screen-container {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 101;
    .video-header {
      position: absolute;
      top: 2.6rem;
      left: 1.8rem;
      width: 6rem;
      height: 14rem;
      text-align: center;
      z-index: 10;
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
        background-color: rgba(229, 186, 197, .7);
        border-radius: 1.5rem;
        font-size: 1.2rem;
        padding: 0.01rem 1rem;
        color: @text-lighter;
        margin: 1rem 0;
      }
    }
    .video-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 10;
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
      z-index: 10;
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
      position: fixed;
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
  // .mini-container {
  //   position: fixed;
  //   top: 0;
  //   right: 0;
  //   margin: .5rem .5rem 0 0;
  //   width: 9rem;
  //   height: 16.5rem;
  //   border-radius: .4rem;
  //   z-index: 200;
  //   background-color: #222;
  //   overflow: hidden;
  //   .server-video-window {
  //     width: 100%;
  //     height: 100%;
  //     background-color: #666;
  //     video {
  //       width: 100%;
  //       height: 100%;
  //       object-fit: cover;
  //       &::-webkit-media-controls {
  //         display:none !important;
  //       }
  //     }
  //   }
  // }
}
</style>
