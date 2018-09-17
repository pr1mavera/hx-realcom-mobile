<template>
  <div class="container my-cs-card">
    <!-- 关闭按钮 -->
    <span class="close" @click="removeCusSer">
      <svg class="icon" aria-hidden="true" style="width: 1.1rem;height: 1.1rem;fill: #D6D7DC;">
        <use xlink:href="#icon-chahao"></use>
      </svg>
    </span>
    <div class="container-main">
      <a @click="enterSerCenter" class="avatar">
        <img :src='avatarUrl'>
      </a>
      <div class="info">
        <p class="name">{{this.name}}</p>
        <p>服务总量 {{this.num}}次</p>
        <p>收到礼物 {{this.gifts}}份</p>
      </div>
    </div>
    <div class="btn-box" style="text-align: center">
      <x-button mini @click.native="enterVideoLineUp" style="color: #FF959C;background: #fff;">
        视频咨询
      </x-button>
    </div>
  </div>
</template>

<script>
  import { XButton } from 'vux'
  import { beforeEnterVideo } from '@/common/js/beforeEnterVideo'
  import { ERR_OK, removeCs, getImgUrl } from '@/server/index.js'
  import { mapGetters, mapMutations } from 'vuex'
  import { queueStatus } from '@/common/js/status'
  // import {} from '@/server/index.js'

  export default {
    // name: "my-cs-card"
    components: {
      XButton
    },
    props: {
      cusSerId: {
        type: String
      },
      avatarSrc: {
        type: String
      },
      name: {
        type: String
      },
      num: {
        type: Number
      },
      gifts: {
        type: Number
      }
    },
    data() {
      return {
        avatarUrl: getImgUrl(this.avatarSrc)
      }
    },
    computed: {
      ...mapGetters([
        'userInfo'
      ])
    },
    methods: {
      // 删除客服
      async removeCusSer() {
        // const userId = '123'
        const userId = this.userInfo.userId
        const cusSerId = this.cusSerId

        console.log('userId: ' + userId + ' ' + 'cusSerId:' + cusSerId)
        const res = await removeCs(userId, cusSerId)
        if (res.result.code === ERR_OK) {
          console.log(JSON.stringify(res))
        } else {
          console.log('error of remove the cusSer:' + JSON.stringify(res))
        }
      },

      enterSerCenter() {
        this.$router.push({
          path: '/room/serverDetail'
        })
      },
      enterVideoLineUp() {
        beforeEnterVideo()
        this.setQueueMode(queueStatus.queuing)
        this.$router.push({
          path: '/room/chat'
        })
      },
      ...mapMutations({
        setQueueMode: 'SET_QUEUE_MODE'
      })
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
          height: 7.5rem;
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
