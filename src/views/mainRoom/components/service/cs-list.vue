<template>
  <div class="cs-list">
    <my-cs-card
      v-for="(item, index) in myCsList"
      :key="index"
      :cusSerId="item.id"
      :avatarSrc="item.resultUrl"
      :name="item.nickName"
      :num="item.servTimes"
      :gifts="item.giftCount"
    ></my-cs-card>
    <p class="tips">您还可以添加 <span>{{3 - myCsList.length}}</span> 名专属客服</p>
    <x-button :gradients="['#FF8C6A', '#FF80A0']" @click.native="addCs"
              style="width: 15rem;height: 4rem;line-height: 4rem;font-size: 1.6rem;margin-top: 2rem;">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-jiahao"></use>
      </svg>
      {{ myCsList.length === 3 ? '查看更多': '添加客服' }}
    </x-button>
  </div>
</template>

<script type="text/ecmascript-6">
  import {XButton} from 'vux'
  import {queryCsInfo} from '@/server/index.js'

export default {
  components: {
    XButton,
    'myCsCard': () => import('@/views/mainRoom/components/service/my-cs-card')
  },
  data() {
    return {
      myCsList: []
    }
  },
  mounted() {
    this.getCsList()
  },
  methods: {
    async getCsList() {
      const page = 1
      const pageSize = -1
      const userId = '123'
      const listType = '1'
      const res = await queryCsInfo(page, pageSize, userId, listType)
      if (res) {
        alert(JSON.stringify(res))
        this.myCsList = res.data.csList
      }
    },
    addCs() {
      console.log('添加专属客服')
      this.$router.push('/room/cusServ/add')
    }
  }
}
</script>

<style lang="less">
  .cs-list {
    min-height: 100%;
    padding-top: 2.5rem;
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
