<template>
  <div class="label-btn-box">
  <!--  <checker v-model="selTags" type="checkbox" default-item-class="tags-default"
             selected-item-class="tags-selected">
      <checker-item :disabled="disable" :value="item" v-for="(item, index) in btnList"
                    :key="index"
                    :text="item.labelName"
                    :likeNum="item.labelCount"
      >{{item.labelName}} {{item.labelCount}}</checker-item>
    </checker>-->
    <!--<span>当前选中的值为：{{selTags}}</span>-->
    <swiper height="9.5rem" style="" :show-dots="showDots" @on-index-change="changePage" dots-class="custom-bottom" dots-position="center">
      <swiper-item v-for="(item, index) in pageList" :key="index">
        <!--{{index}}-->
        <checker v-model="selTags" type="checkbox" default-item-class="tags-default" @on-change="selChanege"
                 selected-item-class="tags-selected">
          <checker-item :disabled="disable"
                        :value="item" v-for="(item, index) in btnList"
                        :key="index"
                        :text="item.labelName"
                        :likeNum="item.labelCount"
          >{{item.name}} {{item.count}}
          </checker-item>
        </checker>
      </swiper-item>
    </swiper>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { Checker, CheckerItem, Swiper, SwiperItem } from 'vux'
  import {ERR_OK, viewLabels, viewAllLabels} from '@/server/index.js'

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
    // watch: {
    //   selTags: [
    //     function handle1(val, oldVal) {
    //     this.$emit('seledLabels', this.selTags)
    //     }
    //   ]
    // },
    computed: {
      ...mapGetters([
        'csInfo'
      ])
    },
    mounted() {
      // this.getLabelList()
      this.getLabels()
    },
    methods: {
      // 获取label列表
      getLabelList() {},

      // 切换轮播页
      async changePage(index) {
        this.currentPage = index + 1
        // debugger
        console.log('======================>当前页是' + index)
        const page = this.currentPage
        const pageSize = 2
        // this.disable = false // 标签可以选
        // debugger
        const res = await viewAllLabels(page, pageSize)
        if (res.result.code === ERR_OK) {
          this.btnList = res.data.labels
        } else {
          console.log('======================= error about query labelTags')
        }
      },

      // 标签信息查询，获取label列表
      async getLabels() {
        // const csId = this.csInfo.cusSerId
        const csId = '123'

        // debugger
        if (this.labelType === 'notAll') {
          const page = 0
          const pageSize = -1
          // 评价当前客服的标签
          const res = await viewLabels(page, pageSize, csId)
          if (res.result.code === ERR_OK) {
            console.log('=============这是查询到的标签信息:' + JSON.stringify(res.data))
            this.showDots = false
            this.btnList = res.data.labels
          } else {
            console.log('======================= error about query labelTags')
          }
        } else {
          // 查询所有标签
          const page = 1
          const pageSize = 2
          this.disable = false // 标签可以选
          // debugger
          const res = await viewAllLabels(page, pageSize)
          if (res.result.code === ERR_OK) {
            console.log('=============这是当前页查询到所有的标签信息:' + JSON.stringify(res))
            const pages = Math.ceil(res.data.totalCount[0].counts / pageSize) // 总页数
            for (let i = 2; i <= pages; i++) {
              this.pageList.push(i)
            }
            this.btnList = res.data.labels
          } else {
            console.log('======================= error about query labelTags')
          }
        }
      },
      selChanege() {
        // debugger
        this.$emit('seledLabels', this.selTags)
        console.log('你选中了这一个选项' + JSON.stringify(this.selTags))
      }
    }
  }
</script>

<style scoped lang="less">
.label-btn-box {
  /*未选中状态的样式*/
  .tags-default {
    color: #FF959C;
    padding: .6rem 1.2rem;
    margin: 1rem 1rem;
    border-radius: 2rem;
    border: 1px solid #FF959C;
  }
  /*选中之后的状态*/
  .tags-selected {
    color: #ffffff;
    background: #fe959c;
  }
}
</style>
