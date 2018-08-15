<template>
  <div class="share">
    There are some words for test
    <!-- 测试评价组件 -->
    <assess v-if="false"></assess>
    <!--<connect-fail></connect-fail>-->
    <service-busy></service-busy>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  components: {
    'Assess': () => import('@/views/mainRoom/components/assess'),
    'ConnectFail': () => import('@/views/mainRoom/components/video/connect-fail'),
    'ServiceBusy': () => import('@/views/mainRoom/components/video/service-busy')
  }
}
</script>

<style scoped lang="less">
.share {
  width: 100%;
  height: 100%;
}
</style>
