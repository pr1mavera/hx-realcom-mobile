<template>
  <div class="label-btn-box">
    <x-button mini style="margin-right: 1.5rem;background: #fff;"
      v-for="(item, index) in btnList"
      :key="index"
      :text="item.labelName"
      :likeNum="item.labelCount"
    >{{item.labelName}} {{item.labelCount}}</x-button>
  </div>
</template>

<script>
  import { XButton } from 'vux'
  export default {
    // name: "label-btn.vue"
    components: {
      XButton
    },
    props: {
      labelsInfo: {
        type: Array
        // 数组默认值需从一个工厂函数获取
      }
    },
    data() {
      return {
        btnList: [
          {labelName: '聪明伶俐', labelCount: 3},
          {labelName: '气质美女', labelCount: 33},
          {labelName: '可爱', labelCount: 2233},
          {labelName: '解决了问题', labelCount: 256}
        ]
      }
    },
    mounted() {
      this.getLabelList()
    },
    methods: {
      // 获取label列表
      getLabelList() {
        // 个人中心=> '认识我'模块中label信息的显示
        if (this.labelsInfo !== undefined) {
          this.btnList = this.labelsInfo
          console.log('===========获取的label列表为' + JSON.stringify(this.btnList))
        }
      }
    }
  }
</script>

<style scoped>

</style>
