<!-- 用户给客服评论的组件 -->
<template>
  <div class="assess-model" v-transfer-dom>
    <popup v-model="showAssess" is-transparent>
      <div class="popup-main" style="">
       <div class="avatar">
         <img :src="avatarImgSrc">
       </div>
        <x-icon type="ios-close" @click.native="$emit('handleToCancelAssess')" size="30"></x-icon>
        <div class="eva-part">
          <p>请对{{name}}本次的服务进行评价</p>
          <!-- fill:#bfbfbf; 未评价时星星的颜色； #FEC656,评价点亮后星星的颜色 -->
          <rater v-model="stars"
                 star="<svg class='icon' style='width:2rem;height:2rem;' aria-hidden='true'>
                 <use xlink:href='#icon-xingxing'></use></svg>" :margin="8">
          </rater>
        </div>
        <div class="eva-more" v-if="stars > 0">
          <!--<swiper height="9.5rem" style="background: #F1F1F1;margin-top: 1.5rem;" dots-class="custom-bottom" dots-position="center">-->
            <!--<swiper-item><div class="btn-box"></div></swiper-item>-->
            <!--<swiper-item><h2 class="fadeInUp animated">test2</h2></swiper-item>-->
            <!--<swiper-item v-for="(item, index) in btnBoxList" :key="index">-->
            <!--</swiper-item>-->
          <!--</swiper>-->
          <label-btn :labelType="labelType" @seledLabels="selLabels"></label-btn>
          <x-button :gradients="['#FF8C6A', '#ff80a0']" @click.native="saveAssess"
                    style="width: 11rem;margin: 2rem auto 0;">
            提交评价
          </x-button>
        </div>
      </div>
    </popup>
    <toast v-model="showFalseTips" type="text" :time="800" width="15rem" is-show-mask :position="position">{{failText}}</toast>
    <toast v-model="showSucTips" type="text" :time="800" width="15rem" is-show-mask text="评论成功" :position="position"></toast>
  </div>
</template>

<script>
  import { TransferDom, Popup, Rater, XButton, Swiper, SwiperItem, Toast } from 'vux'
  import { ERR_OK, saveAssess, getCsAvatar } from '@/server/index.js'
  import { mapGetters } from 'vuex'

  // const btnList = [
  //   '']
  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup,
      Rater,
      XButton,
      Swiper,
      SwiperItem,
      Toast,
      'LabelBtn': () => import('@/views/mainRoom/components/label-btn')
    },
    props: {
      showAssess: {
        type: Boolean
      }
    },
    data() {
      return {
        // showAssess: true,
        avatarImgSrc: '',
        name: '丽丽',
        stars: 0,
        next: true,
       // btnBoxList: btnList,
        labels: [], // 用户选中的标签
        showFalseTips: false,
        failText: '啊呀出错啦！',
        showSucTips: false,
        position: 'default',
        labelType: 'all'
      }
    },
    computed: {
      ...mapGetters([
        'sessionId',
        'userInfo',
        'csInfo'
      ])
    },
    mounted() {
      this.getAvatar()
    },
    methods: {
      // 获取客服头像
      getAvatar() {
        this.avatarImgSrc = getCsAvatar(this.csInfo.csId) // 测试数据
      },

      // 接受子组件传的值
      selLabels(selTags) {
        // debugger
        this.labels = selTags
      },

      // 保存评论的信息
      async saveAssess() {
        // 输入 sessionId(会话Id) userId, userName, csId, csName ,evaluateLevel(满意度) [{labelId: '', labelName: ''}]
        const data = {
          'sessionId': this.sessionId,
          // 'sessionId': '00553330cc4a11e886ec19059d7ca77e',
          'userId': this.userInfo.userId,
          'userName': this.userInfo.userName,
          'csId': this.csInfo.csId,
          'csName': this.csInfo.csName,
          'evaluateLevel': this.stars,
          'labels': this.labels.length
        }
        const res = await saveAssess(data)
        if (res.result.code === ERR_OK) {
          this.showSucTips = true
          // this.showAssess = false
          console.log('已经保存了你评价的信息' + JSON.stringify(res))
          this.$emit('assessSuccess')
        } else {
          this.showFalseTips = true
          // this.failText = res.result.messagem
          console.log('there are some error about' + JSON.stringify(res.result))
        }
      }
    }
  }
</script>

<style scoped lang="less">
.assess-model {
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
      padding: 10px 0 2.5rem;
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
          padding: 2rem 0 1rem;
        }
      }
      .eva-more {}
    }
  }
}
</style>
