<template>
  <div class="iframe-bar">
    <iframe class="iframe" :src="iframeSrc" width=100% height=100%></iframe>
    <div class="close-btn extend-click" @click="$emit('closeIframe')">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-chahao"></use>
      </svg>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    iframeSrc: {
      type: String
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/mixin.less';

.iframe-bar {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin: auto;
  width: 94%;
  height: 80%;
  border-radius: 1.8rem;
  overflow: hidden;
  background-color: #fff;
  box-shadow: 0 0 2rem 0.2rem rgba(0, 0, 0, 0.1);
  .iframe {
    width: 100%;
    height: 100%;
    border: 0;
  }
  .close-btn {
    position: absolute;
    top: 2rem;
    right: 2rem;
    width: 2.4rem;
    height: 2.4rem;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.3);
    .icon {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      width: 40%;
      height: 40%;
      fill: #fff;
    }
  }
}
</style>
