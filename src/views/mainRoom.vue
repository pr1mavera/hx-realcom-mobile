<template>
  <div class="mainRoom">
    <chat></chat>
  </div>
</template>

<script type="text/ecmascript-6">

export default {
  components: {
    'Chat': () => import('@/views/mainRoom/chat')
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
