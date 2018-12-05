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
// import { mapGetters, mapMutations } from 'vuex'
// import Tools from '@/common/js/tools'
// import wxConfig from './config/wechat'

export default {
  name: 'App',
  components: {
    'MainRoom': () => import('@/views/mainRoom'),
    'Share': () => import('@/views/share')
  },
  // computed: {
    // ...mapGetters([
    //   'msgs'
    // ])
  // },
  created() {
    deviceConfig()
    // wxConfig()
    window.addEventListener('offline', () => {
      this.$vux.toast.show({
        type: 'text',
        text: '哎呀，断网了 (-_-||)',
        position: 'top',
        width: '80%',
        time: 5000
      })
      // let msgsList = Tools.CopyTools.arrShallowClone(this.msgs)
      // msgsList.forEach((item) => {
      //   if (item.status === 'pending') {
      //     let newMsg = Tools.CopyTools.objDeepClone(item)
      //     newMsg.status = 'failed'
      //     item = newMsg
      //   }
      // })
      // this.setMsgs(msgsList)
    }, true)
  },
  activated() {
    this.$setgoindex()
  }
  // methods: {
  //   ...mapMutations({
  //     setMsgs: 'SET_MSGS'
  //   })
  // }
}

// function refresh() {
//   var docEle = document.documentElement
//   docEle.style.fontSize = docEle.clientWidth / 37.5 + 'px'
// }
// refresh()
// window.onresize = refresh
</script>

<style type="text/css" lang="less">
@import '~vux/src/styles/reset.less';

/*- 引入关闭按钮 -*/
/*@import '~vux/src/styles/close.less';*/

input, textarea{
  -webkit-appearance: none;
  outline: none;
}
button {
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
a {
  color: rgb(82, 144, 239);
}
/*防止iPhone X 底部小黑条遮挡页面最底部内容的情况*/
body {
  padding-bottom: constant(safe-area-inset-bottom);
}

#app {
  height: 100%;
  font-family: "lucida grande", "lucida sans unicode", lucida, helvetica, "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
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

/* 评论组件中轮播图圆点的样式 */
.popup-main .eva-more .vux-slider > .vux-indicator > a > .vux-icon-dot.active {
  background-color: #ff444a!important;
}
.popup-main .eva-more .vux-slider > .vux-indicator > a > .vux-icon-dot {
  border: 1px solid #ff444a;
  border-radius: 50%;
  background-color: #f1f1f1;
}

/*-小按钮的边框的颜色-*/
.weui-btn:after {
  border: 1px solid #FF959C!important;
}

/*-,评价组件星星颜色-*/
.popup-main .vux-rater-box {
  fill: #bfbfbf;
}

.popup-main .is-active {
  fill: #FEC656;
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

.vux-alert, .vux-confirm {
  .vux-x-dialog {
    .weui-mask {
      z-index: 2000;
    }
    .weui-dialog {
      width: 70%;
      border-radius: 9px;
      .weui-dialog__hd {
        padding: 1.8em 1.6em 0.5em;
        .weui-dialog__title {
          font-size: 1.6rem;
        }
      }
      .weui-dialog__bd {
        min-height: unset!important;
      }
      .weui-dialog__ft {
        line-height: 44px;
        a {
          color: rgba(33, 150, 243, 1)!important;
        }
      }
    }
  }
}
</style>
