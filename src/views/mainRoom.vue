<template>
  <div class="main-room">
    <router-view class="router-view"></router-view>
    <videoBar class="video-bar" v-if="false"></videoBar>
  </div>
</template>

<script type="text/ecmascript-6">

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar')
  },
  data() {
    return {

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
  // .video-bar {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   z-index: 100;
  // }
}
</style>
