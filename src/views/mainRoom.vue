<template>
  <div class="main-room">
    <keep-alive :include="['chat', 'cus-serv']">
      <router-view class="router-view"
        @showIosGuide="iosGuide = true"
        @showLowVersion="lowVersion = true"
        @showShare="isShareView = true"
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
      :showAssess="isAssessView"
      @handleToCancelAssess="handleToCancelAssess"
      @assessSuccess="assessSuccess"
    ></assess>
  </div>
</template>

<script type="text/ecmascript-6">
import wx from 'weixin-js-sdk'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { roomStatus, sessionStatus } from '@/common/js/status'
// import GoShare from '@/common/js/share'
import { ERR_OK, getShareTicket } from '@/server/index.js'

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar'),
    'ShareDialog': () => import('@/views/mainRoom/components/share-dialog'),
    'IosGuide': () => import('@/views/mainRoom/components/video/ios-guide'),
    'LowVersion': () => import('@/views/mainRoom/components/video/low-version'),
    'ShareGuide': () => import('@/views/mainRoom/components/share-guide'),
    'Assess': () => import('@/views/mainRoom/components/assess')
  },
  data() {
    return {
      isShareView: false,
      shareGuide: false,
      iosGuide: false,
      lowVersion: false,
      shareUrl: 'https://vnap-webrtctest.ihxlife.com/'
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
    })
  },
  methods: {
    assessSuccess() {
      this.setAssessStatus(true)
      this.setAssessView(false)
    },
    handleToCancelAssess() {
      // 用户主动关闭评价
      this.setAssessView(false)
      if (this.serverTime !== '') {
        // 服务结束
        this.setAssessStatus(true)
        // 若当前为人工客服结束，需要手动清空vuex数据
        if (this.roomMode === roomStatus.menChat) {
          // action
          this.resetVuexOption(sessionStatus.onLine)
        }
      }
    },
    async toShare() {
      this.isShareView = false
      this.shareGuide = true
      await this.initShare()
      this.clickShare()
    },
    async initShare() {
      const res = await getShareTicket(this.shareUrl)
      if (res.result.code === ERR_OK) {
        const jssdk = res.data
        // const self = this
        wx.config({
          debug: false,
          appId: jssdk.appId,
          timestamp: parseInt(jssdk.timestamp),
          nonceStr: jssdk.nonceStr,
          signature: jssdk.signature,
          jsApiList: [
            'onMenuShareTimeline',
            'onMenuShareAppMessage'
          ]
        })
        return 0
        // const optionData = {
        //   title: '田老师红烧肉盖饭',
        //   desc: '田老师红烧肉盖饭',
        //   link: self.shareUrl,
        //   imgUrl: 'https://tup.iheima.com/sport.png'
        // }
        // GoShare(optionData)
      } else {
        console.log('getShareTicket error')
      }
    },
    clickShare() {
      const optionData = {
        title: '田老师红烧肉盖饭',
        desc: '田老师红烧肉盖饭',
        link: this.shareUrl,
        imgUrl: 'https://tup.iheima.com/sport.png'
      }
      wx.ready(function() {
        const thatopts = optionData
        alert('showMenuItems')
        wx.showMenuItems({
          menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
        })
        document.querySelector('#onMenuShareAppMessage').onclick = function() {
          wx.onMenuShareTimeline({
            title: thatopts.title, // 分享标题
            desc: thatopts.desc, // 分享描述
            link: thatopts.link, // 分享链接
            imgUrl: thatopts.imgUrl, // 分享图标
            success: function() {
              alert('成功')
            },
            cancel: function() {
              alert('失败')
            }
          })
          wx.onMenuShareAppMessage({
            title: thatopts.title, // 分享标题
            desc: thatopts.desc, // 分享描述
            link: thatopts.link, // 分享链接
            imgUrl: thatopts.imgUrl, // 分享图标
            success: function() {
              alert('成功')
            },
            cancel: function() {
              alert('失败')
            }
          })
        }
      })
    },
    ...mapMutations({
      setAssessStatus: 'SET_ASSESS_STATUS',
      setAssessView: 'SET_ASSESS_VIEW'
    }),
    ...mapActions([
      'resetVuexOption'
    ])
  }
}
</script>

<style lang="less">
.main-room {
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
}
</style>
