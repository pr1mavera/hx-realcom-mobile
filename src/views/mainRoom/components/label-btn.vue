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
    <swiper height="9.5rem" style="" dots-class="custom-bottom" dots-position="center">
      <swiper-item v-for="(item, index) in pageList" :key="index"
      >
        <checker v-model="selTags" type="checkbox" default-item-class="tags-default"
                 selected-item-class="tags-selected">
          <checker-item :disabled="disable" :value="item" v-for="(item, index) in btnList"
                        :key="index"
                        :text="item.labelName"
                        :likeNum="item.labelCount"
          >{{item.labelName}} {{item.labelCount}}
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
          {labelName: '聪明伶俐', labelId: 3},
          {labelName: '气质美女', labelId: 33},
          {labelName: '解决了问题', labelId: 256},
          {labelName: '可爱', labelId: 2233}
        ],
        selTags: null,
        isDisabled: '',
        disable: true, // 标签不能选，只是做展示功能
        currentPage: 1, // 当前页
        pageList: [1, 2, 3]
      }
    },
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
      getLabelList() {
        // 个人中心=> '认识我'模块中label信息的显示
        // if (this.labelsInfo !== undefined) {
        //   this.btnList = this.labelsInfo
        //   console.log('===========获取的个人中心的label列表为：' + JSON.stringify(this.btnList))
        // }
      },

      // 标签信息查询，获取label列表
      async getLabels() {
        // const csId = this.$route.query.cusSerId
        const csId = '123'
        const page = 1
        const pageSize = 2

        if (this.labelType === 'notAll') {
          // 评价当前客服的标签
          const res = await viewLabels(page, pageSize, csId)
          if (res.result.code === ERR_OK) {
            console.log('=============这是查询到的标签信息:' + JSON.stringify(res.data))
            this.btnList = res.data.labels
          } else {
            console.log('======================= error about query labelTags')
          }
        } else {
          // 查询所有标签
          this.disable = false // 标签可以选
          const res = await viewAllLabels(page, pageSize, csId)
          if (res.result.code === ERR_OK) {
            console.log('=============这是查询到所有的标签信息:' + JSON.stringify(res.data))
            this.btnList = res.data.labels
          } else {
            console.log('======================= error about query labelTags')
          }
        }
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
