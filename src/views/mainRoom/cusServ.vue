<template>
  <div class="cus-serv">
    <router-view
      :myCs="myCs"
      @resetMyCs="resetMyCs"
      @removeCs="removeCs"
      @goToLineUp="showConfirm"
      @clickToLineUp = "showConfirm"
      @showShare="showShare"
    ></router-view>
    <!--<div v-transfer-dom>-->
      <!--<confirm v-model='alertTip'>-->
        <!--<p style="text-align:center;">{{tipCon}}</p>-->
      <!--</confirm>-->
    <!--</div>-->
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
import Tools from '@/common/js/tools'

import { getCsStatus } from '@/server/index.js'
// import { roomStatus } from '@/common/js/status'

export default {
  name: 'cus-serv',
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  data() {
    return {
      myCs: [],
      csSelected: {}
    }
  },
  methods: {
    showConfirm(cs) {
      this.csSelected = cs
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
    // 删除
    removeCs(index) {
      // debugger
      this.myCs.splice(index, 1)
      this.myCs.length === 0 && this.$router.replace('/room/cusServ/add')
    },
    showShare(csId, csName) {
      this.$emit('showShare', csId, csName)
    },

    // 进入视频客服
    async goToLineUp() {
      // 判断当前是否为工作时间
      const SP_workT = this.userInfo.workTimeInfo.SP
      if (!Tools.DateTools.isWorkTime(SP_workT)) {
        this.$vux.alert.show({
          title: `抱歉，当前为非工作时间，视频客服工作时间为周一至周日${SP_workT.startTime}-${SP_workT.endTime}，请在工作时间内来询，感谢您的关注！`
        })
        return
      }

      // debugger
      const res = await getCsStatus(this.csSelected.id)
      const status = Number(res.data.status || this.csSelected.status)
      // 只有就绪和忙碌可以排队
      switch (true) {
        case status === 1 || status === 7:
          this.$vux.alert.show({
            title: '啊呀，客服暂时还没准备好呢~'
          })
          break
        case status === 3 || status === 5:
          this.$emit('requestVideoServer', {
            csId: this.csSelected.id,
            csName: this.csSelected.nickName,
            csNick: this.csSelected.nickName
          })
          // this.$router.push({path: `/room/line-up?csId=${this.csSelected.id}&csName=${this.csSelected.nickName}`})
          // this.beforeQueue({
          //   mode: roomStatus.videoChat,
          //   content: `尊敬的${+this.userInfo.userGrade <= 3 ? this.userInfo.userGradeName : ''}客户，正在为您转接视频客服，请稍后。`
          // })
          break
        case status === 4:
          this.$vux.alert.show({
            title: '啊呀，客服正在休息呐~'
          })
          break
        case status === 2:
          this.$vux.alert.show({
            title: '啊呀，客服暂时不在呢~'
          })
          break
      }
    }
  }
}
</script>

<style lang="less">

</style>
