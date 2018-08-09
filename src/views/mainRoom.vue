<template>
  <div class="mainRoom">
    <router-view></router-view>
    <video></video>
  </div>
</template>

<script type="text/ecmascript-6">

export default {
  components: {
    'Video': () => import('@/views/mainRoom/video')
  },
  data() {
    return {

    }
  }
}
</script>

<style lang="less">
.mainRoom {
  width: 100%;
  height: 100%;
}
</style>
