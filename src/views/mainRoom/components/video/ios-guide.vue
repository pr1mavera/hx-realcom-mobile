<template>
  <main class="main">
    <img src="/static/img/ios-guide1.jpg">
    <img class="guide-sec" src="/static/img/ios-guide2.jpg">
  </main>
</template>

<script>
  export default {
    // name: "ios-guide.vue"
  }
</script>

<style scoped lang="less">
  .main {
    width: 100vw;
    height: 100vh;
    position: fixed;
    top: 0;
    opacity: .85;
    background: #626262;
    img {
      width: 100%;
    }
    .guide-sec {
      position: absolute;
      bottom: 0;
    }
  }
</style>
