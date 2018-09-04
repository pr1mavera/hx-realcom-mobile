<template>
  <div class="label-btn-box">
    <x-button mini style="margin-right: 1.5rem;background: #fff;"
      v-for="(item, index) in btnList"
      :key="index"
      :text="item.text"
      :likeNum="item.likeNum"
    >{{item.text}} {{item.likeNum}}</x-button>
  </div>
</template>

<script>
  import { XButton } from 'vux'
  export default {
    // name: "label-btn.vue"
    components: {
      XButton
    },
    data() {
      return {
        btnList: [
          {text: '聪明伶俐', likeNum: 3},
          {text: '气质美女', likeNum: 33},
          {text: '可爱', likeNum: 2233},
          {text: '解决了问题', likeNum: 256}
        ]
      }
    }
  }
</script>

<style scoped>

</style>
