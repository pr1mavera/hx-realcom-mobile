<template>
  <div class="connect-success">
    <confirm v-model="show"
             @on-cancel="onCancel"
             @on-confirm="onConfirm"
             @on-show="onShow"
             @on-hide="onHide">
      <p style="text-align:center;">there are some words for test</p>
    </confirm>
    <p>there are some words for test</p>
  </div>
</template>

<script type="text/ecmascript-6">
  import {Confirm} from 'vux'

  export default {
    components: {
      Confirm
    }
  }
</script>

<style scoped>
.connect-success {
  color: #000000;
}
</style>
