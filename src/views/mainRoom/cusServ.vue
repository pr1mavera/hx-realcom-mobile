<template>
  <div class="cus-serv">
    <router-view
      :myCs="myCs"
      @resetMyCs="resetMyCs"
      @removeCs="removeCs"
      @goToLineUp="showConfirm"
      @clickToLineUp = "showConfirm"
    ></router-view>
    <!--<div v-transfer-dom>-->
      <!--<confirm v-model='alertTip'>-->
        <!--<p style="text-align:center;">{{tipCon}}</p>-->
      <!--</confirm>-->
    <!--</div>-->
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapActions } from 'vuex'
import Tools from '@/common/js/tools'

import {getCsStatus} from '@/server/index.js'
import { roomStatus } from '@/common/js/status'

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
    },

    // 进入视频客服
    async goToLineUp() {
      // 判断当前是否为工作时间
      const SP_workT = this.userInfo.workTimeInfo.filter(item => item.callType === 'SP')
      const workT = {
        startT: SP_workT[0].startTime,
        endT: SP_workT[0].endTime
      }
      if (!Tools.DateTools.isWorkTime(workT)) {
        this.$vux.alert.show({
          title: `抱歉，当前为非工作时间，视频客服工作时间为周一至周日${workT.startT}-${workT.endT}，请在工作时间内来询，感谢您的关注！`
        })
        return
      }

      // debugger
      const res = await getCsStatus(this.csSelected.id)
      const status = Number(res.data.status || this.csSelected.status)
      // 只有就绪和忙碌可以排队
      switch (true) {
        case status === 1:
          this.$vux.alert.show({
            title: '啊呀，当前客服暂时还没准备好呢~'
          })
          break
        case status === 3 || status === 5:
          this.$router.push({path: `/room/line-up?csId=${this.csSelected.id}&csName=${this.csSelected.nickName}`})
          this.beforeQueue({
            mode: roomStatus.videoChat,
            content: '正在为您转接视频客服，请稍候'
          })
          break
        case status === 4:
          this.$vux.alert.show({
            title: '啊呀，当前客服正在休息呐~'
          })
          break
        case status === 2:
          this.$vux.alert.show({
            title: '啊呀，当前客服暂时不在呢~'
          })
          break
      }
    },
    ...mapActions([
      'beforeQueue'
    ])
  }
}
</script>

<style lang="less">

</style>
