<template>
  <div class="send-express">
    <div class="menu-nav">
      <div class="nav-list">
        <tab :line-width="99" bar-active-color="#f4f4f4">
          <tab-item :selected="currIndex === 0" @on-item-click="onEmojiMenuClick">
            <div class="menu-nav-item">
              <svg class="icon extend-click" aria-hidden="true">
                <use xlink:href="#icon-wode"></use>
              </svg>
            </div>
          </tab-item>
          <tab-item :selected="currIndex === 1" @on-item-click="onEmojiMenuClick">
            <div class="menu-nav-item">
              <svg class="icon extend-click" aria-hidden="true">
                <use xlink:href="#icon-wode"></use>
              </svg>
            </div>
          </tab-item>
          <tab-item :selected="currIndex === 2" @on-item-click="onEmojiMenuClick">
            <div class="menu-nav-item">
              <svg class="icon extend-click" aria-hidden="true">
                <use xlink:href="#icon-wode"></use>
              </svg>
            </div>
          </tab-item>
        </tab>
      </div>
      <div class="nav-delete">
        <div class="menu-nav-item">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-wode"></use>
          </svg>
        </div>
      </div>
    </div>
    <div class="page-area">
      <div v-if="currIndex === 0">
        0000000000000
      </div>
      <div class="emoji-swiper" v-if="currIndex === 1">
        <swiper  dots-position="center">
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
      <div v-if="currIndex === 2">
        2222222222222
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
    SwiperItem
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
          icon: '#icon-wode',
          list: [
            '#icon-wode',
            '#icon-wode',
            '#icon-wode',
            '#icon-wode'
          ]
        },
        {
          name: 'emoji',
          icon: '#icon-wode',
          list: []
        },
        {
          name: 'xiaohua',
          icon: '#icon-wode',
          list: [
            '#icon-wode',
            '#icon-wode',
            '#icon-wode',
            '#icon-wode'
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
    onEmojiMenuClick(index) {
      this.currIndex = index
    },
    selectEmoji(code) {
      this.$emit('selectEmojiWithCode', code)
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';

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
              .icon {
                display: block;
                width: 2rem;
                height: 2rem;
                padding: 1.3rem;
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
        .icon {
          display: block;
          width: 2rem;
          height: 2rem;
          padding: 1.3rem;
          fill: #000;
          background-color: transparent;
        }
      }
    }
  }
  .page-area {
    width: 100%;
    height: 100%;
    padding-bottom: 4.6rem;
    box-sizing: border-box;
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
            padding: 2.6rem;
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
  }
}
</style>
