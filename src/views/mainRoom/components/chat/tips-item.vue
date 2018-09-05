<template>
 <div class="tips-item">
   <span class="item-span" v-if="this.types === tipTypes.tip_time">{{text | timeFilter}}</span>
   <span class="item-span" v-if="this.types === tipTypes.tip_normal">{{text}}</span>
   <span class="item-span" v-if="this.types === tipTypes.tip_success">
     <svg class="icon icon-success extend-click" aria-hidden="true">
       <use xlink:href="#icon-chenggong"></use>
     </svg>
     视频客服转接成功，祝您沟通愉快！
   </span>
   <span class="item-span" v-if="this.types === tipTypes.tip_fail">
     <svg class="icon icon-fail extend-click" aria-hidden="true">
       <use xlink:href="#icon-zhuanjiemang"></use>
     </svg>
     人工客服忙
     <span class="button">转其他客服</span>
   </span>
   <span class="item-span" v-if="this.types === tipTypes.tip_line_up">
     当前排队{{num}}人，请耐心等待
     <span class="button">取消排队</span>
   </span>
 </div>
</template>

<script type="text/ecmascript-6">
import { formatDate } from '@/common/js/dateConfig.js'
import { tipTypes } from '@/common/js/status'

export default {
  props: {
    text: {
      type: String
    },
    types: {
      type: String
    }
  },
  data() {
    return {
      tipTypes: tipTypes,
      num: 3
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
  display: inline-block;
  max-width: 70%;
  min-height: 1.2rem;
  padding: 0.3rem 0.6rem;
  margin: 0 auto 1.8rem;
  transform: scale(calc(~'10 / 12'));
  background-color: rgba(0, 0, 0, .2);
  border-radius: 5px;
  .item-span {
    vertical-align: middle;
    color: @text-lighter;
    font-size: 1.2rem;
    height: 1.2rem;
    .icon {
      width: 1.2rem;
      height: 1.2rem;
      fill: #fff;
      display: inline-block;
      vertical-align: inherit;
    }
    .button {
      color: #2196F3;
    }
  }
}
</style>
