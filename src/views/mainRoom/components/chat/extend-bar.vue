<template>
  <div class="extend-bar">
    <transition
      @enter="extendBarEnter"
      @after-enter="extendBarAfterEnter"
      @leave="extendBarLeave"
      @after-leave="extendBarAfterLeave">
      <div id="extendBarMask" class="extend-bar-mask" ref="extendBarMask" v-show="isMask && this.extendBarOpen"></div>
    </transition>
    <transition
      @enter="containerEnter"
      @after-enter="containerAfterEnter"
      @leave="containerLeave"
      @after-leave="containerAfterLeave">
      <div id="extendBarContainer" class="extend-bar-container" ref="extendBarContainer" v-show="this.extendBarOpen">
        <div class="extend-bar-button button_1">
          <button class="img bg-image">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-liwu"></use>
            </svg>
          </button>
          <div class="text">礼物</div>
        </div>
        <div class="extend-bar-button button_2">
          <button class="img">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-xiaolian"></use>
            </svg>
          </button>
          <div class="text">表情</div>
        </div>
        <div class="extend-bar-button button_3">
          <button class="img">
            <svg class="icon extend-click" aria-hidden="true">
              <use xlink:href="#icon-fasongtupian"></use>
            </svg>
          </button>
          <div class="text">图片</div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
import anime from 'animejs'

export default {
  computed: {
    ...mapGetters([
      'extendBarOpen'
    ])
  },
  data() {
    return {
      extendBarKeyframes: {},
      isMask: true
    }
  },
  methods: {
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
      const scale = tal_width / extendBarMaskBundle.w
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

      const extendBarKeyframes = anime({
        targets: '#extendBarMask',
        translateX: [
          { value: x, duration: 220, delay: 200, easing: 'easeInOutQuart' }
        ],
        translateY: [
          { value: -y, duration: 150, delay: 200, easing: 'easeOutQuad' }
        ],
        scaleX: [
          { value: scale, duration: 200, delay: 250, easing: 'easeInQuart' }
        ],
        scaleY: [
          { value: scale, duration: 200, delay: 250, easing: 'easeInQuart' }
        ],
        borderRadius: [
          { value: 0, duration: 300, delay: 450, easing: 'easeOutCirc' }
        ],
        opacity: [
          { value: 0, duration: 300, delay: 450, easing: 'easeInQuart' }
        ]
      })
      extendBarKeyframes.finished.then(() => {
        this.isMask = false
      })
      // this.extendBarKeyframes.play()
    },
    extendBarAfterEnter() {
      // this.extendBarKeyframes.pause()
    },
    extendBarLeave() {
      // this.extendBarKeyframes.reverse()
    },
    extendBarAfterLeave() {
      // this.extendBarKeyframes.pause()
    },
    containerEnter() {
      const buttonKeyframes = anime.timeline()

      buttonKeyframes
        .add({
          targets: '#extendBarContainer .button_1',
          opacity: 1,
          duration: 200,
          easing: 'easeOutExpo',
          offset: 500
        })
        .add({
          targets: '#extendBarContainer .button_2',
          opacity: 1,
          duration: 200,
          easing: 'easeOutExpo',
          offset: 520
        })
        .add({
          targets: '#extendBarContainer .button_3',
          opacity: 1,
          duration: 200,
          easing: 'easeOutExpo',
          offset: 540
        })
    },
    containerAfterEnter() {

    },
    containerLeave() {

    },
    containerAfterLeave() {

    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.extend-bar {
  position: relative;
  .extend-bar-mask {
    position: absolute;
    bottom: 133px;
    right: 13px;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    background-color: @bg-normal;
    // background-color: #000;
    z-index: 10;
    // transition: all 0.2s ease;
  }
  .extend-bar-container {
    width: 100vw;
    height: 10rem;
    display: flex;
    align-items: center;
    text-align: center;
    padding: 0 2rem;
    box-sizing: border-box;
    .extend-bar-button {
      flex-basis: 25%;
      opacity: 0;
      .img {
        // .bg-image('~/static/img/avatar');
        // background-size: cover;
        width: 4.8rem;
        height: 4.8rem;
        border: 0;
        margin: 0;
        padding: 0;
        border-radius: 50%;
        background-color: @label-line-light;
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
}
</style>
