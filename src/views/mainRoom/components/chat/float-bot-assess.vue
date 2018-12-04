<template>
  <div class="float-bot-assess">
    <p class="text-content">是否已解决您的问题？</p>
    <div class="btn-area border-1px-before">
      <button type="button" class="bot-assess-btn yes border-1px-right" @click="$emit('targetBotAssess', true)">
        <svg class="icon extend-click" aria-hidden="true" :class="{'extend-Bar-Open': this.extendBarOpen}">
          <use xlink:href="#icon-dianzan"></use>
        </svg>
        已解决
      </button>
      <button type="button" class="bot-assess-btn no" @click="$emit('targetBotAssess', false)">
        <svg class="icon extend-click" aria-hidden="true" :class="{'extend-Bar-Open': this.extendBarOpen}">
          <use xlink:href="#icon-dianzan"></use>
        </svg>
        未解决
      </button>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {

}
</script>

<style lang="less">
@import '~@/common/style/mixin.less';
@import '~@/common/style/theme.less';

.float-bot-assess {
  width: 18rem;
  height: 8rem;
  background-color: @text-lighter;
  border-radius: 1.2rem;
  box-shadow: 0 0.3rem 1rem 0rem rgba(147, 147, 147, 0.1);
  .text-content {
    text-align: center;
    color: @text-light;
    font-size: 1.4rem;
    line-height: 4.8rem;
  }
  .btn-area {
    .border-1px-before(@label-line-light);
    display: flex;
    justify-content: space-between;
    width: 100%;
    height: 3.2rem;
    .bot-assess-btn {
      margin: 0;
      padding: 0;
      border: 0;
      background-color: unset;
      width: 50%;
      height: 100%;
      font-size: 1.4rem;
      line-height: 3.2rem;
      .icon {
        transform: translateY(0.2rem);
        width: 1.4rem;
        height: 1.4rem;
      }
      &.yes {
        .border-1px-right(@label-line-light);
        color: rgb(82, 144, 239);
        .icon {
          fill: rgb(82, 144, 239);
        }
      }
      &.no {
        color: @text-lighter-a;
        .icon {
          fill: @text-lighter-a;
          transform: translateY(0.2rem) rotateX(180deg);
        }
      }
    }
  }
}
</style>
