<template>
  <div class="container my-cs-card">
    <!-- 关闭按钮 -->
    <span class="close" @click="removeCusSer">
      <svg class="icon" aria-hidden="true" style="width: 1.1rem;height: 1.1rem;fill: #D6D7DC;">
        <use xlink:href="#icon-chahao"></use>
      </svg>
    </span>
    <div class="container-main">
      <div class="avatar">
        <img src="/static/img/avatar@2x.png">
      </div>
      <div class="info">
        <p class="name">{{name}}</p>
        <p>服务总量 {{num}}次</p>
        <p>收到礼物 {{gifts}}份</p>
      </div>
    </div>
    <div class="btn-box" style="text-align: center">
      <x-button mini @click.native="enterVideoLineUp" style="color: #FF959C;background: #fff;">视频咨询</x-button>
    </div>
  </div>
</template>

<script>
  import { XButton } from 'vux'
  export default {
    // name: "my-cs-card"
    components: {
      XButton
    },
    data() {
      return {
        name: '丽丽',
        num: 2233,
        gifts: 3345
      }
    },
    methods: {
      removeCusSer() {
        alert('确定要移除该客服吗')
      },
      enterVideoLineUp() {
        alert('您即将接入视频客服')
      }
    }
  }
</script>

<style scoped lang="less">
  @import '../../../../common/style/theme.less';
  .container {
    /*width: 32.5rem;*/
    width: 86.67%;
    height: 19rem;
    position: relative;
    margin: 2.5rem auto;
    border-radius: .5rem;
    background: url("/static/img/service/myCsCardBg.png") no-repeat;
    background-size: 22.65rem 5.85rem;
    background-color: #ffffff;
    .weui-btn:after {
      border: 1px solid #FF959C;;
    }
    .close {
      position: absolute;
      top: 2.2rem;
      right: 1.9rem;
    }
    .container-main {
      display: flex;
      padding: 2.5rem 0 0;
      margin: 0 0 4.2rem 2.8rem;
      .avatar {
        width: 8rem;
        height: 8rem;
        margin: 0 2rem 0 0;
        border-radius: 50%;
        img {
          width: 100%;
          height: 8rem;
          border-radius: 50%;
        }
      }
      .info {
        line-height: 1;
        font-size: 1.2rem;
        color: @text-light;
        .name {
          font-size: 1.4rem;
          font-weight: bold;
          color: @text-normal;
        }
        p {
          padding-top: 1.4rem;
        }
        p:first-child {
          padding-top: .4rem;
        }
      }
    }
  }

</style>
