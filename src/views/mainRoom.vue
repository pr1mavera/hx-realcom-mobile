<template>
  <div class="main-room">
    <keep-alive :include="['chat', 'cus-serv']">
      <router-view class="router-view"></router-view>
    </keep-alive>
    <videoBar class="video-bar" v-if="isVideoBarOpen"></videoBar>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
import { roomStatus } from '@/common/js/status'

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar')
  },
  data() {
    return {

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
  mounted() {

  },
  methods: {}
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
