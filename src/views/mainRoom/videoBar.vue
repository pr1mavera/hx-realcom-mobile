<template>
  <div class="video-bar">
    <div class="full-screen-container"></div>
    <div class="minimize-container"></div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {

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
    background-color: #666;
  }
  .minimize-container {
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
</style>
