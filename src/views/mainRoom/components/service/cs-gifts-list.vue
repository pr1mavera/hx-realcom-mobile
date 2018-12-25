<template>
<!-- 坐席收到礼物的列表 -->
  <div class="container" id="container">
    <div class="title" >
      <span class="tit-rig">礼物列表</span>
      <span class="btn btn-back" @click="$router.back(-1)">返回</span>
    </div>
    <!-- 每条礼物记录 -->
    <div class="list-item" v-for="(item, index) in giftsList" :key="index">
      <span class="right">
        <span class="name">{{item.userName}}</span> <span class="con">送给她一个{{item.giftName}}</span>
      </span>
      <span class="left time">{{item.sendTime}}</span>
    </div>
  </div>
</template>

<script>
  import {ERR_OK, giftsRecording} from '@/server/index.js'
  export default {
    // name: "cs-gifts-list"
    data() {
      return {
        page: 1,
        nextPage: 1,
        giftsList: [
          {
            'userName': '李建伟',
            'giftName': '镶钻耳麦',
            'sendTime': '2018-12-21T07:09:11.000Z'
          },
          {
            'userName': '朱美阳',
            'giftName': '镶钻耳麦',
            'sendTime': '2018-12-20T08:31:51.000Z'
          }
        ] // 礼物记录
      }
    },
    mounted() {
      const self = this
      const body = document.getElementById('body') // 获取body
      const container = document.getElementById('container')
      const scrollHeight = body.scrollHeight // 获取总高度
      const screenHeight = screen.height // 屏幕高度
      const scrollTop = container.scrollTop // 当前滚动位置

      window.addEventListener('scroll', (e) => {
        debugger
        // scrollTop > scrollHeight - 3 / 2 * screenHeight && page <= maxPage && getNextPage
        // 当下滑到剩余1/2个屏幕的时候加载下一页的记录 即当前滚动位置 > 总高度 - 屏幕高度 - 1/2屏幕高度
        if (scrollTop > scrollHeight - 3 / 2 * screenHeight) {
          self.page += 1
        }
      })

      this.$nextTick(() => {
        this.getRecording()
      })
    },
    methods: {
      async getRecording() {
        const page = this.page
        const pageSize = 10
        const csId = this.$route.query.csId
        debugger
        const res = await giftsRecording(page, pageSize, csId)
        if (res.result.code === ERR_OK) {
          console.log('')
        }
      },
      getNextPage() {
      } // h
    },
    watch: {
      // 监听页面滚动的位置
    }
  }
</script>

<style scoped lang="less">
  .container {
    font-size: 1.2rem;
    padding: 1rem 1.2rem 0;
    .title {
      display: flex;
      line-height: 2;
      justify-content: space-between;
      border-bottom: 1px solid #FF959C;
      .tit-rig {
        color: #FF959C;
      }
    }
    .list-item {
      display: flex;
      height: 4rem;
      line-height: 4rem;
      border-top: 1px solid #F2F2F2;
      justify-content: space-between;
      .right {
        .name{
          color: #646464;
          margin-right: .5rem;
        }
        .con{
          color: #909090;
        }
      }
      .left {
        color: #BDBDBD;
      }
    }
    .list-item:first-child {
      border-top: none;
    }
  }
</style>
