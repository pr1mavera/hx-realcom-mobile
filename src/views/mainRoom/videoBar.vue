<template>
  <div class="video-bar" v-if="isVideoBarOpen">
    <!-- 排队 -->
    <line-up
      class="line-up"
      v-show="isLineUpShow"
      @ready="readyToVideo"
    ></line-up>
    <!-- 最大化 -->
    <div class="full-screen-container" v-show="fullScreen">
      <div class="video-header">
        <div class="avatar">
          <img src="/static/img/avatar@2x.png">
        </div>
        <div class="name">丽丽</div>
      </div>
      <video-footer @minimizeVideoBar="closeVideoBar"></video-footer>
      <video-msg-list></video-msg-list>
      <div class="video-fload-btn">
        <div class="item">
          <div class="item-icon icon-hongxin">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-xin-hong"></use>
            </svg>
          </div>
          <div class="text">300</div>
        </div>
        <div class="item">
          <div class="item-icon icon-zhuanfa">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-zhuanfa"></use>
            </svg>
          </div>
          <div class="text">100</div>
        </div>
      </div>
      <div class="server-video-window">
        <video
          id="remoteVideo"
          autoplay
          playsinline
          src="videofile.ogg"
          poster="posterimage.jpg"
        ></video>
      </div>
      <div class="customer-video-window">
        <video
          id="localVideo"
          muted
          autoplay
          playsinline
          src="videofile.ogg"
          poster="posterimage.jpg"
        ></video>
      </div>
    </div>
    <!-- 最小化 -->
    <div class="mini-container" v-show="isMiniBarOpen" @click="openVideoBar">
      <div class="server-video-window">
        <video
          id="remoteVideoMini"
          autoplay
          playsinline
          src="videofile.ogg"
          poster="posterimage.jpg"
        ></video>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from 'vuex'
import { queueStatus } from '@/common/js/status'
import { RTCRoomMixin } from '@/common/js/mixin'
import IM from '@/server/im.js'

export default {
  mixins: [
    RTCRoomMixin
  ],
  components: {
    'LineUp': () => import('@/views/mainRoom/components/video/line-up'),
    'VideoFooter': () => import('@/views/mainRoom/components/video/video-footer'),
    'VideoMsgList': () => import('@/views/mainRoom/components/video/video-msg-list')
  },
  computed: {
    isVideoBarOpen() {
      return this.queueMode === queueStatus.queuing || this.queueMode === queueStatus.queueSuccess || this.queueMode === queueStatus.queueOver
    },
    isMiniBarOpen() {
      return !this.fullScreen && this.queueMode === queueStatus.queueOver
    },
    isLineUpShow() {
      return this.queueMode === queueStatus.queuing || this.queueMode === queueStatus.queueSuccess
    },
    ...mapGetters([
      'fullScreen',
      'roomMode',
      'roomId',
      'queueMode',
      'userInfo'
    ])
  },
  data() {
    return {

    }
  },
  methods: {
    openVideoBar() {
      this.setFullScreen(true)
    },
    closeVideoBar() {
      this.setFullScreen(false)
    },
    readyToVideo() {
      IM.joinGroup(this.roomId, this.userInfo.userId)
      this.initRTC(this.roomId)
      // const query = this.$route.query
      // this.setUserInfoToEnterRoom(query, this.initRTC, this.initIM)
    },
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    })
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';

.video-bar {
  .line-up {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 102;
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
          width: 5.5rem;
          height: 5.5rem;
          border-radius: 50%;
          padding: 0.25rem;
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
      height: 10rem;
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
    .server-video-window {
      position: fixed;
      top: 0;
      right: 0;
      width: 100%;
      height: 100%;
      background-color: #666;
      z-index: 0;
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
    .customer-video-window {
      position: fixed;
      top: 0;
      right: 0;
      margin: .5rem .5rem 0 0;
      width: 9rem;
      height: 16.5rem;
      border-radius: .4rem;
      z-index: 200;
      background-color: #222;
      overflow: hidden;
      z-index: 1;
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
  .mini-container {
    position: fixed;
    top: 0;
    right: 0;
    margin: .5rem .5rem 0 0;
    width: 9rem;
    height: 16.5rem;
    border-radius: .4rem;
    z-index: 200;
    background-color: #222;
    overflow: hidden;
    .server-video-window {
      width: 100%;
      height: 100%;
      background-color: #666;
      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }
}
</style>
