<!-- 用户给客服评论的组件 -->
<template>
  <div v-transfer-dom>
    <popup v-model="showAssess" is-transparent>
      <div class="popup-main" style="">
       <div class="avatar"><img src="/static/img/avatar.png"></div>
        <x-icon type="ios-close" @click.native="cancelAssess" size="30"></x-icon>
        <div class="eva-part">
          <p>请对{{name}}本次的服务进行评价</p>
          <rater v-model="stars" active-color="#FEC656"></rater>
        </div>
        <div class="eva-more" v-if="stars > 0">
          <flexbox>
            <flexbox-item>
              <x-button plain style="width: 11rem;border-radius:99px;font-size: 1.2rem;color: #D9DADE;border-color: #D9DADE;">解决了问题</x-button>
            </flexbox-item>
            <flexbox-item>
              <x-button plain style="width: 11.2rem;border-radius:99px; font-size: 1.2rem;color: #D9DADE;border-color: #D9DADE;">没有解决问题</x-button>
            </flexbox-item>
          </flexbox>
          <swiper height="9.5rem" style="background: #F1F1F1;margin-top: 1.4rem;" dots-class="custom-bottom"
                   dots-position="center">
            <swiper-item><h2 class="fadeInUp animated">test1</h2></swiper-item>
            <swiper-item><h2 class="fadeInUp animated">test2</h2></swiper-item>
            <swiper-item><h2 class="fadeInUp animated">test3</h2></swiper-item>
            <swiper-item><h2 class="fadeInUp animated">test4</h2></swiper-item>
            <swiper-item><h2 class="fadeInUp animated">test5</h2></swiper-item>
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
        next: true
      }
    },
    methods: {
      cancelAssess() {
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
      right: -44%;
    }
    .popup-main {
      position: relative;
      width: 88%;
      opacity: .85;
      margin: 0 auto;
      align-self: center;
      padding-top: 10px;
      background: #fff;
      text-align: center;
      border-radius: 1rem;
      .avatar {
        width: 8rem;
        height: 8rem;
        position: absolute;
        top: -4rem;
        left: 50%;
        margin-left: -4rem;
        border-radius: 50%;
        background: linear-gradient(to right, #FF8C6A, #FF80A0);
        img {
          width: 88%;
          height: 88%;
          border-radius: 50%;
          margin-top: 6%;
          vertical-align: middle;
        }
      }
      .eva-part {
        font-size: 1.5rem;
        padding: 1.5rem 0 0;
        .vux-rater {
          padding: 2.5rem 0 3rem;
        }
      }
      .eva-more {
        .vux-slider + .vux-flexbox {
          button {
            width: 9rem;
            cursor: pointer;
            font-size: 1.6rem;
            border-radius: 2rem;
          }
        }
      }
    }
  }
</style>
