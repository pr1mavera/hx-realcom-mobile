<template>
  <div id="app">
    <keep-alive>
      <router-view></router-view>
      <!--<main-room></main-room>-->
      <!--<share v-if="false"></share>-->
    </keep-alive>
  </div>
</template>

<script>
import deviceConfig from './config/device'
import wxConfig from './config/wechat'

export default {
  name: 'App',
  components: {
    'MainRoom': () => import('@/views/mainRoom'),
    'Share': () => import('@/views/share')
  },
  created() {
    deviceConfig()
    wxConfig()
  }
  // watch: {
  //   $route() {
  //     wxConfig()
  //   }
  // }
}

function refresh() {
  var docEle = document.documentElement
  docEle.style.fontSize = docEle.clientWidth / 37.5 + 'px'
}
refresh()
window.onresize = refresh
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';

/*- 引入关闭按钮 -*/
/*@import '~vux/src/styles/close.less';*/

input, textarea{
  -webkit-appearance: none;
  outline: none;
}
ul, li, ol, dl {
  list-style-type: none;
}
html, body {
  width: 100%;
  height: 100%;
  /*font-size: 62.5%;*/
}
/*防止iPhone X 底部小黑条遮挡页面最底部内容的情况*/
body {
  padding-bottom: constant(safe-area-inset-bottom);
}
#app {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#app .weui-dialog {
  opacity: .85;
  overflow: auto;
  border-radius: 10px;
  .weui-dialog__ft {
    .weui-dialog__btn, .weui-dialog__btn_default, .weui-dialog__btn_primary {
      color: #2196f3;
    }
  }
}

.popup-main .eva-more .vux-slider > .vux-indicator > a > .vux-icon-dot.active {
  background-color: #ff444a!important;
}

.popup-main .eva-more .vux-slider > .vux-indicator > a > .vux-icon-dot {
  border: 1px solid #ff444a;
  border-radius: 50%;
  background-color: #f1f1f1;
}

/*---------对Nexus5做响应式------------*/
@media screen and(min-width: 321px) and(max-width: 360px) {
  html {
    font-size: 9.6px !important;
  }
}

/*-------对iPhone5做响应式-----------*/
@media screen and(max-width: 321px) {
  html {
    font-size: 8.5333px !important;
    // font-size: 41.92637px !important; // font-size:41.857137680 px !important;
  }
}

/*---------对iPhone6做响应式---------*/
@media screen and(min-width: 361px) and (max-width: 376px) {
  html {
    font-size: 10px !important;
  }
}

/*-------对iPhone6 plus做响应式------*/
@media screen and(min-width: 376px) and (max-width: 475px) {
  html {
    font-size: 11.04px !important;
  }
}

/*---------对微信浏览器做的响应式-------*/
@media screen and(min-width: 500px) and (max-width: 680px) {
  html {
    font-size: 13.8889px !important;
  }
}

@media screen and(min-width: 680px) {
  html {
    font-size: 17px !important;
  }
}

/*------------------pc端--------------*/
@media screen and(min-width: 768px) {
  html {
    font-size: 11.2px !important;
  }
}
</style>
