<template>
  <div
    class="send-gift"
    :style="setTheme">
    <send-extend-item
      v-for="(item, index) in giftMap"
      :key="index"
      :icon="`/static/img/gift/${item.id}.png`"
      :text="item.name"
      @click.native.prevent="$emit('selectGift', item)"
    ></send-extend-item>
    <!-- 当客服还没有收到礼物时 -->
    <div class="none-gift" v-if="giftMap.length === 0">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-meiyouneirong"></use>
      </svg>
      <span>&nbsp;&nbsp;~~咦,我竟然还没有收到礼物~</span>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import {ERR_OK, getImgUrl, viewGifts} from '@/server/index.js'
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
          height: '23rem'
        }
      },
      giftMap: [
        {
          id: 'gift_car',
          name: '豪华跑车'
        },
        {
          id: 'gift_wing',
          name: '天使翅膀'
        },
        {
          id: 'gift_rocket',
          name: '土豪火箭'
        },
        {
          id: 'gift_earphones',
          name: '镶钻耳麦'
        },
        {
          id: 'gift_island',
          name: '优享海岛'
        },
        {
          id: 'gift_cake',
          name: '草莓蛋糕'
        }
      ],
      myGifts: [],
      giftUrl: getImgUrl('url') // 礼物图片连接
    }
  },
  mounted() {
    // this.getGiftsInfo()
  },
  methods: {
    // 获取礼物列表
    async getGiftsInfo() {
      // 个人中心获取的礼物的展示
      // if (this.giftsInfo !== undefined) {
      //   // this.giftMap = this.giftsInfo
      //   console.log('================ 收到的礼物列表在此：' + JSON.stringify(this.giftsInfo))
      //   const giftsInfo = this.giftsInfo
      //   for (var i in giftsInfo) {
      //     const text = (giftsInfo[i].giftName + ' ' + giftsInfo[i].giftCount)
      //     const giftPic = getImgUrl(giftsInfo[i].giftUrl)
      //
      //     this.giftMap = this.myGifts.push({url: 'caomeidangao', name: text})
      //     // this.giftMap = myGetGifts
      //     console.log('====================  我的礼物列表：' + JSON.stringify({url: giftPic, name: text}))
      //   }
      // }

      // 未分页
      // http://192.168.8.108:7001/api/v1/video/user/gifts?page=0&pageSize=-1&csId=1
      const page = 0
      const pageSize = -1
      const csId = '1' // 测试数据

      const res = await viewGifts(page, pageSize, csId)
      debugger
      console.log('==============>这里是礼物列表啊啊' + JSON.stringify(res))
      if (res.result.code === ERR_OK) {
        this.giftMap = res.data.gifts
      } else {
        console.log('there are some errors about get giftsInfo' + JSON.stringify(res))
      }
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
.send-gift {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  padding: 2.4rem 1.8rem;
  .send-extend-item {
    height: 7.6rem;
    flex: 25%;
    flex-grow: 0;
    text-align: center;
  }
  .none-gift {
    width: 100%;
    display: flex;
    color: @text-normal;
    justify-content: center;
    .icon {
      width: 4.8rem;
      height: 4.8rem;
      fill: @text-light;
      vertical-align: -0.15em;
    }
    span {
      align-self: center;
    }
  }
}
</style>
