<template>
  <div class="send-gift">
    <send-extend-item
      v-for="(item, index) in giftItems"
      :key="index"
      :mode="item.mode"
      :icon="item.icon"
      :text="item.text"
      @click.native="selectGiftClick(index)"
    ></send-extend-item>
  </div>
</template>

<script type="text/ecmascript-6">
  import {getImgUrl} from '@/server/index.js'
export default {
  components: {
    'SendExtendItem': () => import('@/views/mainRoom/components/chat/send-extend-item')
  },
  props: {
    giftsInfo: {
      type: Array
      // 数组默认值需从一个工厂函数获取
    }
  },
  data() {
    return {
      giftItems: [
        {
          icon: 'caomeidangao',
          text: '草莓蛋糕'
        },
        // {
        //   icon: 'caomeidangao',
        //   text: '草莓蛋糕'
        // },
        // {
        //   icon: 'caomeidangao',
        //   text: '草莓蛋糕'
        // },
        {
          icon: 'caomeidangao',
          text: '草莓蛋糕'
        },
        {
          icon: 'caomeidangao',
          text: '草莓蛋糕'
        },
        {
          icon: 'caomeidangao',
          text: '草莓蛋糕'
        }
      ],
      myGifts: []
    }
  },
  mounted() {
    this.getGiftsInfo()
  },
  methods: {
    selectGiftClick(type) {
      this.$emit('selectGift', `${type + 1}`)
    },
    // 获取礼物列表
    getGiftsInfo() {
      // 个人中心获取的礼物的展示
      if (this.giftsInfo !== undefined) {
        // this.giftItems = this.giftsInfo
        console.log('================ 收到的礼物列表在此：' + JSON.stringify(this.giftsInfo))
        const giftsInfo = this.giftsInfo
        for (var i in giftsInfo) {
          const text = (giftsInfo[i].giftName + ' ' + giftsInfo[i].giftCount)
          const giftPic = getImgUrl(giftsInfo[i].giftUrl)

          this.giftItems = this.myGifts.push({icon: 'caomeidangao', text: text})
          // this.giftItems = myGetGifts
          console.log('====================  我的礼物列表：' + JSON.stringify({icon: giftPic, text: text}))
        }
      }
    }
  }
}
</script>

<style lang="less">
.send-gift {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 2.4rem 1.8rem;
  .send-extend-item {
    height: 8.6rem;
    flex: 25%;
    text-align: center;
  }
}
</style>
