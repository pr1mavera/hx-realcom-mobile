<template>
  <div class="cs-list">
    <my-cs-card
      v-for="(item, index) in myCsList"
      :key="index"
      :avatarSrc="item.avatarSrc"
      :name="item.name"
      :num="item.num"
      :gifts="item.gifts"
    ></my-cs-card>
    <p class="tips">您还可以添加 <span>{{quota}}</span> 名专属客服</p>
    <x-button :gradients="['#FF8C6A', '#FF80A0']" @click.native="addCs"
              style="width: 15rem;height: 4rem;line-height: 4rem;font-size: 1.6rem;margin-top: 2rem;">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-jiahao"></use>
      </svg>
      添加客服</x-button>
    <!-- v-if -->
  </div>
</template>

<script type="text/ecmascript-6">
  import {XButton} from 'vux'
export default {

  components: {
    XButton,
    'myCsCard': () => import('@/views/mainRoom/components/service/my-cs-card')
  },
  data() {
    return {
      myCsList: [
        {
          avatarSrc: '/static/img/avatar@2x.png',
          name: '丽丽',
          num: 2233,
          gifts: 3345
        },
        {
          avatarSrc: '/static/img/avatar@2x.png',
          name: '花花',
          num: 4578,
          gifts: 9933
        }
      ],
      quota: 3
    }
  },
  mounted() {
    this.getQuota()
  },
  methods: {
    getQuota() {
      this.quota = 3 - this.myCsList.length
    },
    addCs() {
      console.log('添加专属客服')
      this.$router.push({
        path: '/room/cusServ/add'
      })
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
