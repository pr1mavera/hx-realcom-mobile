<template>
  <div class="main-room">
    <keep-alive :include="['chat', 'cus-serv']">
      <router-view class="router-view" id="router-view"
        @showGiftAnime="showGiftAnime"
        @requestVideoServer="requestVideoServer"
      ></router-view>
      <!-- @showIosGuide="iosGuide = true"
      @showLowVersion="lowVersion = true" -->
      <!-- @showShare="toShare"
      @showIframe="showIframe" -->
    </keep-alive>
    <videoBar class="video-bar"
      v-if="isVideoBarOpen"
      @showGiftAnime="showGiftAnime"
    ></videoBar>
    <!-- @showShare="toShare" -->
    <!-- <share-dialog
      :show="isShareView"
      @cancelShare="isShareView = false"
      @toShare="toShare"
    ></share-dialog> -->
    <ios-guide v-if="iosGuide" @click.native="iosGuide = false"></ios-guide>
    <low-version v-if="lowVersion" @click.native="lowVersion = false"></low-version>
    <!-- <share-guide v-if="shareGuide" @click.native="shareGuide = false"></share-guide> -->
    <assess
      :showAssess="this.isAssessView"
      @handleToCancelAssess="handleToCancelAssess"
      @assessSuccess="assessSuccess"
    ></assess>
    <!-- <transition @enter="showIframeEnter" @leave="showIframeLeave">
      <section class="iframe-section" id="iframe-section" v-if="iframeView">
        <iframe-bar class="iframe-bar" :iframeSrc="iframeSrc" @closeIframe="iframeView = false"></iframe-bar>
      </section>
    </transition> -->
    <transition name="fade">
      <section class="gift-section" v-if="giftAnimeView">
        <img :src="giftSrc">
      </section>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
