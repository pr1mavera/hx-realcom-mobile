<template>
  <div class="main-room">
    <keep-alive>
      <router-view class="router-view"></router-view>
    </keep-alive>
    <lineUp class="line-up"></lineUp>
    <videoBar class="video-bar"></videoBar>
  </div>
</template>

<script type="text/ecmascript-6">

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar'),
    'lineUp': () => import('@/views/mainRoom/lineUp')
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
