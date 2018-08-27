<template>
  <div class="send-gift">
    <send-extend-item
      v-for="(item, index) in giftItems"
      :key="index"
      :mode="item.mode"
      :icon="item.icon"
      :text="item.text"
    ></send-extend-item>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  components: {
    'SendExtendItem': () => import('@/views/mainRoom/components/chat/send-extend-item')
  },
  data() {
    return {
      giftItems: [
        {
          icon: 'http://192.168.8.106:3000/dist/static/img/caimeidangao',
          text: '草莓蛋糕'
        },
        {
          icon: 'http://192.168.8.106:3000/dist/static/img/caimeidangao',
          text: '草莓蛋糕'
        },
        {
          icon: 'http://192.168.8.106:3000/dist/static/img/caimeidangao',
          text: '草莓蛋糕'
        },
        {
          icon: 'http://192.168.8.106:3000/dist/static/img/caimeidangao',
          text: '草莓蛋糕'
        },
        {
          icon: 'http://192.168.8.106:3000/dist/static/img/caimeidangao',
          text: '草莓蛋糕'
        },
        {
          icon: 'http://192.168.8.106:3000/dist/static/img/caimeidangao',
          text: '草莓蛋糕'
        }
      ]
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
    flex-basis: 25%;
    text-align: center;
  }
}
</style>
