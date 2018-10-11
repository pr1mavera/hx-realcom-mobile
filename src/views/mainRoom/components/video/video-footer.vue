<template>
  <div class="video-footer">
    <div class="footer-bar">
      <div class="hang-up">
        <button class="footer-btn footer-btn-hang-up extend-click" @click="hangUpVideoWarning">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-guaduan"></use>
          </svg>
        </button>
      </div>
      <div class="menu">
        <button class="footer-btn footer-btn-gift extend-click" @click="$emit('sendGift')">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-liwu"></use>
          </svg>
        </button>
        <button class="footer-btn footer-btn-star extend-click">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-pingjia"></use>
          </svg>
        </button>
        <button class="footer-btn footer-btn-switch extend-click" @click="$emit('changeCamera')">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-qiehuanshexiangtou"></use>
          </svg>
        </button>
        <button class="footer-btn footer-btn-screen extend-click" @click="$emit('minimizeVideoBar')">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-suoxiao"></use>
          </svg>
        </button>
      </div>
    </div>
    <!-- <div v-transfer-dom>
      <confirm v-model="show"
      :title="$t('Confirm deleting the item')"
      @on-cancel="onCancel"
      @on-confirm="onConfirm"
      @on-show="onShow"
      @on-hide="onHide">
        <p style="text-align:center;">{{ $t('Are you sure?') }}</p>
      </confirm>
    </div> -->
  </div>
</template>

<script type="text/ecmascript-6">
// import { Confirm, TransferDomDirective as TransferDom } from 'vux'

export default {
  // directives: {
  //   TransferDom
  // },
  methods: {
    hangUpVideoWarning() {
      
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
