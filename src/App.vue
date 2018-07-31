<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
import deviceConfig from './config/device'
import wxConfig from './config/wechat'

export default {
  name: 'App',
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
</script>

<style lang="less">
@import '~vux/src/styles/reset.less';

input, textarea{
  -webkit-appearance: none;
  outline: none;
}
html, body {
  width: 100%;
  height: 100%;
  font-size: 62.5%;
}
#app {
  height: 100%;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
