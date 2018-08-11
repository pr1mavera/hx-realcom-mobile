<!-- 用户给客服评论的组件 -->
<template>
  <div v-transfer-dom>
    <popup v-model="show" is-transparent>
      <div class="popup-main" style="">
        <!--<group>-->
          <!--<cell title="Product" value="Donate"></cell>-->
          <!--<cell title="Total" value="$10.24"></cell>-->
        <!--</group>-->
        <!--<div style="padding:20px 15px;">-->
          <!--<x-button type="primary">Pay</x-button>-->
          <!--<x-button @click.native="show7 = false">Cancel</x-button>-->
        <!--</div>-->
        <x-icon type="ios-close" size="30"></x-icon>
        <p> there are some words for test</p>
      </div>
    </popup>
  </div>
</template>

<script>
  import { TransferDom, Popup } from 'vux'
  export default {
    directives: {
      TransferDom
    },
    components: {
      Popup
    },
    data() {
      return {
        show: true
      }
    }
  }
</script>

<style scoped lang="less">
  .vux-popup-dialog {
    height: 100vh!important;
    .vux-x-icon {
      fill: #FF959C;
      position: relative;
      right: -21rem;
    }
    .popup-main {
      position: relative;
      width: 24rem;
      height: 250px;
      margin: 0 auto;
      padding-top: 10px;
      background: #fff;
      border-radius: 1rem;
    }
  }
</style>
