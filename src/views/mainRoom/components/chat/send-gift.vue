<template>
  <div
    class="send-gift"
    :style="setTheme">
    <send-extend-item
      v-for="(item, index) in giftItems"
      :key="index"
      :mode="item.mode"
      :icon="item.icon"
      :text="item.text"
      @click.native.prevent="$emit('selectGift', `${index + 1}`)"
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
    theme: {
      type: String
    },
    giftsInfo: {
      type: Array
      // 数组默认值需从一个工厂函数获取
    }
  },
  computed: {
    curTheme() {
      return this.themeMap[this.theme] || this.themeMap['light']
    },
    setTheme() {
      return `
        background-color: ${this.curTheme.bgColor};
        color: ${this.curTheme.textColor};
        height: ${this.curTheme.height};
      `
    }
  },
  data() {
    return {
      themeMap: {
        'light': {
          bgColor: 'rgba(244, 244, 244, 1)',
          textColor: '#909090',
          height: '23rem'
        },
        'dark': {
          bgColor: 'rgba(0, 0, 0, 0.5)',
          textColor: '#fff',
          height: '18rem'
        }
      },
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
    height: 7.6rem;
    flex: 25%;
    text-align: center;
  }
}
</style>
