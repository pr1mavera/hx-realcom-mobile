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
    <share
      :show="isShareView"
      @cancelShare="isShareView = false"
      @toShare="toShare"
    ></share>
    <ios-guide v-if="iosGuide" @click.native="iosGuide = false"></ios-guide>
    <low-version v-if="lowVersion" @click.native="lowVersion = false"></low-version>
    <share-guide v-if="shareGuide" @click.native="shareGuide = false"></share-guide>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
import { roomStatus } from '@/common/js/status'

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar'),
    'Share': () => import('@/views/mainRoom/components/share'),
    'IosGuide': () => import('@/views/mainRoom/components/video/ios-guide'),
    'LowVersion': () => import('@/views/mainRoom/components/video/low-version'),
    'ShareGuide': () => import('@/views/mainRoom/components/share-guide')
  },
  data() {
    return {
      isShareView: false,
      shareGuide: false,
      iosGuide: false,
      lowVersion: false
    }
  },
  computed: {
    isVideoBarOpen() {
      // return this.queueMode === queueStatus.queuing || this.queueMode === queueStatus.queueSuccess || this.queueMode === queueStatus.queueOver
      return this.roomMode === roomStatus.videoChat
    },
    ...mapGetters([
      'roomMode'
    ])
  },
  methods: {
    toShare() {
      this.isShareView = false
      this.shareGuide = true
    }
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
