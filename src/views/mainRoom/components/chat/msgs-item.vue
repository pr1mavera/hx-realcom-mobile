<template>
  <div class="msgs-item" :class="[{'item-padding-left': isSelf, 'item-padding-right': !isSelf}]">
    <div class="avatar" v-if="!isSelf">
      <div class="bot-avatar bg-image">
        <img width=100% height=100% src="/static/img/chat/xiaohua@2x.png">
      </div>
      <svg class="icon extend-click" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </div>
    <div class="content-box" :class="[{'right-content-box': isSelf, 'left-content-box': !isSelf}]">
      <p class="name" v-if="!isSelf">{{name}}</p>
      <div
        class="content chat-content-shadow"
        :class="[{
          'right-content-style': isSelf,
          'left-content-style': !isSelf,
          'padding-for-img': this.types === msgTypes.msg_img
        }]">
        <!-- 基本消息 -->
        <span class="text" v-if="this.types === msgTypes.msg_normal" v-html="text"></span>
        <!-- 转人工 -->
        <span class="text" v-if="this.types === msgTypes.msg_no_idea">
          小华智力有限，好像听不太懂您的问题呢，可转
          <span class="button" @click="enterToMenChat">人工客服</span>
        </span>
        <!-- 热点问题 -->
        <span class="text" v-if="this.types === msgTypes.msg_hot">
          {{text}}
          <span class="line"></span>
          <span class="text-extend-hot">
            <span class="text-extend">您可能想问：</span>
            <span class="text-extend button" v-for="(item, index) in this.extend" :key="index" @click="clickHotQues(item.question)">{{item.question}}</span>
            <!-- <span class="text-extend button" @click="enterToMenChat">人工客服</span> -->
          </span>
        </span>
        <!-- 图片消息 -->
        <span class="text text-img" v-if="this.types === msgTypes.msg_img">
          <img class="text-img" height=100% :src="this.imgSrc.small">
        </span>
        <!-- 礼物消息 -->
        <span class="text gift-item" v-if="this.types === msgTypes.msg_gift">
          我送给{{this.csInfo.csName || '客服'}}一个{{this.giftInfo.name}} !
          <img class="text-gift" :src="`/static/img/${this.giftInfo.url}@2x.png`">
        </span>
        <!-- 留言 -->
        <span class="text" v-if="this.types === msgTypes.msg_leave">客服暂时不在，请<span class="button">点击留言</span>~</span>
        <!-- 猜问题 -->
        <span class="text" v-if="this.types === msgTypes.msg_guess">我猜您想知道这些问题</span>
        <!-- 名片消息 -->
        <span class="text" v-if="this.types === msgTypes.msg_card">
          <div class="text-card">
            <div class="card-left">
              <span class="name">{{this.proxyInfo.agentName}}</span>
              <!-- <span class="sex">{{this.proxyInfo.agentSex}}</span> -->
              <span class="sex">
                <svg class="icon extend-click" aria-hidden="true">
                  <use xlink:href="#icon-nan"></use>
                </svg>
              </span>
            </div>
            <div class="card-right">
              <ul>
                <li class="infoList">
                  <span class="title">工号：</span>
                  <span class="val">{{this.proxyInfo.agentId}}</span>
                </li>
                <li class="infoList">
                  <span class="title">所属渠道：</span>
                  <span class="val">个险</span>
                </li>
                <li class="infoList">
                  <span class="title">电话：</span>
                  <span class="val phone" @click="callPhone($event)">{{this.proxyInfo.agentPhone}}</span>
                </li>
              </ul>
            </div>
          </div>
        </span>
      </div>
      <!-- 猜问题 模块 -->
      <div class="content chat-content-shadow left-content-style content-extend" v-if="this.types === msgTypes.msg_guess">
        <span class="text">
          <span class="text-extend button" v-for="(item, index) in this.extend" :key="index" @click="clickHotQues(item.question)">{{item.question}}</span>
          <!-- <span class="text-extend button" @click="enterToMenChat">人工客服</span> -->
        </span>
      </div>
    </div>
    <!-- <div class="avatar" v-show="false">
      <svg class="icon extend-click" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </div> -->
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
import { msgTypes } from '@/common/js/status'

