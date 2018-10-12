<template>
  <div class="label-btn-box">
    <!--<x-button mini style="margin-right: 1.5rem;background: #fff;"-->
      <!--v-for="(item, index) in btnList"-->
      <!--:key="index"-->
      <!--:text="item.labelName"-->
      <!--:likeNum="item.labelCount"-->
    <!--&gt;{{item.labelName}} {{item.labelCount}}</x-button>-->
    <!--更改为复选框 -->
    <checker v-model="selTags" type="checkbox" default-item-class="tags-default"
             selected-item-class="tags-selected">
      <checker-item :value="item" v-for="(item, index) in btnList"
                    :key="index"
                    :text="item.labelName"
                    :likeNum="item.labelCount"
      >{{item.labelName}} {{item.labelCount}}</checker-item>
    </checker>
    <span>当前选中的值为：{{selTags}}</span>
  </div>
</template>

<script>
  import {mapGetters} from 'vuex'
  import { XButton, Checker, CheckerItem } from 'vux'
  import {ERR_OK, viewLabels} from '@/server/index.js'

  export default {
    // name: "label-btn.vue"
    components: {
      XButton,
      Checker,
      CheckerItem
    },
    props: {
      // labelsInfo: {
      //   type: Array
      //   // 数组默认值需从一个工厂函数获取
      // }
    },
    data() {
      return {
        btnList: [
          {key: '11', value: '111', labelName: '聪明伶俐', labelCount: 3},
          {key: '12', value: '111', labelName: '气质美女', labelCount: 33},
          {key: '13', value: '111', labelName: '可爱', labelCount: 2233},
          {key: '14', value: '111', labelName: '解决了问题', labelCount: 256}
        ],
        selTags: null,
        isDisabled: ''
      }
    },
    computed: {
      ...mapGetters([
        'csInfo'
      ])
    },
    mounted() {
      // this.getLabelList()
    },
    methods: {
      // 获取label列表
      getLabelList() {
        // 个人中心=> '认识我'模块中label信息的显示
        if (this.labelsInfo !== undefined) {
          this.btnList = this.labelsInfo
          console.log('===========获取的label列表为' + JSON.stringify(this.btnList))
        }
      },

      // 标签信息查询
      async getLabels() {
        const csId = this.cuSerInfo.id
        // const csId = '123'
        const page = 0
        const pageSize = -1
        const res = await viewLabels(page, pageSize, csId)

        if (res.result.code === ERR_OK) {
          console.log(JSON.stringify(res.data))
          this.btnList = res.data.labels
        } else {
          console.log('======================= error about query labelTags')
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
    margin: 1rem 1.5rem;
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
