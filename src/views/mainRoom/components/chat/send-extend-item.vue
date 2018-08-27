<template>
  <div class="send-extend-item">
    <div class="item-icon">
      <div class="item-icon-bg bg-image" :style="this.itemIcon"></div>
      <svg class="icon extend-click" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </div>
    <div class="text">{{this.text}}</div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  computed: {
    itemIcon() {
      return `
      background-image: url('${this.icon}@2x.png');
      background-size: cover;
      @media (-webkit-min-device-pixel-ratio: 3), (min-device-pixel-ratio: 3) {
        background-image: url('${this.icon}@3x.png');
        background-size: cover;
      }
      `
    }
  },
  props: {
    mode: {
      type: String
    },
    icon: {
      type: String
    },
    text: {
      type: String
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.send-extend-item {
  width: 100%;
  height: 100%;
  .item-icon {
    // width: 5.4rem;
    height: 5.4rem;
    .item-icon-bg {
      width: 5.4rem;
      height: 5.4rem;
      margin: 0 auto;
    }
    .icon {
      // display: block;
      width: 5.4rem;
      height: 5.4rem;
      // padding: 0 1.2rem;
      // background-color: #000;
      // fill: #999;
    }
  }
  .text {
    line-height: 2rem;
    font-size: 1.2rem;
    margin-top: 0.3rem;
    color: @text-light;
  }
}
</style>
