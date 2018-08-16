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

<!--<script src="http://res.wx.qq.com/open/js/jweixin-1.0.0.js"></script>-->

<script type="text/ecmascript-6">

export default {
  data() {
    return {
      iosGuide: false
    }
  },
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
      // 判断手机类型, 系统的版本
      const u = navigator.userAgent
      // 若当前手机为安卓机
      if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
        this.$emit('enterVideoLineUp')
        // 判断系统的版本
        const ua = navigator.userAgent.toLowerCase()
        const reg = /android [\d._]+/gi
        const version = (ua.match(reg) + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.')
        console.log('Android的版本为' + version)
      } else if (u.indexOf('iPhone') > -1) {
        // 当前手机为苹果手机
        const ua = navigator.userAgent.toLowerCase()
        // 判断是否在微信内置浏览器内
        // eslint-disable-next-line
        if (ua.match(/MicroMessenger/i) == 'micromessenger') {
          this.$emit('ios-guide', 'true')// 将传数据给其父元素
          // 点击右上角显示的菜单项
          // wx.showMenuItems({
          //   menuList: [
          //     'menuItem:openWithSafari'
          //   ] // 要显示的菜单项，
          // })
        } else {
          this.$emit('enterVideoLineUp')
        }
      } else if (u.indexOf('Windows Phone') > -1) {
        alert(' window phone（同学赶紧换个手机吧） ')
      }
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
