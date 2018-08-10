<!-- 转接成功的提示模态框 -->
<template>
  <div class="connect-success">
    <confirm v-model="show"
             @on-cancel="onCancel"
             @on-confirm="onConfirm"
             @on-show="onShow"
             @on-hide="onHide">
      <div class="avatar"><img src=""></div>
      <p class="confirm-bd-tit" style="">
             <icon type="success"></icon> 转接成功！
      </p>
      <p class="confirm-bd-subtit">本次视频由客服{{name}}为您服务</p>
      <!--<p class="confirm-tips">{{name}}{{num ? `已经为您服务过${num}次`: '首次为您服务'}}</p>-->
      <p class="confirm-tips" v-if="num">{{name}}已经为您服务过<label class="num">{{num}}</label>次</p>
      <p class="confirm-tips" v-else>{{name}}首次为您服务</p>
    </confirm>
    <!--<p>there are some words for test</p>-->
  </div>
</template>

<script type="text/ecmascript-6">
  import { Confirm, Icon } from 'vux'

  export default {
    components: {
      Confirm,
      Icon
    },
    data() {
      return {
        show: true,
        name: '丽丽',
        num: 2
      }
    },
    methods: {
      onCancel() {
        console.log('on cancel')
      },
      onConfirm(msg) {
        console.log('on confirm')
        if (msg) {
          alert(msg)
        }
      },
      onHide() {
        console.log('on hide')
      },
      onShow() {
        console.log('on show')
      }
    }
  }
</script>

<style scoped lang="less">
.connect-success {
  letter-spacing: .1rem;
  .weui-dialog {
    overflow: auto!important;
    .avatar {
      width: 8rem;
      height: 8rem;
      position: absolute;
      top: -4rem;
      left: 50%;
      margin-left: -4rem;
      background: #ff444a;
      border-radius: 50%;
    }
    .weui-icon-success {
      color: #FF959C;
      font-size: 2rem;
      line-height: 4.7rem;
    }
    p {
      line-height: 1.75;
    }
    .confirm-bd-tit {
      height: 4rem;
      color: #000000;
      line-height: 4.7rem;
      font-size: 1.8rem;
      font-weight: bold;
      text-align: center;
    }
    .confirm-bd-subtit {
      color: #000000;
    }
    .confirm-tips {
      font-size: 1.2rem;
      .num {
        color: #ff444a;
      }
    }
  }
}
</style>
