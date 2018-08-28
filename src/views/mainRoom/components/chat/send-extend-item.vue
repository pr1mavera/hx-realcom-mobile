<template>
  <div class="send-extend-item">
    <div class="item-icon">
      <div class="item-icon-bg bg-image">
        <img width=110% height=100% class="giftImg" :src="imgUrl">
      </div>
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
    imgUrl() {
      return `/static/img/${this.icon}@2x.png`
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
      .giftImg {
        object-fit: cover;
      }
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
