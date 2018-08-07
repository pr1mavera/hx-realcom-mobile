<template>
  <div class="content-item" :class="[{'item-padding-left': isSelf, 'item-padding-right': !isSelf}]">
    <div class="avatar" v-if="!isSelf">
      <svg class="icon extend-click" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </div>
    <div class="content-box" :class="[{'right-content-box': isSelf, 'left-content-box': !isSelf}]">
      <p class="name" v-if="!isSelf">{{name}}</p>
      <div class="content" :class="[{'right-content-style': isSelf, 'left-content-style': !isSelf}]">
        <span class="text">{{text}}</span>
        <!-- <div class="line"></div>
        <div class="content-cell">

        </div> -->
      </div>
    </div>
    <!-- <div class="avatar" v-show="false">
      <svg class="icon extend-click" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </div> -->
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    isSelf: {
      type: Boolean
    },
    name: {
      type: String
    },
    text: {
      type: String
    }
  },
  data() {
    return {

    }
  },
  created() {
    console.log('chat-content-item ===> 你个组件你被引用了哈哈哈')
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.content-item {
  width: calc(~'100% - 9rem');
  // padding-top: 1.2rem;
  // padding-bottom: 1.2rem;
  display: flex;
  &.item-padding-left {
    padding-left: 9rem;
  }
  &.item-padding-right {
    padding-right: 9rem;
  }
  .avatar {
    width: 4.2rem;
    height: 4.2rem;
    background-color: @text-light;
    border-radius: 50%;
    margin: 0 1rem;
    overflow: hidden;
    align-items: flex-start;
    .icon {
      width: 1.2rem;
      height: 1.2rem;
      padding: 1.5rem;
      fill: @label-line-normal;
    }
  }
  .content-box {
    // position: relative;
    width: calc(~'100% - 6.2rem');
    font-size: 1.4rem;
    display: flex;
    flex-direction: column;
    &.left-content-box {
      align-items: flex-start;
    }
    &.right-content-box {
      align-items: flex-end;
    }
    .name {
      font-size: 1.2rem;
      color: @text-light;
      line-height: 1.8rem;
    }
    .content {
      // position: absolute;
      // top: 2.3rem;
      display: inline-block;
      width: auto;
      max-width: 100%;
      padding: 0.9rem 1.2rem;
      margin-bottom: 1.8rem;
      &.left-content-style {
        border-radius: 0.4rem 1.5rem 1.5rem 1.5rem;
        color: @text-normal;
        background-color: @bg-light;
        // left: 0;
      }
      &.right-content-style {
        border-radius: 1.5rem 0.4rem 1.5rem 1.5rem;
        color: @text-lighter;
        background-color: @text-special;
        // right: 0;
      }
      .text {
        line-height: 2rem;
        max-width: 100%;
        word-wrap: break-word;
      }
    }
  }
}
</style>
