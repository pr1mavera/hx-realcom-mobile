<template>
  <div class="extend-bar">
    <div class="extend-bar-button">
      <button class="img bg-image">
        <svg class="icon extend-click" aria-hidden="true">
          <use xlink:href="#icon-liwu"></use>
        </svg>
      </button>
      <div class="text">礼物</div>
    </div>
    <div class="extend-bar-button">
      <button class="img">
        <svg class="icon extend-click" aria-hidden="true">
          <use xlink:href="#icon-xiaolian"></use>
        </svg>
      </button>
      <div class="text">表情</div>
    </div>
    <div class="extend-bar-button">
      <button class="img">
        <svg class="icon extend-click" aria-hidden="true">
          <use xlink:href="#icon-fasongtupian"></use>
        </svg>
      </button>
      <div class="text">图片</div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {

}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.extend-bar {
  width: 100%;
  height: 10rem;
  display: flex;
  align-items: center;
  text-align: center;
  padding: 0 2rem;
  box-sizing: border-box;
  .extend-bar-button {
    flex-basis: 20%;
    .img {
      // .bg-image('~/static/img/avatar');
      // background-size: cover;
      width: 4.8rem;
      height: 4.8rem;
      border: 0;
      margin: 0;
      padding: 0;
      border-radius: 50%;
      background-color: @label-line-light;
      .icon {
        width: 2.9rem;
        height: 2.9rem;
      }
    }
    .text {
      padding-top: 0.8rem;
      line-height: 1.3rem;
      font-size: 1.3rem;
    }
  }
}
</style>
