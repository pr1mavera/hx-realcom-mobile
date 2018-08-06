<template>
 <div class="time-item">
   <span class="item-span">{{time | timeFilter}}</span>
 </div>
</template>

<script type="text/ecmascript-6">
import { formatDate } from '@/common/js/dateConfig.js'

export default {
  props: {
    time: {
      type: String
    }
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

.time-item {
  width: 100%;
  text-align: center;
  margin-bottom: 1.4rem;
  .item-span {
    display: inline-block;
    vertical-align: top;
    background-color: rgba(0, 0, 0, .2);
    color: @text-lighter;
    padding: 0.4rem 0.6rem;
    font-size: 1.2rem;
    line-height: 1.2rem;
    border-radius: 5px;
  }
}
</style>
