<template>
  <div class="share">
    There are some words for test
    <!-- 测试评价组件 -->
    <!--<assess v-if="true"></assess>-->
    <!--<connect-fail></connect-fail>-->
    <!--<low-version></low-version>-->
    <!--<service-busy v-if="serviceBusy"></service-busy>-->
    <!--<ios-guide></ios-guide>-->
    <!--<video-ended></video-ended>-->
  </div>
</template>

<script type="text/ecmascript-6">
// import ConnectFail from "./mainRoom/components/video/connect-fail";
export default {
  components: {
    'Assess': () => import('@/views/mainRoom/components/assess'),
    'ConnectFail': () => import('@/views/mainRoom/components/video/connect-fail'),
    'LowVersion': () => import('@/views/mainRoom/components/video/low-version'),
    'ServiceBusy': () => import('@/views/mainRoom/components/video/service-busy'),
    'IosGuide': () => import('@/views/mainRoom/components/video/ios-guide'),
    'VideoEnded': () => import('@/views/mainRoom/components/video/video-ended')
  },
  data() {
    return {
    }
  }
}
</script>

<style scoped lang="less">
.share {
  width: 100%;
  height: 100%;
  background: #f4f4f4;
}
</style>
