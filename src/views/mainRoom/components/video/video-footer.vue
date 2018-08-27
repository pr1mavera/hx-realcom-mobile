<template>
  <div class="video-footer">
    <div class="footer-bar">
      <div class="hang-up">
        <button class="footer-btn footer-btn-hang-up">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-guaduan"></use>
          </svg>
        </button>
      </div>
      <div class="menu">
        <button class="footer-btn footer-btn-gift">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-liwu"></use>
          </svg>
        </button>
        <button class="footer-btn footer-btn-star">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-pingjia"></use>
          </svg>
        </button>
        <button class="footer-btn footer-btn-switch">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-qiehuanshexiangtou"></use>
          </svg>
        </button>
        <button class="footer-btn footer-btn-screen" @click="minimizeVideoBar">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-suoxiao"></use>
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
      background-color: rgba(0, 0, 0, .3);
      &.footer-btn-hang-up {
        background-color: rgba(255, 149, 156, .5);
      }
      &.footer-btn-gift {
        background-color: unset;
      }
      &.footer-btn-star {
        background-color: unset;
      }
      &.footer-btn-switch {

      }
      &.footer-btn-screen {
        .icon {
          width: 2rem;
          height: 2rem;
        }
      }
      .icon {
        width: 2.4rem;
        height: 2.4rem;
        fill: @text-lighter;
      }
    }
  }
}
</style>
