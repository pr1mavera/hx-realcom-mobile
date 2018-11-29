<template>
  <div class="main-room">
    <keep-alive :include="['chat', 'cus-serv']">
      <router-view class="router-view"
        @showIosGuide="iosGuide = true"
        @showLowVersion="lowVersion = true"
        @showShare="isShareView = true"
        @showIframe="showIframe"
      ></router-view>
    </keep-alive>
    <videoBar class="video-bar"
      v-if="isVideoBarOpen"
      @showShare="toShare"
    ></videoBar>
    <share-dialog
      :show="isShareView"
      @cancelShare="isShareView = false"
      @toShare="toShare"
    ></share-dialog>
    <ios-guide v-if="iosGuide" @click.native="iosGuide = false"></ios-guide>
    <low-version v-if="lowVersion" @click.native="lowVersion = false"></low-version>
    <share-guide v-if="shareGuide" @click.native="shareGuide = false"></share-guide>
    <assess
      :showAssess="this.isAssessView"
      @handleToCancelAssess="handleToCancelAssess"
      @assessSuccess="assessSuccess"
    ></assess>
    <section class="iframe-section" v-if="iframeView">
      <iframe-bar :iframeSrc="iframeSrc" @closeIframe="iframeView = false"></iframe-bar>
    </section>
  </div>
</template>

<script type="text/ecmascript-6">
// import wx from 'weixin-js-sdk'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { roomStatus, sessionStatus } from '@/common/js/status'
import GoShare from '@/common/js/share'

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar'),
    'ShareDialog': () => import('@/views/mainRoom/components/share-dialog'),
    'IosGuide': () => import('@/views/mainRoom/components/video/ios-guide'),
    'LowVersion': () => import('@/views/mainRoom/components/video/low-version'),
    'ShareGuide': () => import('@/views/mainRoom/components/share-guide'),
    'Assess': () => import('@/views/mainRoom/components/assess'),
    'iframeBar': () => import('@/views/mainRoom/components/iframe-bar')
  },
  data() {
    return {
      isShareView: false,
      shareGuide: false,
      iosGuide: false,
      lowVersion: false,
      shareUrl: 'https://video-uat.ihxlife.com:8080/video/room/chat?openId=o23yMh5_T67jbkdj36HvgfGvKtsf',
      // iframe
      iframeView: false,
      iframeSrc: ''
    }
  },
  computed: {
    isVideoBarOpen() {
      // return this.queueMode === queueStatus.queuing || this.queueMode === queueStatus.queueSuccess || this.queueMode === queueStatus.queueOver
      return this.roomMode === roomStatus.videoChat
    },
    ...mapGetters([
      'roomMode',
      'isAssessView',
      'serverTime'
    ])
  },
  mounted() {
    this.$nextTick(() => {
      // this.initShare()
      // document.getElementsByTagName('a').addEventListener('click', (e) => {
      //   debugger
      // }, false)
    })
  },
  methods: {
    assessSuccess() {
      this.setAssessStatus(true)
      this.setAssessView(false)
      if (this.serverTime !== '' && this.roomMode === roomStatus.menChat) {
        // action
        this.afterServerFinish(sessionStatus.onLine)
      }
    },
    handleToCancelAssess() {
      // 用户主动关闭评价
      if (this.serverTime === '') {
        // 当前视频未结束
        this.setAssessView(false)
      } else {
        // 当前视频已结束
        const self = this
        this.$vux.confirm.show({
          title: '您真的要放弃评价嘛？？',
          onConfirm() {
            // 服务结束
            self.setAssessView(false)
            self.setAssessStatus(true)
            // 若当前为人工客服结束，需要手动清空vuex数据
            if (self.roomMode === roomStatus.menChat) {
              // action
              self.afterServerFinish(sessionStatus.onLine)
              self.toShare()
            }
          }
        })
      }
    },
    async toShare() {
      this.isShareView = false
      this.shareGuide = true
      GoShare(this.shareUrl)
      // await this.initShare()
      // this.clickShare()
    },
    showIframe({ link, cliendX, cliendY }) {
      this.iframeView = true
      this.iframeSrc = link
    },
    ...mapMutations({
      setAssessStatus: 'SET_ASSESS_STATUS',
      setAssessView: 'SET_ASSESS_VIEW'
    }),
    ...mapActions([
      'afterServerFinish'
    ])
  }
}
</script>

<style lang="less">
.main-room {
  position: relative;
  width: 100%;
  height: 100%;
  .router-view {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  .video-bar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 101;
  }
  .iframe-section {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    z-index: 10;
    background-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
