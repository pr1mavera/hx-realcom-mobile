<!-- 客服的个人中心 -->
<template>
  <div class="serverDetail container">
    <!-- 默认高度为180px, 如果设置aspect-ratio会根据宽度自动计算高度,如 :aspect-ratio="300/375" -->
    <swiper auto dots-class="custom-bottom" dots-position="center" :aspect-ratio="160/375">
      <swiper-item class="swiper-img" v-for="(item, index) in personalDisplay" :key="index">
        <img :src="item" style="width: 100%;object-fit: fill;">
      </swiper-item>
    </swiper>
    <div class="count">
      <div class="count-rate-bg">
        <div class="count-rate">
          <span>{{ cuSerInfo.feedback }}</span>
          <p style="line-height: 1.25;font-size: 1.2rem">好评率</p>
        </div>
      </div>
      <div class="count-like">
        <svg class="icon" aria-hidden="true"><use xlink:href="#icon-xin-hong1"></use></svg>
        <span style="font-size: 1.2rem;">&nbsp;{{ cuSerInfo.likesCount }}</span>
      </div>
    </div>
    <div class="container-item flex-box">
      <div class="flex-box-item">
        <p><span style="">{{ cuSerInfo.servYears === null ? 0 : cuSerInfo.servYears }}</span>年</p>
        <p class="tips">服务年限</p>
      </div>
      <div class="flex-box-item">
        <p><span>{{ cuSerInfo.servTimes === null ? 0 : cuSerInfo.servTimes }}</span>人</p>
        <p class="tips">总服务数</p>
      </div>
      <div class="flex-box-item">
        <p><span>{{ cuSerInfo.servTimes === null ? 0 : cuSerInfo.servTimes }}</span>次</p>
        <p class="tips">为我服务</p>
      </div>
    </div>
    <!-- about me -->
    <div class="container-item about-me">
      <p class="container-item-tit">关于我</p>
      <div class="container-item-con ">
        <div class="about-me-item"><div class="tit">星座</div>{{cuSerInfo.starSign === null ? `保密` : cuSerInfo.starSign}}</div>
        <div class="about-me-item"><div class="tit">家乡</div>{{cuSerInfo.hometown === null ? `保密` : cuSerInfo.hometown}}</div>
        <div class="about-me-item"><div class="tit">爱好</div>{{cuSerInfo.hobby === null ? `保密` : cuSerInfo.hobby}}</div>
      </div>
    </div>
    <!-- labels  -->
    <div class="container-item">
      <p class="container-item-tit">认识我</p>
      <div class="container-item-con">
        <!--<x-button mini style="margin-right: 1.5rem">温柔1</x-button>-->
        <!-- :labelsInfo=labelsInfo -->
        <label-btn :labelType="labelType"></label-btn>
      </div>
    </div>
    <!-- the gifts which send to me -->
    <div class="container-item">
      <p class="container-item-tit">我的小幸福</p>
      <send-gift style="height: unset"
      ></send-gift>
    </div>
    <div class="btn-box">
      <a class="btn btn-back" @click="$router.back(-1)">返 回</a>
      <a class="btn btn-lin-up" @click="enterLinUp">立即咨询</a>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import Tools from '@/common/js/tools'
  import {mapGetters, mapActions} from 'vuex'
  import { Swiper, SwiperItem, XButton, XCircle } from 'vux'
  import { ERR_OK, getCsInfo, csPhoto } from '@/server/index.js'

  // 顶部轮播图的列表
  // const displayList = []

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
       personalDisplay: [],
       cuSerInfo: [],
       labelType: 'notAll'
     }
    },
    computed: {
      ...mapGetters([
        'csInfo',
        'userInfo'
      ])
    },
    mounted() {
      this.getCsInfo()
      // this.getGifts()
      // this.getLabels()
    },
    methods: {
      // 获取客服信息
      async getCsInfo() {
        // const cuSerId = '123456789'
        const cuSerId = this.$route.query.cusSerId
        // console.log('=================================' + JSON.stringify(this.csInfo))
        const res = await getCsInfo(cuSerId)
        // debugger
        if (res.result.code === ERR_OK) {
          this.cuSerInfo = res.data
          const cuSerPic = res.data.photos

          for (var i in cuSerPic) {
            // this.getPic(cuSerPic[i].url)
            this.personalDisplay.push(csPhoto(cuSerPic[i].id))
          }
        } else {
          console.log('======================= error about get cuSerInfo')
        }
      },
      enterLinUp() {
        const self = this
        this.$vux.confirm.show({
          title: '您即将转入视频客服',
          onConfirm() {
          self.goToLineUp()
          }
        })
      },
      goToLineUp() {
        // 判断当前时间是否是在工作时间内
        const SP_workT = this.userInfo.workTimeInfo.filter(item => item.callType === 'SP')
        const workT = {
          startT: SP_workT[0].startTime,
          endT: SP_workT[0].endTime
        }
        if (!Tools.DateTools.isWorkTime(workT)) {
          this.$vux.alert.show({
            title: `抱歉，当前为非工作时间，视频客服工作时间为周一至周日${workT.startT}-${workT.endT}，请在工作时间内来询，感谢您的关注！`
          })
          return
        }
        const status = this.$route.query.csStatus
        const cuSerId = this.$route.query.cusSerId
        // 只有就绪和忙碌可以排队
        if (status === '1') {
          this.$vux.alert.show({
            title: '啊呀，当前客服还没准备好呢~'
          })
        } else if (status === '3' || status === '5') {
          this.$router.push({path: `/room/line-up/${cuSerId}`})
          this.enterToLineUp('正在为您转接视频客服，请稍候')
        } else if (status === '4') {
          this.$vux.alert.show({
            title: '啊呀，当前客服正在休息呐~'
          })
        } else if (status === '2') {
          this.$vux.alert.show({
            title: '啊呀，当前客服不在呢~'
          })
        }
      },
      ...mapActions([
        'enterToLineUp'
      ])
    }
  }

</script>

<style scoped lang="less">
  @import '~@/common/style/theme.less';

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
    .btn-box {
      display: flex;
      position: fixed;
      bottom: 0;
      width: 100vw;
      height: 5rem;
      font-size: 1.8rem;
      color: @text-lighter;
      text-align: center;
      background: linear-gradient(to right, #FF905B, #FF7EAB);
      .btn {
        flex: 1;
        height: 3.5rem;
        line-height: 3.5rem;
        align-self: center;
      }
      .btn-lin-up {
        border-left: 2px solid #ffffff;
      }
    }
  }

</style>
