<template>
  <div class="cus-serv">
    <keep-alive>
      <router-view
        :myCs="myCs"
        @resetMyCs="resetMyCs"
        @removeCs="removeCs"
        @goToLineUp="showConfirm"
      ></router-view>
    </keep-alive>
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
  name: 'cus-serv',
  directives: {
    TransferDom
  },
  components: {
    Confirm
  },
  data() {
    return {
      myCs: [],
      lineUpAlert: false,
      csSelected: {
        csId: '',
        csStatus: '' // 就绪、1：小憩、3：签退
      }
    }
  },
  methods: {
    showConfirm(status, csId) {
      this.lineUpAlert = true
      this.csSelected.csId = csId
      this.csSelected.csStatus = status
    },
    resetMyCs(list) {
      this.myCs = list
    },
    removeCs(index) {
      this.myCs.splice(index, 1)
    },
    goToLineUp() {
      switch (this.csSelected.csStatus) {
        case '0':
          this.lineUpAlert = false
          this.$router.push({path: `/room/line-up/${this.csSelected.csId}`})
          break
        case '1':
          this.alertTip = true
          this.tipCon = '客服小姐姐正在休息'
          break
        case '3':
          this.alertTip = true
          this.tipCon = '客服小姐姐已经签退了'
          // this.$router.push({path: `/room/line-up/${csId}`})
          break
      }
    }
  }
}
</script>

<style lang="less">
// .weui-dialog {
//   width: 70%;
//   border-radius: 9px;
//   .weui-dialog__hd {
//     padding: 1.8em 1.6em 0.5em;
//     .weui-dialog__title {
//       font-size: 1.6rem;
//     }
//   }
//   .weui-dialog__bd {
//     min-height: unset!important;
//   }
//   .weui-dialog__ft {
//     line-height: 44px;
//     a {
//       color: rgba(33, 150, 243, 1)!important;
//     }
//   }
// }
</style>
