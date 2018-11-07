<template>
  <div class="label-btn-box">
    <swiper height="9.5rem" v-if="labelType === 'All'" style="" :show-dots="showDots" dots-class="custom-bottom" dots-position="center">
      <swiper-item v-for="(pages, index) in btnList" :key="index">
        <!--{{index}}-->
        <checker v-model="selTags" type="checkbox" default-item-class="tags-default" @on-change="selChanege"
                 selected-item-class="tags-selected">
          <checker-item
                        :value="item" v-for="(item, index) in pages.list"
                        :key="index"
                        :text="item.labelName"
                        :likeNum="item.labelCount"
          >{{item.labelName}}
          </checker-item>
        </checker>
      </swiper-item>
    </swiper>
    <!--labels for me-->
    <checker v-if="labelType === 'notAll'" type="checkbox" default-item-class="tags-default">
      <checker-item :disabled="disable"
                    v-for="(item, index) in btnList"
                    :key="index"
                    :value="item"
      >{{item.labelName}} {{item.labelCount}}</checker-item>
    </checker>
    <!-- 当没有标签的情况 -->
    <div class="label-none" v-if="btnList.length === 0">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-meiyou-copy"></use>
      </svg>
      <span>&nbsp;&nbsp;~~咦,我竟然还没有标签呐~</span>
    </div>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'
  import Queue from '@/common/js/Queue'
  import { Checker, CheckerItem, Swiper, SwiperItem } from 'vux'
  import { ERR_OK, viewLabels, viewAllLabels } from '@/server/index.js'

  export default {
    // name: "label-btn.vue"
    components: {
      Checker,
      CheckerItem,
      Swiper,
      SwiperItem
    },
    props: {
      labelType: {
        type: String
      }
    },
    data() {
      return {
        btnList: [
          // {name: '聪明伶俐', id: 3}
        ],
        selTags: null, // 选中的标签
        isDisabled: '',
        disable: true, // 标签不能选，只是做展示功能
        currentPage: 1, // 当前页
        pageList: [1],
        showDots: true
      }
    },
    computed: {
      ...mapGetters([
        'csInfo'
      ])
    },
    mounted() {
      // this.getLabelList()
      this.$nextTick(() => {
        this.getLabels()
      })
    },
    methods: {
      // 获取label列表
      getLabelList() {},

      // 切换轮播页
      async changePage(index) {
        this.currentPage = index + 1
        // debugger
        // console.log('======================>当前页是' + index)
        const page = this.currentPage
        const pageSize = 2
        // this.disable = false // 标签可以选
        // debugger
        const res = await viewAllLabels(page, pageSize)
        if (res.result.code === ERR_OK) {
          this.btnList = res.data.labels
        } else {
          // console.log('======================= error about query labelTags')
        }
      },

      // 标签信息查询，获取label列表
      async getLabels() {
        const csId = this.$route.query.cusSerId
        // const csId = '123'

        if (this.labelType === 'notAll') {
          const page = 0
          const pageSize = -1
          // 评价当前客服的标签

          const res = await viewLabels(page, pageSize, csId)
          if (res.result.code === ERR_OK) {
            console.log('=============这是查询到的我的评价标签信息:' + JSON.stringify(res.data.labels))
            this.showDots = false
            this.btnList = res.data.labels
          } else {
            // console.log('======================= error about query labelTags')
          }
        } else {
          // 查询所有标签
          const page = 1
          const pageSize = -1
          this.disable = false // 标签可以选
          // debugger
          const res = await viewAllLabels(page, pageSize)
          if (res.result.code === ERR_OK) {
            // console.log('=============这是当前页查询到所有的标签信息:' + JSON.stringify(res))
            // const pages = Math.ceil(res.data.totalCount[0].counts / pageSize) // 总页数
            // for (let i = 2; i <= pages; i++) {
            //   this.pageList.push(i)
            // }
            // this.btnList = res.data.labels
            this.btnList = this.labelPagination(res.data.labels)
          } else {
            console.log('======================= error about query labelTags')
          }
        }
      },
      labelPagination(list) {
        let map = []
        list.sort((a, b) => b.labelName.length - a.labelName.length) // 原标签数组逆序排列

        // 初始化双向队列
        let queue = Object.create(Queue)
        queue.init(list)

        // 初始化页数
        let i = 1

        // 初始化单页最大字符上限
        const limit = list[0].labelName.length + 1

        while (!queue.isEmpty()) {
          // 初始化单页数据
          let temp = {
            page: i,
            strLen: 0,
            list: []
          }

          while (temp.strLen <= limit && !queue.isEmpty()) {
            // 第一轮添加
            const a = queue.dequeueFront()
            temp.list.push(a)
            temp.strLen += a.labelName.length

            if (!queue.isEmpty()) {
              // 第二轮添加
              const b = queue.dequeueBack()
              temp.list.push(b)
              temp.strLen += b.labelName.length

              if (temp.strLen <= limit && !queue.isEmpty()) {
                // 长度依然小于12
                const a = queue.dequeueFront()
                temp.list.push(a)
                temp.strLen += a.labelName.length
              } else {
                break
              }
            }
          }

          // 迭代页数
          i++

          // 封装单页
          map.push(temp)

          if (queue.isEmpty()) {
            break
          }
        }
        return map
      },
      selChanege() {
        // debugger
        this.$emit('seledLabels', this.selTags)
        // console.log('你选中了这一个选项' + JSON.stringify(this.selTags))
      }
    }
  }
</script>

<style scoped lang="less">
@import '~@/common/style/theme.less';
.label-btn-box {
  /*未选中状态的样式*/
  .tags-default {
    color: #FF959C;
    padding: .6rem 0.8rem;
    margin: 1rem 0.5rem;
    border-radius: 2rem;
    border: 1px solid #FF959C;
  }
  /*选中之后的状态*/
  .tags-selected {
    color: #ffffff;
    background: #fe959c;
  }
  .label-none {
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
