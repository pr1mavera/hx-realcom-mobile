<template>
  <div class="cs-list">
    <my-cs-card
      v-for="(item, index) in myCsList"
      :key="index"
      :cusSerId="item.id"
      :avatarSrc="item.avatar"
      :name="item.nickName"
      :num="item.servTimes"
      :gifts="item.giftCount"
      :csIndex="index"
      @toLineUp="toLineUp"
      @removeCs="removeCs(index)"
    ></my-cs-card>
    <p class="tips">您还可以添加 <span>{{3 - myCsList.length}}</span> 名专属客服</p>
    <x-button :gradients="['#FF8C6A', '#FF80A0']" @click.native="addCs"
              style="width: 15rem;height: 4rem;line-height: 4rem;font-size: 1.6rem;margin-top: 2rem;">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-jiahao"></use>
      </svg>
      {{ myCsList.length === 3 ? '查看更多': '添加客服' }}
    </x-button>
    <div v-transfer-dom>
      <confirm v-model='alertTip'
               >
        <p style="text-align:center;">{{tipCon}}</p>
      </confirm>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
  import { XButton, Confirm, TransferDomDirective as TransferDom } from 'vux'
  import { mapGetters } from 'vuex'
  import { ERR_OK, queryCsInfo } from '@/server/index.js'

export default {
  components: {
    XButton,
    Confirm,
    'myCsCard': () => import('@/views/mainRoom/components/service/my-cs-card')
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  directives: {
    TransferDom
  },
  data() {
    return {
      myCsList: [
        // {
        //   resultUrl: '/static/img/avatar@2x.png',
        //   nickName: '花花',
        //   servTimes: 4578,
        //   giftCount: 9933
        // }
      ],
      quota: 3,
      status: '',
      alertTip: false,
      tipCon: ''
    }
  },
  mounted() {
    this.getCsList()
  },
  methods: {
    // 获取专属客服列表
    async getCsList() {
      // console.log('获取用户信息=>' + this.userInfo.userId)
      const page = 1
      const pageSize = -1
      const userId = this.userInfo.userId // 获取用户的ID
      const listType = '1'
      const res = await queryCsInfo(page, pageSize, userId, listType)
      if (res.result.code === ERR_OK) {
        console.log('========================= 我现在来请求 专属客服 辣 ========================')
        this.myCsList = res.data.csList
      } else {
        console.log('error in queryCsInfo' + JSON.stringify(res))
      }
    },

    // 获取客服头像
    // async getAvatar(cusSerId) {
    //   // const cusSerId = this.cusSerId
    //   const res = await getCsAvatar(cusSerId)
    //
    //   if (res) {
    //     console.log('==============您已经成功的获取到了客服的头像' + JSON.stringify(res))
    //     return JSON.stringify(res)
    //   } else {
    //     console.log('there are some errors about query the avatar of cs' + JSON.stringify(res.result))
    //   }
    // },

    // J进入客服列表页
    addCs() {
      this.$router.push({
        path: '/room/cusServ/add',
        query: {myCsNum: this.myCsList.length}
      })
    },

    removeCs(index) {
      this.myCsList.splice(index, 1)
    },

    toLineUp(index, csId) {
      // this.$router.push({path: `/room/line-up/${this.userInfo.userId}/${this.cusSerId}`})
      const status = this.myCsList[index].status // 0：就绪、1：小憩、3：签退
      switch (status) {
        case '0':
          this.$emit('goToLineUp', csId)
          break
        case '1':
          this.alertTip = true
          this.tipCon = '客服小姐姐正在休息'
          break
        case '3':
          this.alertTip = true
          this.tipCon = '客服小姐姐已经签退了'
          // this.$router.push({path: `/room/line-up/${csId}`})
          break
      }
    }
  }
}
</script>

<style lang="less">
  .cs-list {
    min-height: 100%;
    padding: 2.5rem 0;
    background: #f4f4f4;
    box-sizing: border-box;
    .icon {
      width: 1.4rem;
      height: 1.4rem;
      fill: #ffffff;
      vertical-align: -0.15em;
    }
    .tips {
      color: #909090;
      font-size: 1.2rem;
      text-align: center;
      span {
        color: #FE9AA0;
      }
    }
  }
</style>
