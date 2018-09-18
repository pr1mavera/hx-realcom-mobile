<template>
  <div class="send-express">
    <div class="menu-nav">
      <div class="nav-list">
        <tab :line-width="99" bar-active-color="#f4f4f4">
          <tab-item :selected="currIndex === 0" @on-item-click="currIndex = 0">
            <div class="menu-nav-item">
              <svg class="icon extend-click" aria-hidden="true">
                <use xlink:href="#icon-lishibiaoqing"></use>
              </svg>
            </div>
          </tab-item>
          <tab-item :selected="currIndex === 1" @on-item-click="currIndex = 1">
            <div class="menu-nav-item">
              <svg class="icon extend-click" aria-hidden="true">
                <use xlink:href="#icon-biaoqing-"></use>
              </svg>
            </div>
          </tab-item>
          <tab-item :selected="currIndex === 2" @on-item-click="currIndex = 2">
            <div class="menu-nav-item">
              <div class="menu-nav-xiaohua bg-image"></div>
              <!-- <svg class="icon extend-click" aria-hidden="true">
                <use xlink:href="#icon-wode"></use>
              </svg> -->
            </div>
          </tab-item>
        </tab>
      </div>
      <div class="nav-delete">
        <div class="menu-nav-item">
          <div class="menu-nav-delete" @click="this.$emit('deleteBtn')">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-chahao"></use>
            </svg>
          </div>
        </div>
      </div>
    </div>
    <div class="page-area">
      <div class="history-emoji" v-if="currIndex === 0">
        <p v-if="!express[0].list.length" class="history-text">您当前还未发过表情</p>
        <ul v-else>
          <li
            class="history-item-li"
            v-for="item in express[0].list"
            v-html="item.code"
            :key="item.id"
            @click="selectEmoji(item.code)"
          ></li>
        </ul>
      </div>
      <div class="emoji-swiper" v-if="currIndex === 1">
        <swiper dots-position="center">
          <swiper-item v-for="(page, index) in express[1].list" :key="index">
            <ul>
              <li
                class="swiper-item-li"
                v-for="list in page.pageList"
                v-html="list.code"
                :key="list.id"
                @click="selectEmoji(list.code)"
              ></li>
            </ul>
          </swiper-item>
        </swiper>
      </div>
      <div class="xiaohua-express" v-if="currIndex === 2">
        <send-extend-item
          v-for="(item, index) in express[2].list"
          :key="index"
          :mode="item.mode"
          :icon="item.icon"
        ></send-extend-item>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { Tab, TabItem, Swiper, SwiperItem } from 'vux'
import { emojiMap } from '@/common/js/emojiMap'

export default {
  components: {
    Tab,
    TabItem,
    Swiper,
    SwiperItem,
    'SendExtendItem': () => import('@/views/mainRoom/components/chat/send-extend-item')
  },
  props: {
    inputPos: {
      type: Number
    }
  },
  data() {
    return {
      currIndex: 1,
      express: [
        {
          name: 'history',
          list: [
            // {
            //   code: '&#x1F600;',
            //   id: 0
            // }
          ]
        },
        {
          name: 'emoji',
          list: []
        },
        {
          name: 'xiaohua',
          list: [
            {
              icon: 'caomeidangao',
              text: ''
            },
            {
              icon: 'caomeidangao',
              text: ''
            }
          ]
        }
      ]
    }
  },
  mounted() {
    const self = this
    this.$nextTick(() => {
      self._normalizeEmojiList()
    })
  },
  methods: {
    _normalizeEmojiList() {
      const row = 3 // 行
      const col = 8 // 列
      const singleNum = row * col // 一页的表情个数
      const totalPage = (emojiMap.length / singleNum >>> 0) + 1 // 页数
      const map = emojiMap
      for (let i = 0; i < totalPage; i++) {
        const list = map.slice(i * singleNum, (i + 1) * singleNum)
        const temp = {
          page: i + 1,
          pageList: list
        }
        this.express[1].list.push(temp)
      }
      console.dir(this.express[1].list)
    },
    selectEmoji(code) {
      this.$emit('selectEmojiWithCode', code)
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.send-express {
  position: relative;
  width: 100%;
  height: 100%;
  .menu-nav {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 4.6rem;
    background-color: @bg-light;
    display: flex;
    justify-content: space-between;
    .nav-list {
      width: 13.8rem;
      height: 4.6rem;
      .vux-tab-wrap {
        width: 100%;
        height: 100%;
        padding-top: 0;
        .vux-tab-container {
          height: 100%;
          .vux-tab {
            height: 100%;
            .menu-nav-item {
              position: absolute;
              z-index: 5;
              width: 4.6rem;
              height: 4.6rem;
              .menu-nav-xiaohua {
                width: 2.4rem;
                height: 2.4rem;
                margin: 1.1rem;
                .bg-image('@{imgPath}/chat/xiaohua');
              }
              .icon {
                display: block;
                width: 2.4rem;
                height: 2.4rem;
                padding: 1.1rem;
                fill: #000;
                background-color: transparent;
              }
            }
            .vux-tab-ink-bar {
              z-index: 0;
            }
          }
        }
      }
    }
    .nav-delete {
      .menu-nav-item {
        width: 4.6rem;
        height: 4.6rem;
        .menu-nav-delete {
          position: relative;
          width: 2.8rem;
          height: 2rem;
          margin: 1.3rem 0 1.3rem 1rem;
          background-color: #FF444A;
          border-top-right-radius: .3rem;
          border-bottom-right-radius: .3rem;
          &::before {
            content: '';
            position: absolute;
            top: 0;
            left: -1.6rem;
            border-right: #FF444A solid 0.8rem;
            border-left: #fff solid 0.8rem;
            border-top: #fff solid 1rem;
            border-bottom: #fff solid 1rem;
            width: 0;
            height: 0;
          }
          .icon {
            display: block;
            width: 1rem;
            height: 1rem;
            padding: 0.5rem 0 0.5rem 0.8rem;
            fill: #fff;
          }
        }

      }
    }
  }
  .page-area {
    width: 100%;
    height: 100%;
    padding-bottom: 4.6rem;
    box-sizing: border-box;
    .history-emoji {
      position: relative;
      width: 100%;
      height: 100%;
      padding: 1.8rem 2.6rem;
      box-sizing: border-box;
      .history-text {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        font-size: 1.4rem;
        height: 1.4rem;
        color: @text-normal;
      }
      ul {
        display: flex;
        justify-content: flex-start;
        flex-wrap: wrap;
        .history-item-li {
          // width: 2.4rem;
          // height: 2.4rem;
          font-size: 2.4rem;
          padding-bottom: 1rem;
          flex-basis: 12.5%;
          text-align: center;
        }
      }
    }
    .emoji-swiper {
      width: 100%;
      height: 100%;
      .vux-slider {
        width: 100%;
        height: 100%;
        .vux-swiper {
          width: 100%;
          height: 100%!important;
          .vux-swiper-item {
            width: 100%;
            height: 100%;
            padding: 1.8rem 2.6rem;
            box-sizing: border-box;
            ul {
              display: flex;
              justify-content: flex-start;
              flex-wrap: wrap;
              .swiper-item-li {
                // width: 2.4rem;
                // height: 2.4rem;
                font-size: 2.4rem;
                padding-bottom: 1rem;
                flex-basis: 12.5%;
                text-align: center;
              }
            }
          }
        }
      }
    }
    .xiaohua-express {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-start;
      padding: 2.4rem 1.8rem;
      .send-extend-item {
        height: 8.6rem;
        flex-basis: 25%;
        text-align: center;
      }
    }
  }
}
</style>
