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

  // import { beforeEnterVideo } from 'common/js/ beforeEnterVideo'

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
    enterVideoLineUp() {
      // this.beforeEnterVideo()

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

      const device = sessionStorage.getItem('device')
      const browser = sessionStorage.getItem('browser')
      const ua = navigator.userAgent.toLowerCase()

      if (device === 'Android') {
        // 若为Android设备
        const reg = /android [\d._]+/gi
        const version = (ua.match(reg) + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.')
        console.log('该Android的系统版本为：' + version)
        this.$emit('enterVideoLineUp') // 通信,进入排队页面
      } else if (device === 'iPhone') {
        //  若为ios设备，则需判断iOS的系统版本
        const ver = ua.match(/cpu iphone os (.*?) like mac os/)
        const version = parseFloat(ver[1].replace(/_/g, '.'))

        // 当前版本过低
        if (version < 11) {
          alert('当前ios的版本为：' + version + '，请升级系统版本')
          this.$emit('low-version', 'true') // 弹层提示用户当前系统版本低
        } else if (device === 'iPhone' && browser === 'wx') {
          alert('当前ios的版本为：' + version)
          // 当前在微信内置浏览器中，弹层提示用户在浏览器中打开,
          // 而且用户此时点击右上角“...”出现的菜单项只有 “在Safari中打开一项”
          this.$emit('ios-guide', 'true')
          // wx.showMenuItems({
          //   menuList: [
          //     'menuItem:openWithSafari'
          //   ] // 要显示的菜单项，只显示在浏览器中打开
          // })
          // 传参给query
          this.$router.push({
            // path : '/',
            // name : 'chat',
            query: {
              groupId: '12345678'
            }
          })
        } else if (device === 'iPhone' && browser === 'safari') {
          alert('当前ios的版本为：' + version + '！')
          // 进入排队的页面
          this.$emit('enterVideoLineUp')
        }
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
