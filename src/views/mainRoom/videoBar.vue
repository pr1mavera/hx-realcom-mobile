<template>
  <div class="video-bar" v-show="isVideoBarShow">
    <div class="full-screen-container" v-show="fullScreen">
      <div class="normal-video"></div>
      <div class="mini-video"></div>
    </div>
    <div class="mini-container" v-show="!fullScreen" @click="openVideoBar">
      <div class="normal-video"></div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations } from 'vuex'
import { roomStatus, queueStatus } from '@/common/js/status'
// import { videoBarMixin } from '@/common/js/mixin'

export default {
  // mixins: [videoBarMixin],
  computed: {
    isVideoBarShow() {
      return this.queueMode === queueStatus.queueOver && this.roomMode === roomStatus.videoChat
    },
    ...mapGetters([
      'fullScreen',
      'roomMode',
      'queueMode'
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
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN'
    })
  }
}
</script>

<style lang="less">
.video-bar {
  .full-screen-container {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 101;
    .normal-video {
      width: 100%;
      height: 100%;
      background-color: #666;
    }
    .mini-video {
      position: fixed;
      top: 0;
      right: 0;
      margin: .5rem .5rem 0 0;
      width: 8.8rem;
      height: 15.2rem;
      border-radius: .4rem;
      z-index: 200;
      background-color: #222;
      overflow: hidden;
    }
  }
  .mini-container {
    position: fixed;
    top: 0;
    right: 0;
    margin: .5rem .5rem 0 0;
    width: 8.8rem;
    height: 15.2rem;
    border-radius: .4rem;
    z-index: 200;
    background-color: #222;
    overflow: hidden;
    .normal-video {
      width: 100%;
      height: 100%;
      background-color: #666;
    }
  }
}
</style>
