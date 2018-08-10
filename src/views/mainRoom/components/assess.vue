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
        <p> there are some words for test the assess components </p>
      </div>
    </popup>
  </div>
</template>

<script>
  import { TransferDom, Popup } from 'vux'
  export default {
    components: {
      TransferDom,
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
    .popup-main {
      width: 24rem;
      height: 250px;
      margin: 0 auto;
      padding-top: 10px;
      background: #fff;
      border-radius: 1rem;
    }
  }
</style>
