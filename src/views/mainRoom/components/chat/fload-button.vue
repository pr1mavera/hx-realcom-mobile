<template>
  <div class="fload-button">
    <div class="popover" :style="tipsPos" :class="{'tipsShow': tipsShow}">
      <span class="text">{{tipsText}}</span>
    </div>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="callPhone"
      :class="[{'visible-when-input': barStatus, 'item-1': !barStatus}]">
      <img width=100% height=100% src="/static/img/chat/fb_phone.png">
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="videoLineUp"
      :class="[{'visible-when-input': barStatus, 'item-2': !barStatus}]">
      <img width=100% height=100% src="/static/img/chat/fb_video.png">
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="onLineLineUp"
      :class="[{'visible-when-input': barStatus, 'item-3': !barStatus}]">
      <img width=100% height=100% :src='`/static/img/chat/fb_${iconByUserGrade}.png`'>
    </button>
    <!-- <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="clickAssess"
      :class="[{'visible-when-input': barStatus, 'item-4': !barStatus}]">
      <img width=100% height=100% src="/static/img/chat/fb_assess.png">
    </button> -->
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { systemMsgStatus, roomStatus, queueStatus, msgStatus, msgTypes } from '@/common/js/status'
import Tools from '@/common/js/tools'
import IM from '@/server/im'

export default {
  components: {
    'Assess': () => import('@/views/mainRoom/components/assess')
  },
  props: {
    barStatus: {
      type: Boolean
    }
  },
  computed: {
    isVip() {
      return +this.userInfo.userGrade <= 3
    },
    iconByUserGrade() {
      return this.isVip ? 'chat_vip' : 'chat'
    },
    tipsPos() {
      return `transform: translateY(${(this.tipsIndex - 1) * 5.6}rem)`
    },
    ...mapGetters([
      'roomMode',
      'userInfo',
      'csInfo',
      'queueMode'
    ])
  },
  data() {
    return {
      notWorkTimeClicked: false,
      tipsTimer: null,
      tipsIndex: 0,
      tipsText: '',
      tipsShow: false
    }
  },
  methods: {
    callPhone() {
      window.location.href = 'tel:95300'
    },
    // 视频客服
    videoLineUp() {
      if (!this.isVip) { // 非VIP客户
        this.showTips(2, '此功能只对VIP客户开放')
        return
      }

      if (this.queueMode.status === queueStatus.queuing && this.queueMode.mode === roomStatus.menChat) { // 排队中
        this.onlineServ2Video('您当前正在在线人工排队中，确认需要取消排队并进入视频客服吗？')
        return
      }

      switch (this.roomMode) { // 服务中
        case roomStatus.AIChat:
          this.$emit('enterVideoLineUp')
          break
        case roomStatus.videoChat:
          this.$vux.alert.show({
            title: '当前已经在视频服务中！！'
          })
          break
        case roomStatus.menChat:
          // this.$vux.alert.show({
          //   title: '您当前正在人工服务中！！请先退出'
          // })
          this.onlineServ2Video('您当前正在在线人工咨询中，确认需要退出并进入视频客服吗？')
          break
      }
    },
    // 在线客服
    onLineLineUp() {
      if (this.queueMode.status === queueStatus.queuing) { // 排队中
        return
      }

      switch (this.roomMode) { // 服务中
        case roomStatus.AIChat:
          const ZX_workT = this.userInfo.workTimeInfo.filter(item => item.callType === 'ZX')
          let workT = {
            startT: ZX_workT[0].startTime,
            endT: ZX_workT[0].endTime
            // startT: '01:00',
            // endT: '02:00'
          }
          if (Tools.DateTools.isWorkTime(workT)) {
            // 当前在工作时间
            this.$emit('enterOnLineLineUp')
            // 重置非工作时间用户点击
            this.notWorkTimeClicked = false
          } else {
            // 当前不在工作时间
            if (this.notWorkTimeClicked) {
              // 用户重复点击
              this.showTips(3, '请勿重复点击')
              return 0
            } else {
              // 用户第一次点击
              const msg = {
                content: `抱歉，当前为非工作时间，人工客服工作时间为周一至周日${workT.startT}-${workT.endT}`,
                time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
                msgStatus: msgStatus.msg,
                msgType: msgTypes.msg_leave
              }
              this.sendMsgs(msg)
              this.notWorkTimeClicked = true
            }
          }
          break
        case roomStatus.videoChat:
          this.$vux.alert.show({
            title: '您正在视频咨询中，如需转在线人工客服，需先结束视频通话。'
          })
          break
        case roomStatus.menChat:
          this.$vux.alert.show({
            title: '当前已经在人工服务中！！'
          })
          break
      }
    },
    onlineServ2Video(tip) {
      const self = this
      this.$vux.confirm.show({
        title: tip,
        async onConfirm() {
          // 设置评价状态
          self.setAssessStatus(true)
          // 用户主动断开人工客服
          const sysMsgs = {
            code: systemMsgStatus.ONLINE_USER_NO_RESPONSE,
            csId: self.csInfo.csId
          }
          const onlineConfig = await self.configSendSystemMsg(sysMsgs)
          await IM.sendSystemMsg(onlineConfig)
          await Tools.AsyncTools.sleep(3000)
          // 进入专属客服
          self.$emit('enterVideoLineUp')
        }
      })
    },
    clickAssess() {
      switch (this.roomMode) {
        case roomStatus.AIChat:
          this.$vux.alert.show({
            title: '当前未接通任何坐席，暂不能评价'
          })
          break
        case roomStatus.videoChat:
          this.setAssessView(true)
          break
        case roomStatus.menChat:
          this.setAssessView(true)
          break
      }
    },
    showTips(index, text) {
      if (this.tipsTimer) {
        // 防止重复
        return 0
      } else {
        // showTips
        this.tipsIndex = index
        this.tipsText = text
        this.tipsShow = true

        this.tipsTimer = setTimeout(() => {
          // 关闭提示
          this.tipsShow = false
          // 重置
          this.tipsTimer && clearTimeout(this.tipsTimer)
          this.tipsTimer = null
        }, 3000)
      }
    },
    ...mapMutations({
      setAssessView: 'SET_ASSESS_VIEW',
      setAssessStatus: 'SET_ASSESS_STATUS'
    }),
    ...mapActions([
      'sendMsgs',
      'configSendSystemMsg'
    ])
  }
}
</script>

