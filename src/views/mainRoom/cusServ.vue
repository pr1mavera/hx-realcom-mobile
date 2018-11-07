<template>
  <div class="cus-serv">
    <router-view
      :myCs="myCs"
      @resetMyCs="resetMyCs"
      @removeCs="removeCs"
      @goToLineUp="showConfirm"
    ></router-view>
    <!--<div v-transfer-dom>-->
      <!--<confirm v-model='alertTip'>-->
        <!--<p style="text-align:center;">{{tipCon}}</p>-->
      <!--</confirm>-->
    <!--</div>-->
  </div>
</template>

<script type="text/ecmascript-6">
import { mapActions } from 'vuex'

export default {
  name: 'cus-serv',
  data() {
    return {
      myCs: [],
      csSelected: {
        csId: '',
        csStatus: '' // 1-签入，2-就绪, 3-小憩, 4-签出, 5-忙碌
      }
    }
  },
  methods: {
    showConfirm(status, csId) {
      this.csSelected.csId = csId
      this.csSelected.csStatus = status
      const self = this
      // debugger
      this.$vux.confirm.show({
        title: '您即将转入视频客服',
        onConfirm() {
          self.goToLineUp()
        }
      })
    },
    resetMyCs(list) {
      this.myCs = list
    },
    // 删除
    removeCs(index) {
      debugger
      this.myCs.splice(index, 1)
    },
    goToLineUp() {
      // debugger
      switch (this.csSelected.csStatus) {
        case '1':
          this.$vux.alert.show({
            title: '啊呀，当前客服还没准备好呢~'
          })
          break
        case '2': // 就绪状态
          // this.alertTip = true
          this.$router.push({path: `/room/line-up/${this.csSelected.csId}`})
          // this.enterToLineUp('正在为您转接视频客服，请稍候')
          break
        case '3':
          this.$vux.alert.show({
            title: '啊呀，当前客服正在休息呐~'
          })
          break
        case '4':
          this.$vus.alert.show({
            title: '啊呀，当前客服不在呢~'
          })
          break
        case '5':
          this.$vux.alert.show({
            title: '啊呀，当前客服忙~'
          })
          break
        default:
          this.$vux.alert.show({
            title: '啊呀，联系不上当前客服~'
          })
      }
    },
    ...mapActions([
      'enterToLineUp'
    ])
  }
}
</script>

<style lang="less">

</style>
