<template>
  <div class="share">
    There are some words for test
    <!-- 测试评价组件 -->
    <assess v-if="false"></assess>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  components: {
    'Assess': () => import('@/views/mainRoom/components/assess')
  }
}
</script>

<style scoped lang="less">
.share {
  width: 100%;
  height: 100%;
}
</style>