<style lang="less">
@import '~@/common/style/mixin.less';
@import '~@/common/style/theme.less';

.fload-button {
  .item {
    display: block;
    width: 3.4rem;
    height: 3.4rem;
    padding: 0;
    margin-bottom: 2.2rem;
    border: 0;
    // border: 0.2rem solid @theme;
    border-radius: 50%;
    // background-color: @bg-light;
    transition: all cubic-bezier(0.4, 0, 0, 1) .2s;
    &:last-child {
      margin-bottom: 0;
    }
    &.visible-when-input {
      transform: translateY(-15rem);
      opacity: 0;
    }
    &.item-1 {
      transition-delay: .34s;
    }
    &.item-2 {
      transition-delay: .31s;
    }
    &.item-3 {
      transition-delay: .28s;
    }
    &.item-4 {
      transition-delay: .25s;
    }
    .icon {
      width: 100%;
      height: 100%;
      // fill: @theme;
    }
  }
  .popover {
    position: absolute;
    top: 0;
    right: 4.4rem;
    z-index: 5000;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    &.tipsShow {
      opacity: 1;
    }
    .text {
      display: inline-block;
      line-height: 1.4rem;
      padding: 1rem 1.3rem;
      background-color: #000;
      border-radius: .7rem;
      color: #fff;
      font-size: 1.3rem;
      white-space:nowrap;
      &::after {
        content: '';
        display: block;
        width: 0;
        height: 0;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        margin: auto;
        transform: translateX(100%);
        border-width: 0.8rem 0 0.8rem 0.8rem;
        border-style: solid;
        border-color: transparent transparent transparent #000;
      }
    }
  }
}
</style>
