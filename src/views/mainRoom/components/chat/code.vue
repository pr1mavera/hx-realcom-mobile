<template>
  <div>
    <div class="code_mask" @click='$emit("close")'></div>
    <div class="small_program_code">
      <img class="img_bg" src="/video/static/img/chat/code.png" alt width="100%" height="100%" />
      <img class="img_s_code" src="/video/static/img/chat/small_code.png" alt />
      <p class="title">视频客服已转移至新的小程序,长按识别上方小程序码，进入小程序或微信搜索“华夏视频客服”进入小程序</p>
    </div>
  </div>
</template>
<style lang="less">
@import "~@/common/style/mixin.less";
@import "~@/common/style/theme.less";
.small_program_code {
  height: 37.5rem;
  width: 30rem;
  position: fixed;
  margin: auto;
  top: -10rem;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 10;
}
.small_program_code .img_s_code {
  position: absolute;
  height:14rem;
  width:14rem;
  margin: auto;
  top: 4rem;
  left: 0;
  right: 0;
}
.small_program_code .title {
  width: 23rem;
  text-align: center;
  font-size: 1.4rem;
  font-family: MicrosoftYaHei;
  font-weight: bold;
  color: rgba(102, 102, 102, 1);
  line-height: 2.4rem;
  position: absolute;
  margin: auto;
  top: 20rem;
  left: 0;
  right: 0;
}
.code_mask {
  height: 100%;
  width: 100%;
  position: absolute;
  bottom: 0;
  background: #000;
  opacity: 0.7;
  z-index: 5;
}
</style>
