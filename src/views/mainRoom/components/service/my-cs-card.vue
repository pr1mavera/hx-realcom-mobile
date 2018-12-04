<template>
  <!---->
  <div class="container my-cs-card" :class="{'remove-cs': removeStyle}">
    <!-- 关闭按钮 -->
    <span class="close" @click="removeCusSer">
      <svg class="icon" aria-hidden="true" style="width: 1.1rem;height: 1.1rem;fill: #D6D7DC;">
        <use xlink:href="#icon-chahao"></use>
      </svg>
    </span>
    <div class="container-main">
      <a @click="enterSerCenter" class="avatar">
        <img v-lazy="avatarImgSrc" :key="avatarImgSrc">
      </a>
      <div class="info">
        <p class="name">{{currentCs.nickName}}</p>
        <p>服务总量 {{currentCs.servTimes || 0}}次</p>
        <p>收到礼物 {{currentCs.giftCount || 0}}份</p>
      </div>
    </div>
    <div class="btn-box" style="text-align: center">
      <x-button mini @click.native="clickToLineUp" style="color: #FF959C;background: #fff;">
        视频咨询
      </x-button>
    </div>
  </div>
</template>

<script>
  import { XButton } from 'vux'
  import { ERR_OK, removeCs, getCsAvatar } from '@/server/index.js'
  import { mapGetters } from 'vuex'
  // import { queueStatus } from '@/common/js/status'
  // import {} from '@/server/index.js'

  export default {
    components: {
      XButton
    },
    props: {
      currentCs: {
        type: Object
      },
      csIndex: {
        type: Number
      }
    },
    data() {
      return {
        removeStyle: false
      }
    },
    computed: {
      avatarImgSrc() {
        return getCsAvatar(this.currentCs.id)
      },
      ...mapGetters([
        'userInfo'
      ])
    },
    mounted() {
      // this.getAvatar()
    },
    methods: {
      // 弹框操作
      onCancel() {
        console.log('on cancel')
      },
      // 确定删除当前客服
      async deleteCsConfirm() {
        // debugger
        this.removeStyle = true // 删除当前客服的交互
        const userId = this.userInfo.userId
        const cusSerId = this.currentCs.id
        const data = {
          'userId': userId,
          'csId': cusSerId
        }

        // debugger
        const res = await removeCs(data)
        if (res.result.code === ERR_OK) {
          this.$emit('removeCs', this.csIndex)
          // console.log(JSON.stringify(res))
        } else {
          console.log('error of remove the cusSer:' + JSON.stringify(res))
        }
        this.removeStyle = false // 清除删除当前客服的交互
      },
      onShow() {
        console.log('on show')
      },
      onHide() {
        console.log('on hide')
      },
      // 点击‘X’
      removeCusSer() {
        const self = this
        this.$vux.confirm.show({
          title: '您确定要删除当前客服吗？',
          onConfirm() {
            self.deleteCsConfirm()
          }
        })
      },

      // 点击专属客服头像进入客服的个人中心
      enterSerCenter() {
        this.$router.push({
          path: '/room/serverDetail',
          query: {
            cusSerId: this.currentCs.id,
            csStatus: this.currentCs.status || 1
          }
        })
      },
      // 点击视频坐席
      clickToLineUp() {
        this.$emit('clickToLineUp', this.currentCs)
      }
    }
  }
</script>

<style scoped lang="less">
  @import '~@/common/style/theme.less';
  .container {
    /*width: 32.5rem;*/
    width: 86.67%;
    height: 19rem;
    position: relative;
    margin: 0 auto 2.5rem;
    border-radius: .5rem;
    background: url("/static/img/service/myCsCardBg.png") no-repeat;
    box-shadow: 0 .3rem .5rem 0 rgba(148, 148, 148, 0.1);
    background-size: 22.65rem 5.85rem;
    background-color: #ffffff;
    .close {
      position: absolute;
      top: 2.3rem;
      right: 2.3rem;
    }
    .container-main {
      display: flex;
      padding: 2.5rem 0 0;
      margin: 0 0 4.2rem 2.8rem;
      .avatar {
        width: 7.5rem;
        height: 7.5rem;
        margin: 0 2rem 0 0;
        border-radius: 50%;
        border: .25rem solid #ffffff;
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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
  /* 删除客服时的交互 */
  .remove-cs {
    animation: removeCs .6s;
    animation-fill-mode: forwards; // 当动画结束后保留在最后的状态
  }
  @keyframes removeCs {
    from {
      height: 19rem;
      opacity: 1;
    }
    to {
      height: 0;
      opacity: .1;
      display: none;
    }
  }

</style>