// import wx from 'weixin-js-sdk'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { loginMixin, IMMixin } from '@/common/js/mixin'
import { roomStatus, sessionStatus } from '@/common/js/status'
import Tools from '@/common/js/tools'
import { ERR_OK, saveQueueTicket } from '@/server/index.js'
// import GoShare from '@/common/js/share'
// import anime from 'animejs'

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar'),
    // 'ShareDialog': () => import('@/views/mainRoom/components/share-dialog'),
    'IosGuide': () => import('@/views/mainRoom/components/video/ios-guide'),
    'LowVersion': () => import('@/views/mainRoom/components/video/low-version'),
    // 'ShareGuide': () => import('@/views/mainRoom/components/share-guide'),
    'Assess': () => import('@/views/mainRoom/components/assess')
    // 'iframeBar': () => import('@/views/mainRoom/components/iframe-bar')
  },
  mixins: [
    loginMixin,
    IMMixin
  ],
  data() {
    return {
      // share
      // shareUrl: '',
      // isShareView: false,
      // shareGuide: false,
      // 异常
      iosGuide: false,
      lowVersion: false,
      // iframe
      // iframeView: false,
      // iframeSrc: '',
      // iframePos: {
      //   clientX: 0,
      //   clientY: 0
      // },
      // gift
      giftAnimeView: false,
      giftSrc: null
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
      'serverTime',
      'csInfo',
      'userInfo',
      'sessionId'
    ])
  },
  created() {
    this.initRoom()
  },
  methods: {
    async initRoom() {
      // const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')
      // if (enterVideoStatus === 'iOS-Safari') { // 当前为iOS的Safari环境
      //   // 获取基本信息
      //   // 进入排队
      //   // this.$router.replace({path: `/room/line-up?csId=${csId}&csName=${csName}`})
      // } else { // 非Safari环境，进入chat，登录并初始化聊天室
      //   this.$router.replace({path: `/room/chat?openId=${query.openId}&origin=${query.origin}`})
      // }
      // const query = this.$route.query
      // this.$router.replace({path: `/room/chat?openId=${query.openId}&origin=${query.origin}`})
    },
    requestVideoServer({ csId, csName, csNick }) {
      // this.setSessionTicket({ csId, csName, csNick })
      const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')
      switch (enterVideoStatus) {
        case 'low-version': // 版本过低
          this.lowVersion = true
          break
        case 'iOS-wx': // 当前为iOS的微信环境，需跳转至Safari，并保持当次机器人会话信息
          this.setSessionTicket({ csId, csName, csNick })
          break
        case 'iOS-Safari': // 当前为iOS的Safari环境
          this.$router.push({path: `/room/line-up?csId=${csId}&csName=${csName}`})
          this.beforeQueue({
            mode: roomStatus.videoChat,
            content: `尊敬的${+this.userInfo.userGrade <= 3 ? this.userInfo.userGradeName : ''}客户，正在为您转接视频客服，请稍后。`
          })
          break
        case 'Android': // 当前为Android环境，进入专属客服
          this.$router.push({path: `/room/line-up?csId=${csId}&csName=${csName}`})
          this.beforeQueue({
            mode: roomStatus.videoChat,
            content: `尊敬的${+this.userInfo.userGrade <= 3 ? this.userInfo.userGradeName : ''}客户，正在为您转接视频客服，请稍后。`
          })
          break
      }
    },
    async setSessionTicket({ csId, csName, csNick }) {
      const res = await saveQueueTicket(csId, csName, csNick, this.userInfo, this.userInfo.openId, this.sessionId)
      if (res.result.code === ERR_OK) {
        this.$vux.toast.text('已为您保存咨询信息')
        await Tools.AsyncTools.sleep(2000)
        this.iosGuide = true
      } else {
        this.$vux.toast.text('咨询失败')
      }
    },
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
              // 分享
              // const csId = self.csInfo.csId
              // const csName = self.csInfo.csName
              // self.toShare(csId, csName)
            }
          }
        })
      }
    },
    // async toShare(csId, csName) {
    //   this.isShareView = false
    //   this.shareGuide = true
    //   this.shareUrl = `https://${window.location.host}/video/share?csId=${csId}&csName=${csName}`
    //   GoShare(this.shareUrl)
    //   await this.initShare()
    //   this.clickShare()
    // },
    // showIframe({ link, clientX, clientY }) {
    //   this.iframeView = true
    //   this.iframeSrc = Tools.MsgsFilterTools.transHttp2Https(link)
    //   // this.iframeSrc = 'http://www.baidu.com'
    //   // this.iframePos = {
    //   //   clientX,
    //   //   clientY
    //   // }
    // },
    // showIframeEnter(el, done) {
    //   const showIframeframes = anime.timeline()
    //   showIframeframes.add({
    //     targets: '#router-view',
    //     scale: [1, 0.92],
    //     duration: 200,
    //     easing: 'easeOutQuint',
    //     offset: 0
    //   }).add({
    //     targets: '#iframe-section',
    //     backdropFilter: [blur(0), blur('4px')],
    //     opacity: [0, 1],
    //     duration: 300,
    //     easing: 'easeOutQuint',
    //     offset: 0
    //   }).add({
    //     targets: '#iframe-section .iframe-bar',
    //     // translateX: [this.iframePos.clientX, 0],
    //     // translateY: [this.iframePos.clientY, 0],
    //     opacity: [0, 1],
    //     scale: [0, 1],
    //     duration: 300,
    //     easing: 'easeOutQuint',
    //     offset: 0
    //   })
    //   showIframeframes.complete = done
    // },
    // showIframeLeave(el, done) {
    //   const showIframeframes = anime.timeline()
    //   showIframeframes.add({
    //     targets: '#router-view',
    //     scale: [0.92, 1],
    //     duration: 200,
    //     easing: 'easeInOutQuad',
    //     offset: 0
    //   }).add({
    //     targets: '#iframe-section',
    //     backdropFilter: [blur('4px'), blur(0)],
    //     opacity: [1, 0],
    //     duration: 300,
    //     easing: 'easeInOutQuad',
    //     offset: 0
    //   }).add({
    //     targets: '#iframe-section .iframe-bar',
    //     // translateX: [0, this.iframePos.clientX],
    //     // translateY: [0, this.iframePos.clientX],
    //     opacity: [1, 0],
    //     scale: [1, 0],
    //     duration: 300,
    //     easing: 'easeInOutQuad',
    //     offset: 0
    //   })
    //   showIframeframes.complete = done
    // },
    async showGiftAnime(giftInfo) {
      this.showGiftView(giftInfo.giftId)
      // const duration = (+giftInfo.duration) * 1000
      await Tools.AsyncTools.sleep(4000)
      this.resetGiftView()
    },
    showGiftView(id) {
      this.giftAnimeView = true
      this.giftSrc = `/video/static/img/gift/${id}.gif`
    },
    resetGiftView() {
      this.giftAnimeView = false
      this.giftSrc = null
    },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setAssessStatus: 'SET_ASSESS_STATUS',
      setAssessView: 'SET_ASSESS_VIEW'
    }),
    ...mapActions([
      'beforeQueue',
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
    backdrop-filter: blur(5px);
    background-color: rgba(0, 0, 0, 0.1);
    // .iframe-bar {
    //   transform: scale(0);
    //   transition: transform .3s ease;
    // }
  }
  .gift-section {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 100%;
    height: 100%;
    z-index: 200;
    // background-color: rgba(0, 0, 0, 0.2);
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  .fade-enter-active, .fade-leave-active {
    // backdrop-filter: blur(2px);
    transition: all .3s;
  }
  .fade-enter, .fade-leave-to {
    opacity: 0;
    // backdrop-filter: blur(0);
  }
}
</style>
