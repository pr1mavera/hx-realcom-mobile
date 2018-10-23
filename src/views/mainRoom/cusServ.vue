<template>
  <div class="cus-serv">
    <router-view
      @goToLineUp="showConfirm"
    ></router-view>
    <div v-transfer-dom>
      <confirm v-model="lineUpAlert"
        :title="'您即将转入视频客服'"
        @on-cancel="lineUpAlert = false"
        @on-confirm="goToLineUp"
      ></confirm>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { Confirm, TransferDomDirective as TransferDom } from 'vux'

export default {
  directives: {
    TransferDom
  },
  components: {
    Confirm
  },
  data() {
    return {
      lineUpAlert: false,
      csId: ''
    }
  },
  methods: {
    showConfirm(csId) {
      this.lineUpAlert = true
      this.csId = csId
    },
    goToLineUp() {
      this.lineUpAlert = false
      this.$router.push({path: `/room/line-up/${this.csId}`})
    }
  }
}
</script>

<style lang="less">
.weui-dialog {
  width: 70%;
  border-radius: 9px;
  .weui-dialog__hd {
    padding: 1.8em 1.6em 0.5em;
    .weui-dialog__title {
      font-size: 1.6rem;
    }
  }
  .weui-dialog__bd {
    min-height: unset!important;
  }
  .weui-dialog__ft {
    line-height: 44px;
    a {
      color: rgba(33, 150, 243, 1)!important;
    }
  }
}
</style>
