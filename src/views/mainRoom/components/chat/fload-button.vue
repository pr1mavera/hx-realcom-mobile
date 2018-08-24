<template>
  <div class="fload-button">
    <button
      class="item extend-click transition-bezier"
      :disabled="inputStatus"
      @click="callPhone"
      :class="[{'visible-when-input': inputStatus, 'item-1': !inputStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-dianhuakefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="inputStatus"
      @click="enterVideoLineUp"
      :class="[{'visible-when-input': inputStatus, 'item-2': !inputStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-shipinkefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="inputStatus"
      :class="[{'visible-when-input': inputStatus, 'item-3': !inputStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-zhuanshukefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="inputStatus"
      :class="[{'visible-when-input': inputStatus, 'item-4': !inputStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-pinglun"></use>
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

      // 判断手机类型, 系统的版本
      const device = sessionStorage.getItem('device')
      const browser = sessionStorage.getItem('browser')
      const ua = navigator.userAgent.toLowerCase()

      if (device === 'Android') {
        const reg = /android [\d._]+/gi
        const version = (ua.match(reg) + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.')
        console.log('该Android的版本为：' + version)
        this.$emit('enterVideoLineUp')
      } else if (device === 'iPhone') {
          // 判断iOS的系统版本
          const ver = ua.match(/cpu iphone os (.*?) like mac os/)
          const version = parseFloat(ver[1].replace(/_/g, '.'))
          if (version < 11) {
            alert('当前ios的版本为：' + version + '，请升级系统版本')
            this.$emit('low-version', 'true')
          } else if (device === 'iPhone' && browser === 'wx') {
            alert('当前ios的版本为：' + version)
              // 当前在微信内置浏览器中，弹层提示用户在浏览器中打开
              this.$emit('ios-guide', 'true')
              // 传参给query
              this.$router.push({
                  path: '/',
                  name: 'chat',
                  query: {
                    groupId: '12345678'
                  }
              })
          } else if (device === 'iPhone' && browser === 'safari') {
              alert('当前ios的版本为：' + version + '！')
              this.$emit('enterVideoLineUp')
          }
      }
      // else if (device === 'iPhone' && browser === 'wx') {
        // 将传数据给其父元素,弹层提示用户在浏览器中打开
        // this.$emit('ios-guide', 'true')
        // return
        // 点击右上角显示的菜单项
        // wx.showMenuItems({
        //   menuList: [
        //     'menuItem:openWithSafari'
        //   ] // 要显示的菜单项，只显示在浏览器中打开
        // })
      // } else if (device === 'iPhone' && browser === 'safari') {
      //   this.$emit('enterVideoLineUp')
      // }
      // this.$emit('enterVideoLineUp')
      // // 若当前手机为安卓机
      // if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {
      //   this.$emit('enterVideoLineUp')
      //   // 判断系统的版本
      //   const ua = navigator.userAgent.toLowerCase()
      //   const reg = /android [\d._]+/gi
      //   const version = (ua.match(reg) + '').replace(/[^0-9|_.]/ig, '').replace(/_/ig, '.')
      //   console.log('Android的版本为：' + version)
      //
      //   在此处为测试 拉取漫游信息
      //   const groupID = '12345678'
      //   const ReqMsgNumber = 3
      //   WebRTCRoom.syncGroupC2CMsg(groupID, ReqMsgNumber, (res) => {
      //    alert(JSON.stringify(res.data.RspMsgList))
      //   }, () => {
      //     console.log('fails')
      //   })
      // } else if (u.indexOf('iPhone') > -1) {
      //   // 当前手机为苹果手机
      //   const ua = navigator.userAgent.toLowerCase()
      //   // eslint-disable-next-line
      //   if (ua.match(/MicroMessenger/i) == 'micromessenger') {
      //     this.$emit('ios-guide', 'true') // 将传数据给其父元素,提示用户在浏览器中打开
      //     // alert('这是微信内置浏览器')
      //     // 点击右上角显示的菜单项
      //     // wx.showMenuItems({
      //     //   menuList: [
      //     //     'menuItem:openWithSafari'
      //     //   ] // 要显示的菜单项，只显示在浏览器中打开
      //     // })
      //   } else {
      //     this.$emit('enterVideoLineUp')
      //     // alert('这不是微信内置浏览器')
      //   }
      // } else if (u.indexOf('Windows Phone') > -1) {
      //   alert(' window phone（同学赶紧换个手机吧） ')
      // }
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
