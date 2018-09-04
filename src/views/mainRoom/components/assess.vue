<!-- 用户给客服评论的组件 -->
<template>
  <div v-transfer-dom>
    <popup v-model="showAssess" is-transparent>
      <div class="popup-main" style="">
       <div class="avatar"><img src="/static/img/avatar.png"></div>
        <x-icon type="ios-close" @click.native="cancelAssess" size="30"></x-icon>
        <div class="eva-part">
          <p>请对{{name}}本次的服务进行评价</p>
          <!-- fill:#bfbfbf; 未评价时星星的颜色； #FEC656,评价点亮后星星的颜色 -->
          <rater v-model="stars"
                 star="<svg class='icon' style='width:2rem;height:2rem;' aria-hidden='true'>
                 <use xlink:href='#icon-xingxing'></use></svg>" :margin="8">
          </rater>
        </div>
        <div class="eva-more" v-if="stars > 0">
          <flexbox style="padding: 0 2rem;box-sizing: border-box;">
            <flexbox-item style="box-sizing: border-box;">
              <x-button mini>解决了问题</x-button>
            </flexbox-item>
            <flexbox-item>
              <x-button mini>没有解决</x-button>
            </flexbox-item>
          </flexbox>
          <swiper height="9.5rem" style="background: #F1F1F1;margin-top: 1.5rem;" dots-class="custom-bottom" dots-position="center">
            <swiper-item><div class="btn-box"></div></swiper-item>
            <swiper-item><h2 class="fadeInUp animated">test2</h2></swiper-item>
            <!--<swiper-item class="" v-for="(item, index) in btnBoxList" :key="index">-->
              <!--<div class="btn-box" ></div>-->
            <!--</swiper-item>-->
            <swiper-item v-for="(item, index) in btnBoxList" :key="index">
              <div class="btn-box"></div>
            </swiper-item>
          </swiper>
          <flexbox style="margin: 2rem 0;">
            <flexbox-item>
              <x-button :gradients="['#FF8C6A', '#ff80a0']" @click="cancelAssess">下次吧</x-button>
            </flexbox-item>
            <flexbox-item>
              <x-button :gradients="['#1D62F0', '#19D5FD']">去分享</x-button>
            </flexbox-item>
          </flexbox>
        </div>
      </div>
    </popup>
  </div>
</template>

<script>
  import { TransferDom, Popup, Rater, XButton, Flexbox, FlexboxItem, Swiper, SwiperItem } from 'vux'

  const btnList = [
    ''
  ]
  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup,
      Rater,
      XButton,
      Flexbox,
      FlexboxItem,
      Swiper,
      SwiperItem
    },
    data() {
      return {
        showAssess: true,
        name: '丽丽',
        stars: 0,
        next: true,
        btnBoxList: btnList
      }
    },
    computed: {
    },
    mounted() {
    },
    methods: {
      cancelAssess() {
        alert('您关闭了评价')
        this.showAssess = false
      }
    }
  }
</script>

<style scoped lang="less">
  .vux-popup-dialog {
    display: flex;
    height: 100vh!important;
    .vux-x-icon {
      fill: #FF959C;
      position: relative;
      right: -11.2rem;
    }
    .popup-main {
      position: relative;
      width: 27rem;
      opacity: .85;
      margin: 0 auto;
      align-self: center;
      padding-top: 10px;
      background: #fff;
      text-align: center;
      border-radius: 1rem;
      .avatar {
        width: 7.5rem;
        height: 7.5rem;
        position: absolute;
        top: -4rem;
        left: 50%;
        margin-left: -4rem;
        border-radius: 50%;
        background: linear-gradient(to right, #FF8C6A, #FF80A0);
        img {
          width: 6.7rem;
          height: 6.7rem;
          border-radius: 50%;
          margin-top: .4rem;
          vertical-align: middle;
        }
      }
      .eva-part {
        font-size: 1.2rem;
        padding: 1.5rem 0 0;
        .vux-rater {
          padding: 2.5rem 0 3rem;
        }
      }
      .eva-more {
        .vux-flexbox {
          button {
            width: 10rem;
            color: #D9DADE;
            font-size: 1.2rem;
            background: rgba(255, 255, 255, .9);
          }
          .weui-btn:after {
            border-color: rgba(214, 215, 220, 1) !important;
          }
        }
        .vux-slider + .vux-flexbox {
          button {
            width: 9rem;
            cursor: pointer;
            font-size: 1.6rem;
          }
        }
      }
    }
  }
</style>
