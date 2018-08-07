<template>
 <div class="tips-item">
   <span class="item-span">{{text | timeFilter}}</span>
 </div>
</template>

<script type="text/ecmascript-6">
import { formatDate } from '@/common/js/dateConfig.js'

export default {
  props: {
    text: {
      type: String
    },
    types: {
      type: String
    }
  },
  created() {
    console.log('tips-item ===> 你个组件你被引用了哈哈哈')
  },
  filters: {
    timeFilter(val) {
      const temp = new Date(val.replace(/-/g, '/'))
      return formatDate(temp, 'yyyy-MM-dd hh:mm')
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';

.tips-item {
  position: relative;
  width: 100%;
  min-height: 2.2rem;
  text-align: center;
  margin-bottom: 1.8rem;
  .item-span {
    // display: inline-block;
    // vertical-align: middle;
    background-color: rgba(0, 0, 0, .2);
    color: @text-lighter;
    padding: 0.4rem 0.6rem;
    font-size: 1.2rem;
    line-height: 1.4rem;
    border-radius: 5px;
    max-width: 50%;
  }
}
</style>