export default {
  props: {
    isSelf: {
      type: Boolean
    },
    name: {
      type: String
    },
    text: {
      type: String
    },
    types: {
      type: String
    },
    extend: {
      type: Array
    },
    imgSrc: {
      type: Object
    },
    giftInfo: {
      type: Object
    },
    proxyInfo: {
      type: Object
    }
  },
  data() {
    return {
      msgTypes: msgTypes
    }
  },
  computed: {
    ...mapGetters([
      'csInfo'
    ])
  },
  mounted() {
    console.log('chat-content-item ===> 你个组件你被引用了哈哈哈')
  },
  methods: {
    callPhone(event) {
      const e = event || window.event
      window.location.href = `tel:${e.currentTarget.innerText}`
    },
    enterToMenChat() {
      this.$emit('enterToMenChat')
    },
    clickHotQues(ques) {
      this.$emit('clickHotQues', ques)
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.msgs-item {
  width: calc(~'100% - 9rem');
  // padding-top: 1.2rem;
  // padding-bottom: 1.2rem;
  display: flex;
  &.item-padding-left {
    padding-left: 9rem;
  }
  &.item-padding-right {
    padding-right: 9rem;
  }
  .avatar {
    position: relative;
    width: 4.2rem;
    height: 4.2rem;
    background-color: @text-light;
    border-radius: 50%;
    margin: 0 1.2rem;
    overflow: hidden;
    align-items: flex-start;
    .bot-avatar {
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      img {
        object-fit: cover;
      }
      // .bg-image('~/static/img/chat/xiaohua');
    }
    .icon {
      width: 1.2rem;
      height: 1.2rem;
      padding: 1.5rem;
      fill: @label-line-normal;
    }
  }
  .content-box {
    // position: relative;
    width: calc(~'100% - 6.6rem');
    font-size: 1.4rem;
    display: flex;
    flex-direction: column;
    &.left-content-box {
      align-items: flex-start;
    }
    &.right-content-box {
      align-items: flex-end;
    }
    .name {
      font-size: 1.2rem;
      color: @text-light;
      line-height: 1.8rem;
    }
    .content {
      // position: absolute;
      // top: 2.3rem;
      display: inline-block;
      width: auto;
      max-width: 100%;
      padding: 0.9rem 1.2rem;
      margin-bottom: 1.4rem;
      box-sizing: border-box;
      &.left-content-style {
        border-radius: 0.4rem 1.5rem 1.5rem 1.5rem;
        color: @text-normal;
        background-color: @bg-light;
        .chat-content-shadow(@bg-light-shadow)
        // left: 0;
      }
      &.right-content-style {
        border-radius: 1.5rem 0.4rem 1.5rem 1.5rem;
        color: @text-lighter;
        background-color: @text-special;
        .chat-content-shadow(@text-special-shadow)
        // right: 0;
      }
      &.content-extend{
        width: 100%;
        .text {
          .text-extend {
            display: block;
            margin-bottom: 0.6rem;
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
      &.padding-for-img {
        padding: 0;
        overflow: hidden;
        box-shadow: none;
        .text {
          display: inline-block;
          height: 12rem;
          background-color: #f00;
        }
      }
      .text {
        position: relative;
        line-height: 2rem;
        max-width: 100%;
        word-wrap: break-word;
        &.gift-item {
          padding-left: 2rem;
        }
        .text-gift {
          position: absolute;
          width: 5.8rem;
          top: 0;
          bottom: 0;
          left: -4.5rem;
          margin: auto;
        }
        .text-img {
          vertical-align: middle;
        }
        .button {
          color: rgb(82, 144, 239);
        }
        .line {
          display: block;
          width: 100%;
          height: 0.1rem;
          transform-origin: bottom left;
          transform: scaleY(0.5);
          background: linear-gradient(to right, @text-lighter-a, @text-lighter-a 0.5rem, transparent 0.5rem, transparent);
          background-size: 1rem 100%;
          margin: 0.9rem 0;
        }
        .text-label {
          color: @text-lighter-a;
        }
        .text-extend-hot {
          .text-extend {
            display: block;
            margin-bottom: 0.6rem;
            &:first-child {
              color: @text-lighter-a;
            }
            &:last-child {
              margin-bottom: 0;
            }
          }
        }
        .text-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
          .card-left {
            width: 5.6rem;
            vertical-align: center;
            // text-align: center;
            margin-right: 1.2rem;
            .name {
              display: inline-block;
              font-size: 1.5rem;
              font-weight: 400;
              color: @text-normal;
              // line-height: 3.5rem;
              margin-bottom: 1rem;
            }
            .sex {
              width: 1.2rem;
              height: 1.2rem;
              display: block;
              .icon {
                width: 100%;
                height: 100%;
                fill: rgb(82, 144, 239);
              }
            }
          }
          .card-right {
            font-size: 1.2rem;
            ul {
              .infoList {
                .title {
                  color: @text-lighter-a;
                }
                .val {
                  color: @text-light;
                  &.phone {
                    color: rgb(82, 144, 239);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
