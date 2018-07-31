// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
// import FastClick from 'fastclick'
import { WechatPlugin, AlertPlugin, ToastPlugin, ConfirmPlugin, LoadingPlugin } from 'vux'
import router from './router'

Vue.use(WechatPlugin)
Vue.use(AlertPlugin)
Vue.use(ToastPlugin)
Vue.use(ConfirmPlugin)
Vue.use(LoadingPlugin)

// FastClick.attach(document.body) // 移动端消除300ms

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
