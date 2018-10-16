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
        <img :src='avatarImgSrc'>
      </a>
      <div class="info">
        <p class="name">{{this.name}}</p>
        <p>服务总量 {{this.num}}次</p>
        <p>收到礼物 {{this.gifts}}份</p>
      </div>
    </div>
    <div class="btn-box" style="text-align: center">
      <x-button mini @click.native="clickToLineUp" style="color: #FF959C;background: #fff;">
        视频咨询
      </x-button>
    </div>
    <!-- 删除时弹框提示 :title="$t('Confirm deleting the item')"-->
    <div v-transfer-dom>
      <confirm v-model="showTips"
               @on-cancel="onCancel"
               @on-confirm="onConfirm"
               @on-show="onShow"
               @on-hide="onHide">
        <p style="text-align:center;">您确定要删除当前客服吗？</p>
      </confirm>
    </div>
  </div>
</template>

<script>
  import { XButton, Confirm, TransferDomDirective as TransferDom } from 'vux'
  import { ERR_OK, removeCs, getCsAvatar } from '@/server/index.js'
  import { mapGetters, mapMutations } from 'vuex'
  // import { queueStatus } from '@/common/js/status'
  // import {} from '@/server/index.js'

  export default {
    // name: "my-cs-card"
    directives: {
      TransferDom
    },
    components: {
      XButton,
      Confirm
    },
    props: {
      index: {
        type: Number
      },
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
        // avatarUrl: getImgUrl(this.avatarSrc)
        avatarImgSrc: '',
        showTips: false,
        remove: false
      }
    },
    computed: {
      ...mapGetters([
        'userInfo'
      ])
    },
    mounted() {
      this.getAvatar()
    },
    methods: {
      // 弹框操作
      onCancel() {
        console.log('on cancel')
      },
      // 确定删除当前客服
      async onConfirm() {
        const userId = this.userInfo.userId
        const cusSerId = this.cusSerId
        const data = {
          'userId': userId,
          'csId': cusSerId
        }

        this.remove = true
        console.log('on confirm' + this.remove)
        const res = await removeCs(data)
        if (res.result.code === ERR_OK) {
          this.$emit('removeCs')
          console.log(JSON.stringify(res))
        } else {
          console.log('error of remove the cusSer:' + JSON.stringify(res))
        }
        // if (msg) {
        //   alert(msg)
        // }
      },
      onShow() {
        console.log('on show')
      },
      onHide() {
        console.log('on hide')
      },
      // 删除客服
      removeCusSer() {
        const userId = this.userInfo.userId
        const cusSerId = this.cusSerId
        const data = {
          'userId': userId,
          'csId': cusSerId
        }
        console.log('there are for test: aaa========' + this.index)
        console.log('=============删除专属客服输入的数据：' + 'data: ' + data + '-' + JSON.stringify(this.userInfo))

        this.showTips = true
        console.log('==================' + this.remove)
        // if (this.remove === 'true') {
        //   const res = await removeCs(data)
        //   if (res.result.code === ERR_OK) {
        //     console.log(JSON.stringify(res))
        //   } else {
        //     console.log('error of remove the cusSer:' + JSON.stringify(res))
        //   }
        // }
      },

      // 获取客服头像
      async getAvatar() {
        const cusSerId = this.cusSerId
        const res = await getCsAvatar(cusSerId)

        if (res) {
          this.avatarImgSrc = res
          console.log('==============您已经成功的获取到了客服的头像' + JSON.stringify(res))
        } else {
          console.log('there are some errors about query the avatar of cs' + JSON.stringify(res.result))
        }
      },

      enterSerCenter() {
        this.$router.push({
          path: '/room/serverDetail',
          query: {cusSerId: this.cusSerId}
        })
      },
      clickToLineUp() {
        this.$emit('toLineUp', this.cusSerId)
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
