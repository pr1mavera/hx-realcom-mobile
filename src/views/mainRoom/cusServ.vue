<template>
  <div class="cus-serv">
    <router-view
      :myCs="myCs"
      @resetMyCs="resetMyCs"
      @removeCs="removeCs"
      @goToLineUp="showConfirm"
    ></router-view>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'

export default {
  name: 'cus-serv',
  data() {
    return {
      myCs: [],
      csSelected: {
        csId: '',
        csStatus: '' // 就绪、1：小憩、3：签退
      }
    }
  },
  methods: {
    showConfirm(status, csId) {
      this.csSelected.csId = csId
      this.csSelected.csStatus = status
      const self = this
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
    removeCs(index) {
      this.myCs.splice(index, 1)
    },
    goToLineUp() {
      switch (this.csSelected.csStatus) {
        case '0':
          this.lineUpAlert = false
          this.$router.push({path: `/room/line-up/${this.csSelected.csId}`})
          this.enterToLineUp('正在为您转接视频客服，请稍候')
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
    },
    ...mapActions([
      'enterToLineUp'
    ])
  }
}
</script>

<style lang="less">

</style>
