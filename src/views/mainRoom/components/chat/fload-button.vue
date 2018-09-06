<template>
  <div class="fload-button">
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="callPhone"
      :class="[{'visible-when-input': barStatus, 'item-1': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-dianhuakefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="enterVideoLineUp"
      :class="[{'visible-when-input': barStatus, 'item-2': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-shipinkefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      :class="[{'visible-when-input': barStatus, 'item-3': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-zhuanshukefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      :class="[{'visible-when-input': barStatus, 'item-4': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-pinglun"></use>
      </svg>
    </button>
  </div>
</template>

<script type="text/ecmascript-6">

  import { beforeEnterVideo } from '@/common/js/beforeEnterVideo'

export default {
  props: {
    barStatus: {
      type: Boolean
    }
  },
  methods: {
    callPhone() {
      window.location.href = 'tel:95300'
    },
    // _beforeEnterVideo() {
    //   beforeEnterVideo()
    // },
    enterVideoLineUp() {
      beforeEnterVideo()

      // WebRTCAPI.fn.detectRTC({
      //   screenshare: false
      // }, function(info) {
      //   if (info.support) {
      //     // 判断手机类型, 系统的版本
      //     const device = sessionStorage.getItem('device')
      //     const browser = sessionStorage.getItem('browser')
      //     if (browser === 'wx' && device === 'iPhone') {
      //       this.$emit('ios-guide', 'true')
      //     } else {
      //       this.$emit('enterVideoLineUp')
      //     }
      //   } else {
      //     alert('不支持WebRTC')
      //   }
      // })
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
    width: 3.4rem;
    height: 3.4rem;
    padding: 0;
    margin-bottom: 2.2rem;
    border: 0;
    // border: 0.2rem solid @theme;
    border-radius: 50%;
    // background-color: @bg-light;
    transition: all cubic-bezier(0.4, 0, 0, 1) .2s;
    &:last-child {
      margin-bottom: 0;
    }
    &.visible-when-input {
      transform: translateY(-3rem);
      opacity: 0;
    }
    &.item-1 {
      transition-delay: .34s;
    }
    &.item-2 {
      transition-delay: .31s;
    }
    &.item-3 {
      transition-delay: .28s;
    }
    &.item-4 {
      transition-delay: .25s;
    }
    .icon {
      width: 100%;
      height: 100%;
      // fill: @theme;
    }
  }
}
</style>
