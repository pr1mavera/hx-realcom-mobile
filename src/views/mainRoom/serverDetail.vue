<!-- 客服的个人中心 -->
<template>
  <div class="serverDetail container">
    <!-- 默认高度为180px, 如果设置aspect-ratio会根据宽度自动计算高度,如 :aspect-ratio="300/375" -->
    <swiper auto dots-class="custom-bottom" dots-position="center">
      <swiper-item class="swiper-img" v-for="(item, index) in personalDisplay" :key="index">
        <img :src="item" style="width: 100%;object-fit: fill;">
      </swiper-item>
    </swiper>
    <div class="count">
      <div class="count-rate-bg">
        <div class="count-rate">
          <span>{{ rate }}</span>
          <p style="line-height: 1.25;font-size: 1.2rem">好评率</p>
        </div>
      </div>
      <div class="count-like">
        <svg class="icon" aria-hidden="true"><use xlink:href="#icon-xin-hong1"></use></svg>
        <span style="font-size: 1.2rem;">&nbsp;{{ likeNum }}</span>
      </div>
    </div>
    <div class="container-item flex-box">
      <div class="flex-box-item">
        <p><span style="">{{years}}</span>年</p>
        <p class="tips">服务年限</p>
      </div>
      <div class="flex-box-item">
        <p><span>{{peopleNum}}</span>人</p>
        <p class="tips">服务人数</p>
      </div>
      <div class="flex-box-item">
        <p><span>{{myNum}}</span>次</p>
        <p class="tips">为我服务</p>
      </div>
    </div>
    <div class="container-item about-me">
      <p class="container-item-tit">关于我</p>
      <div class="container-item-con ">
        <div class="about-me-item"><div class="tit">家乡</div>{{hometown}}</div>
        <div class="about-me-item"><div class="tit">星座</div>{{constellation}}</div>
        <div class="about-me-item"><div class="tit">爱好</div>{{hobby}}</div>
      </div>
    </div>
    <div class="container-item">
      <p class="container-item-tit">认识我</p>
      <div class="container-item-con">
        <!--<x-button mini style="margin-right: 1.5rem">温柔1</x-button>-->
        <label-btn></label-btn>
      </div>
    </div>
    <div class="container-item">
      <p class="container-item-tit">我的小幸福</p>
      <send-gift></send-gift>
    </div>
    <a class="btn-back" @click="window.history.go(-1)">返 回</a>
  </div>
</template>

<script type="text/ecmascript-6">
  import { Swiper, SwiperItem, XButton, XCircle } from 'vux'

  // 顶部轮播图的列表
  const displayList = [
    '/static/img/leaveMsg/leaveMsgBg.png',
    '/static/img/leaveMsg/leaveMsgBg.png',
    '/static/img/leaveMsg/leaveMsgBg.png'
  ]

  export default {
    components: {
      Swiper,
      SwiperItem,
      XButton,
      XCircle,
      'SendGift': () => import('@/views/mainRoom/components/chat/send-gift'),
      'LabelBtn': () => import('@/views/mainRoom/components/label-btn')
    },
    data() {
     return {
       personalDisplay: displayList,
       rate: '98%',
       likeNum: 200,
       years: 1,
       peopleNum: 20,
       myNum: 5,
       hometown: '新疆维吾尔自治区 克孜勒苏柯尔克孜自治州',
       constellation: '天秤座',
       hobby: '好吃 懒作 打游戏'
     }
    }
  }

</script>

<style scoped lang="less">
  @import '../../common/style/theme.less';

  .container {
    height: unset;
    padding-bottom: 6.5rem;
    background: @bg-normal;
    .count {
      height: 6rem;
      position: relative;
      background: #ffffff;
      .count-rate-bg {
        width: 9.35rem;
        height: 9.35rem;
        position: absolute;
        bottom: 1rem;
        left: 2rem;
        border-radius: 100%;
        background: rgba(255,255,255, 1);
        box-shadow: 0 0 0 .6rem rgba(255, 255, 255, .4);
        .count-rate {
          width: 8.35rem;
          height: 8.35rem;
          padding-top: 1.8rem;
          border-radius: 100%;
          border: 1px solid #FF959C;
          box-sizing: border-box;
          margin: .5rem auto;
          text-align: center;
          background: #fff;
          // box-shadow: 0 -.4rem 0 #fff;
          span {
            color: #FF959C;
            font-size: 2.4rem;
          }
        }
      }
      .count-like {
        line-height: 6rem;
        text-align: right;
        margin-right: 1rem;
        .icon {
          width: 1.3rem;
          height: 1.2rem;
          fill: #FF959C;
          vertical-align: -0.15em
        }
      }
    }
    .container-item {
      width: 100%;
      margin-top: .5rem;
      padding: 1.5rem 1rem 2.5rem;
      box-sizing: border-box;
      background: @bg-light;
      .container-item-tit {
        color: #FF959C;
        font-size: 1.4rem;
      }
    }
    .about-me {
      .about-me-item {
        display: flex;
        color: @text-light;
        font-size: 1.2rem;
        padding: 1.2rem 0 0;
        .tit {
          flex: none;
          width: 10rem;
          color: @text-lighter-a;
        }
      }
    }
    .flex-box {
      display: flex;
      .flex-box-item {
        flex: 1;
        text-align: center;
        p {
          color: @text-normal;
          font-size: 1.2rem;
          span {
            font-size: 3.8rem;
            font-weight: 500;
          }
        }
        .tips {
          color: @text-lighter-a;
        }
      }
    }
    .btn-back {
      position: fixed;
      bottom: 0;
      display: block;
      width: 100%;
      height: 5rem;
      line-height: 5rem;
      font-size: 1.8rem;
      color: @text-lighter;
      text-align: center;
      margin-top: 2.5rem;
      background: linear-gradient(to right, #FF905B, #FF7EAB);
    }
  }

</style>
