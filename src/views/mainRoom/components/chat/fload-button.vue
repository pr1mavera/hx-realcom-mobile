<template>
  <div class="fload-button">
    <button
      class="item extend-click transition-bezier"
      :disabled="inputStatus"
      @click="enterVideoLineUp"
      :class="[{'visible-when-input': inputStatus, 'item-1': !inputStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="inputStatus"
      @click="callPhone"
      :class="[{'visible-when-input': inputStatus, 'item-2': !inputStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="inputStatus"
      :class="[{'visible-when-input': inputStatus, 'item-3': !inputStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </button>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    inputStatus: {
      type: Boolean
    }
  },
  methods: {
    callPhone() {
      window.location.href = 'tel:95300'
    },
    enterVideoLineUp() {
      this.$emit('enterVideoLineUp')
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/mixin.less';
@import '~@/common/style/theme.less';

.fload-button {
  .item {
    display: block;
    width: 3.6rem;
    height: 3.6rem;
    padding: 0;
    margin-bottom: 2.4rem;
    border: 0;
    border: 0.2rem solid @theme;
    border-radius: 50%;
    background-color: @bg-light;
    transition: all cubic-bezier(0.4, 0, 0, 1) .4s;
    &:last-child {
      margin-bottom: 0;
    }
    &.visible-when-input {
      transform: translateY(-6rem);
      opacity: 0;
    }
    &.item-1 {
      transition-delay: .4s;
    }
    &.item-2 {
      transition-delay: .35s;
    }
    &.item-3 {
      transition-delay: .3s;
    }
    .icon {
      width: 50%;
      height: 50%;
      fill: @theme;
    }
  }
}
</style>
