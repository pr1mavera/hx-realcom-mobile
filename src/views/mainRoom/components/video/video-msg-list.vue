<template>
  <div class="video-msg-list">
    <ul>
      <li class="video-msg-item" v-for="(item, index) in v_msgs" :key="index">
        <div class="item-wrapper">
          <span class="level-label">
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-zuanshi"></use>
            </svg>
            8
          </span>
          <span class="text">{{item.text}}</span>
          <i v-if="item.gift" class="gift-area">
            <img width=100% height=100% :src="`/video/static/img/${item.gift}@2x.png`">
          </i>
        </div>
      </li>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  data() {
    return {
      v_msgs: [
        {
          text: '木子李送给客服一个草莓蛋糕',
          gift: 'caomeidangao'
        },
        {
          text: '木子李已经评价了客服'
        },
        {
          text: '木子李已分享到微信'
        }
      ]
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';

.video-msg-list {
  ul {
    .video-msg-item {
      width: 100%;
      height: 2.5rem;
      line-height: 1.5rem;
      margin-bottom: 1.2rem;
      color: @text-lighter;
      font-size: 1.2rem;
      .item-wrapper {
        position: relative;
        display: inline-block;
        height: 100%;
        background-color: rgba(0, 0, 0, .3);
        border-radius: .2rem;
        padding: 0.5rem 0.4rem;
        box-sizing: border-box;
        &::nth-child {
          display: inline-block;
          vertical-align: top;
        }
        .level-label {
          width: 3rem;
          height: 1.5rem;
          background-color: #FF959C;
          border-radius: .2rem;
          padding: 0 0.2rem 0 0.6rem;
          .icon {
            width: 1rem;
            height: 0.75rem;
            fill: @text-lighter;
          }
        }
        .text {
          padding: 0 0.4rem;
        }
        .gift-area {
          position: absolute;
          top: 0;
          bottom: 0;
          right: -2.5rem;
          // left: 0;
          margin: auto;
          width: 3rem;
          height: 3rem;
        }
      }
    }
  }
}
</style>
