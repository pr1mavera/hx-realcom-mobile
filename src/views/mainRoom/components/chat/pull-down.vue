<template>
  <div ref="pulldown" class="pulldown-wrapper" :style="pullDownStyle">
    <div class="before-trigger" v-if="beforePullDown">
      <bubble :y="bubbleY"></bubble>
    </div>
    <div class="after-trigger" v-else>
      <div v-if="isPullingDown" class="loading">
        <div class="mf-loading-container">
          <img src="/static/img/loading.gif">
        </div>
      </div>
      <div v-else><span>加载历史消息成功</span></div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import Bubble from '@/views/mainRoom/components/chat/bubble'

export default {
  components: {
    Bubble
  },
  props: {
    beforePullDown: {
      type: Boolean
    },
    isRebounding: {
      type: Boolean
    },
    isPullingDown: {
      type: Boolean
    },
    pullDownStyle: {
      type: String
    },
    bubbleY: {
      type: Number
    }
  }
}
</script>

<style lang="less">
.pulldown-wrapper {
  position: absolute;
  width: 100%;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all;
  .after-trigger {
    margin-top: 10px;
    .mf-loading-container {
      img {
        width: 20px;
        height: 20px;
        display: block;
      }
    }
  }
}
</style>
