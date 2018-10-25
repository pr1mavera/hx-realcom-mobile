<template>
  <div class="extend-bar">
    <transition @enter="extendBarEnter">
      <div id="extendBarContainer" class="extend-bar-section extend-bar-container" ref="extendBarContainer" v-show="this.extendBarOpen">
        <div class="extend-bar-button button_1">
          <button class="img" @click="onSendGiftClick" :disabled="isRobotChat">
            <svg class="icon extend-click" aria-hidden="true">
              <use :xlink:href="sendGiftIcon"></use>
            </svg>
          </button>
          <div class="text">礼物</div>
        </div>
        <div class="extend-bar-button button_2">
          <button class="img" @click="onSendExpressClick">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-xiaolian"></use>
            </svg>
          </button>
          <div class="text">表情</div>
        </div>
        <div class="extend-bar-button button_3">
          <button class="img" @click="selectImgClick" :disabled="isRobotChat">
            <svg class="icon extend-click" aria-hidden="true">
              <use :xlink:href="sendImgIcon"></use>
            </svg>
          </button>
          <div class="text">图片</div>
          <input type="file" ref="sendImgInput" accept="image/*" @change="onSendImgChange" v-show="false"/>
        </div>
      </div>
    </transition>
    <section class="extend-bar-section send-gift-section" v-show="giftSectionShow">
      <send-gift :theme="`light`" @selectGift="selectGift"></send-gift>
    </section>
    <section class="extend-bar-section send-express-section" v-show="expressSectionShow">
      <send-express @selectEmojiWithCode="selectEmojiWithCode" @deleteBtn="this.$emit('deleteBtn')"></send-express>
    </section>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
import anime from 'animejs'
import { roomStatus } from '@/common/js/status'

export default {
  components: {
    'SendExpress': () => import('@/views/mainRoom/components/chat/send-express'),
    'SendGift': () => import('@/views/mainRoom/components/chat/send-gift')
  },
  computed: {
    isRobotChat() {
      return this.roomMode === roomStatus.AIChat
    },
    sendGiftIcon() {
      return this.isRobotChat ? '#icon-liwuzhihui' : '#icon-liwu'
    },
    sendImgIcon() {
      return this.isRobotChat ? '#icon-fasongtupianzhihui' : '#icon-fasongtupian'
    },
    ...mapGetters([
      'extendBarOpen',
      'roomMode'
    ])
  },
  data() {
    return {
      giftSectionShow: false,
      expressSectionShow: false
    }
  },
  methods: {
    selectEmojiWithCode(code) {
      this.$emit('selectEmojiWithCode', code)
    },
    selectGift(type) {
      this.$emit('sendGift', type)
    },
    selectImgClick() {
      this.$refs.sendImgInput.click()
    },
    onSendGiftClick() {
      this.giftSectionShow = true
      this.$emit('sendSectionShow')
    },
    onSendExpressClick() {
      this.expressSectionShow = true
      this.$emit('sendSectionShow')
    },
    onSendImgChange() {
      this.$emit('sendImg', this.$refs.sendImgInput.files[0])
    },
    _getPosAndScale() {
      const extendBarMaskBundle = {
        right: 13,
        bottom: 133,
        w: 30,
        h: 30
      }
      const tal_width = document.body.clientWidth || document.documentElement.clientWidth
      const tal_height = 120
      const start_pos_x = tal_width - extendBarMaskBundle.right - extendBarMaskBundle.w * 0.5
      const start_pos_y = extendBarMaskBundle.bottom + extendBarMaskBundle.h * 0.5
      const end_pos_x = tal_width * 0.5
      const end_pos_y = tal_height * 0.5
      const scale = extendBarMaskBundle.w / tal_width
      const x = end_pos_x - start_pos_x
      const y = end_pos_y - start_pos_y
      return {
        x,
        y,
        scale
      }
    },
    extendBarEnter() {
      const {x, y, scale} = this._getPosAndScale()
      const extendBarframes = anime.timeline()
      extendBarframes.add({
        targets: '#extendBarContainer',
        backgroundColor: [
          { value: ['#f4f4f4', '#fff'], duration: 100, delay: 600, easing: 'easeInOutQuart' }
        ],
        translateX: [
          { value: [-x, 0], duration: 220, delay: 100, easing: 'easeInOutQuart' }
        ],
        translateY: [
          { value: [y, 0], duration: 150, delay: 100, easing: 'easeOutQuad' }
        ],
        scaleX: [
          { value: [scale, 1], duration: 200, delay: 100, easing: 'easeInQuart' }
        ],
        scaleY: [
          { value: [scale, 1], duration: 200, delay: 100, easing: 'easeInQuart' }
        ],
        borderRadius: [
          { value: [500, 0], duration: 300, delay: 300, easing: 'easeOutCirc' }
        ]
      }).add({
        targets: '#extendBarContainer .button_1',
        translateX: [-5, 0],
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 200,
        easing: 'easeOutExpo',
        offset: 500
      }).add({
        targets: '#extendBarContainer .button_2',
        translateX: [-5, 0],
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 200,
        easing: 'easeOutExpo',
        offset: 530
      }).add({
        targets: '#extendBarContainer .button_3',
        translateX: [-5, 0],
        translateY: [30, 0],
        opacity: [0, 1],
        duration: 200,
        easing: 'easeOutExpo',
        offset: 560
      })
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.extend-bar {
  position: relative;
  .extend-bar-section {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    width: 100vw;
    height: 100vw;
    display: flex;
    align-items: center;
    text-align: center;
    &.extend-bar-container {
      margin-top: -0.8rem;
      padding: 0 2rem;
      box-sizing: border-box;
      // background-color: #000;
      overflow: hidden;
      // background-color: @bg-normal;
      .extend-bar-button {
        flex-basis: 25%;
        opacity: 0;
        .img {
          width: 4.8rem;
          height: 4.8rem;
          border: 0;
          margin: 0;
          padding: 0;
          border-radius: 50%;
          background-color: rgb(246, 246, 246);
          .icon {
            width: 2.9rem;
            height: 2.9rem;
          }
        }
        .text {
          padding-top: 0.8rem;
          line-height: 1.3rem;
          font-size: 1.3rem;
        }
      }
    }
    &.send-gift-section {
      // background-color: @bg-normal;
      .send-gift {
        width: 100%;
        box-sizing: border-box;
      }
    }
    &.send-express-section {
      background-color: @bg-normal;
      .send-express {
        width: 100%;
        height: 23rem;
        box-sizing: border-box;
      }
    }
  }

}
</style>
