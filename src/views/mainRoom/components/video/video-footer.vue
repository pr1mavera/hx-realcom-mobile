<template>
  <div class="video-footer">
    <div class="footer-bar">
      <div class="hang-up">
        <button class="footer-btn">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-wode"></use>
          </svg>
        </button>
      </div>
      <div class="menu">
        <button class="footer-btn">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-wode"></use>
          </svg>
        </button>
        <button class="footer-btn">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-wode"></use>
          </svg>
        </button>
        <button class="footer-btn">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-wode"></use>
          </svg>
        </button>
        <button class="footer-btn" @click="minimizeVideoBar">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-wode"></use>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  methods: {
    minimizeVideoBar() {
      this.$emit('minimizeVideoBar')
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/mixin.less';
@import '~@/common/style/theme.less';

.video-footer {
  .footer-bar {
    width: 100%;
    height: 6.8rem;
    display: flex;
    align-items: center;
    .hang-up {
      width: 6.8rem;
      height: 6.8rem;
      padding: 1.4rem;
      box-sizing: border-box;
      .footer-btn {
        .icon {

        }
      }
    }
    .menu {
      width: calc(~'100% - 6.8rem');
      height: 6.8rem;
      padding: 1.4rem;
      box-sizing: border-box;
      display: flex;
      justify-content: flex-end;
      .footer-btn {
        margin-left: 1.4rem;
      }
    }
    div > .footer-btn {
      width: 4rem;
      height: 4rem;
      padding: 0;
      margin: 0;
      border: 0;
      border-radius: 50%;
      background-color: #000;
      opacity: .3;
      .icon {
        width: 1.8rem;
        height: 1.8rem;
        fill: @text-lighter;
      }
    }
  }
}
</style>
