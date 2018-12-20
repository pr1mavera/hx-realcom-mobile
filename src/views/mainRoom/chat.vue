<template>
  <div class="chat">
    <!-- <header-bar></header-bar> -->
    <div
      class="chat-room transition-bezier"
      ref="chatRoom"
      :class="[{'extend-bar-open': this.extendBarOpen, 'extend-bar-launch-open': extendBarLaunchOpen}]">
      <div class="chat-wrapper" ref="chatScroll">
        <pull-down
          :pullDownStyle="pullDownStyle"
          :isRebounding="isRebounding"
          :beforePullDown="beforePullDown"
          :isPullingDown="isPullingDown"
          :bubbleY="bubbleY"
          :pulldownResult="pulldownResult"
        ></pull-down>
        <div class="chat-content" ref="chatContent">
          <ul>
            <li class="chat-content-block chat-content-start" ref="chatContentStart"></li>
            <li class="chat-content-li"
              v-for="(item, index) in this.historyMsgs"
              :key="`history-${index}`"
              :class="{'text-center': item.msgStatus === msgStatus.tip}">
              <keep-alive>
                <component
                  :is="_showItemByType(item.msgStatus)"
                  :msg="item"
                  @msgLongPress="showCopy"
                  @onClickImgMsg="onClickImgMsg"
                  @targetLink="targetLink"
                ></component>
              </keep-alive>
            </li>
            <li class="chat-content-li text-center history-block" v-if="historyMsgs.length !== 0">
              <span class="item line border-1px-before"></span>
              <span class="item text">以上为历史消息</span>
              <span class="item line border-1px-before"></span>
            </li>
            <li class="chat-content-li"
              v-for="(msg, index) in this.msgs"
              :key="`cur-${index}`"
              :class="{'text-center': msg.msgStatus === msgStatus.tip}">
              <keep-alive>
                <component
                  :is="_showItemByType(msg.msgStatus)"
                  :msg="msg"
                  @msgLongPress="showCopy"
                  @onClickImgMsg="onClickImgMsg"
                  @handleReConnectToOnlineChat="handleReConnectToOnlineChat"
                  @clickHotQues="chatInputCommit"
                  @onLineCancelQueue="onLineCancelQueue"
                  @toLeaveMsg="toLeaveMsg"
                  @resendMsgs="resendMsgs"
                  @targetLink="targetLink"
                ></component>
              </keep-alive>
            </li>
            <!--@click="$router-->
            <!--<li class="chat-content-li" @click="toLeaveMsg">请留言</li>-->
            <li class="chat-content-block chat-content-end" :class="{'bot-assess': isBotAssessShow}" ref="chatContentEnd"></li>
          </ul>
        </div>
        <fload-button
          ref="floadButton"
          :barStatus="inputBarOpen || extendBarOpen"
          @enterOnLineLineUp="enterOnLineLineUp"
          @onLineCancelQueue="onLineCancelQueue"
        ></fload-button>
        <!-- @enterVideoLineUp="confirmToLineUp" -->
        <transition name="fade" mode="out-in">
          <float-bot-assess
            v-if="isBotAssessShow"
            @targetBotAssess="targetBotAssess"
          ></float-bot-assess>
        </transition>
      </div>
      <input-bar
        ref="inputBar"
        :isFocus="inputBarOpen"
        :expressBarShow="$refs.extendBar && $refs.extendBar.expressSectionShow"
        :class="{'inputFocus': inputBarOpen}"
        @targetInputBuffer="targetInputBuffer"
        @chatInputChange="chatInputChange"
        @chatInputCommit="chatInputCommit"
        @toggleExtend="toggleExtendBar"
      ></input-bar>
    </div>
    <extend-bar
      ref="extendBar"
      @selectEmojiWithCode="selectEmojiWithCode"
      @sendSectionShow="extendBarLaunchOpen = true"
      @deleteBtn="onDeleteBtnClick"
      @sendImg="sendImgMsgClick"
      @sendGift="sendGiftMsgClick"
      @sendXiaoHua="sendXiaoHuaExpress"
    ></extend-bar>
    <!-- 长按 复制 -->
    <div class="copy"
      ref="copyBtn"
      :style="copyButtonRect"
      @click="clickCopyBtn">
      <span class="text">复制</span>
    </div>
    <!-- <div class="copyMask" v-show="isCopyButtonShow" @touchstart="resetCopyBtn"></div> -->
    <div v-transfer-dom>
      <previewer :list="previewImgList" ref="previewer" :options="previewImgOptions"></previewer>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import BScroll from 'better-scroll'
import Clipboard from 'clipboard'
import InputBar from '@/views/mainRoom/components/chat/input-bar'
import Tools from '@/common/js/tools'
// import { formatDate } from '@/common/js/dateConfig.js'
import { loginMixin, IMMixin, sendMsgsMixin, getMsgsMixin, onLineQueueMixin } from '@/common/js/mixin'
// eslint-disable-next-line
import { TIME_5_MIN, roomStatus, queueStatus, sessionStatus, toggleBarStatus, msgStatus, msgTypes, tipTypes, dialogTypes, cardTypes } from '@/common/js/status'
import { ERR_OK, getSessionStatus } from '@/server/index.js'
import { Previewer, TransferDom } from 'vux'

export default {
  name: 'chat',
  directives: {
    TransferDom
  },
  mixins: [
    loginMixin,
    IMMixin,
    sendMsgsMixin,
    getMsgsMixin,
    onLineQueueMixin
  ],
  components: {
    /**
     * 注册组件
     */
    // HeaderBar,
    InputBar,
    Previewer,
    // Confirm,
    'MsgsItem': () => import('@/views/mainRoom/components/chat/msgs-item'),
    'TipsItem': () => import('@/views/mainRoom/components/chat/tips-item'),
    'DialogItem': () => import('@/views/mainRoom/components/chat/dialog-item'),
    'CardItem': () => import('@/views/mainRoom/components/chat/card-item'),
    'FloadButton': () => import('@/views/mainRoom/components/chat/fload-button'),
    'FloatBotAssess': () => import('@/views/mainRoom/components/chat/float-bot-assess'),
    'extendBar': () => import('@/views/mainRoom/components/chat/extend-bar'),
    'PullDown': () => import('@/views/mainRoom/components/chat/pull-down')
  },
  computed: {
    previewImgOptions() {
      const self = this
      return {
        getThumbBoundsFn(index) {
          // find thumbnail element
          let thumbnail = document.getElementById(self.curPreviewImgId)
          // get window scroll Y
          let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
          // optionally get horizontal scroll
          // get position of element relative to viewport
          let rect = thumbnail.getBoundingClientRect()
          // w = width
          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
        }
      }
    },
    previewImgList() {
      let allMsgs = this.historyMsgs.concat(this.msgs)
      let map = []
      // if (this.historyMsgs.length && this.msgs.length) {
      //   allMsgs = this.historyMsgs.concat(this.msgs)
      // }
      allMsgs.forEach(item => {
        if (item.msgStatus === msgStatus.msg && item.msgType === msgTypes.msg_img) {
          map.push({
            src: item.imgData.big || '',
            msrc: item.imgData.small || '',
            id: item.timestamp
          })
        }
      })
      return map
    },
    copyButtonRect() {
      const self = this
      const pos = {
        top: self.targetEleRect.top - 50 - self.scrollY,
        left: self.targetEleRect.left + self.targetEleRect.width / 2 - 30
      }
      return `transform: translate(${pos.left}px, ${pos.top}px); opacity: ${self.isCopyButtonShow ? 1 : 0};`
    },
    ...mapGetters([
      'userInfo',
      'botInfo',
      'msgs',
      'roomMode',
      'roomId',
      'extendBarOpen',
      'inputBarOpen'
    ])
  },
  data() {
    return {
      clipboard: null,
      scrollY: 0,
      inputEle: null,
      inputFocPos: 0,
      inputBarTimer: null,
      // inputObserver: null,
      extendBarLaunchOpen: false,
      msgStatus: msgStatus,
      translateX: 0,
      /* pull-down-load */
      pullDownInitTop: -50,
      beforePullDown: true,
      isRebounding: false,
      isPullingDown: false,
      pullDownStyle: '',
      bubbleY: 0,
      /* pull-down-load  over */
      curPreviewImgId: '',
      isCopyButtonShow: false,
      copyTextTemp: '',
      // 长按对话dom的位置信息
      targetEleRect: {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
      isBotAssessShow: false
    }
  },
  mounted() {
    const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')

    if (enterVideoStatus === 'iOS-Safari' && this.roomMode !== roomStatus.videoChat) { // Safari 环境，只允许进入视频
      this.$emit('iOSVideoFailed')
      return
    }

    this.$nextTick(async() => {
      this.inputEle = this.$refs.inputBar.$refs.inputContent
      // 初始化滚动
      this._initScroll()
      this._initPullDownRefresh()
      await this._initChat()
      this.chatScroll.refresh()
      this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 0)
    })
  },
  activated() {
    this.$nextTick(() => {
      this.chatScroll.refresh()
    })
  },
  methods: {
    async _initChat() {
      const query = this.$route.query

      // 漫游消息初始化分页
      await this.saveRoamMsgs(query.origin || 'WE')
      // 加载一次缓存消息消息
      this.requestMsgsMixin()

      // 初始化时当前房间状态为视频，则跳出
      if (this.roomMode === roomStatus.videoChat) return

      // 通过 openId 获取用户基本信息
      const baseInfo = await this.getUserBaseInfo(query.openId, query.origin)
      // 通过 userId 获取用户签名
      const userSig = await this.getUserSig(query.openId, baseInfo.userId)
      // 封装用户基本信息进 vuex
      const userInfo = Object.assign(baseInfo, userSig)
      this.setUserInfo(userInfo)

      // 获取机器人基本信息，及配置机器人欢迎语
      const { botInfo, welcomeMsg } = await this.getBotBaseInfo(query.openId, this.userInfo.userId)
      this.setBotInfo(botInfo)

      // 判断是否重连
      const reConnectStatus = await this.getCurServStatus()

      if (!reConnectStatus) { // 当前无在线服务，或服务过期，不重连
        // 若无缓存则清空当前缓存
        Tools.CacheTools.removeCacheData(`${this.userInfo.origin}_curServInfo`)
        // 若无重连，则 action 创建会话
        this.initSession()
        // 若无重连，则 配置机器人欢迎语
        await this.sendMsgs(welcomeMsg)
      } else {
        await this.reConnect(reConnectStatus)
      }

      // IM 初始化
      this.initIM(userInfo)

      return 0
    },
    async getCurServStatus() {
      // 如果有会话未结束，则重连
      let data = Tools.CacheTools.getCacheData({ key: `${this.userInfo.origin}_curServInfo`, check: this.userInfo.userId, quality: TIME_5_MIN })
      if (!data) {
        // 当前无缓存
        return false
      }
      const res = await getSessionStatus(data.sessionId)
      if (res.result.code === ERR_OK) {
        return res.data.status === 'true' ? data : false
      } else {
        // 调用会话是否结束接口失败
        console.log('================> 调用会话是否结束接口失败 <================')
        return false
      }
    },
    async reConnect(data) {
      // 设置房间状态
      data.roomMode && this.setRoomMode(data.roomMode)
      // 设置坐席信息
      data.csInfo && this.setCsInfo(data.csInfo)
      // 设置会话ID
      data.sessionId && this.setSessionId(data.sessionId)
      // 设置chatGuid
      data.chatGuid && this.setChatGuid(data.chatGuid)

      this.$vux.toast.text('重连成功', 'default')
      // 手动更新用户最后活动时间（更新定时器）
      // this.updateLastAction()
      return 0
    },
    _showItemByType(type) {
      let component = ''
      switch (type) {
        case msgStatus.tip:
          component = 'TipsItem'
          break
        case msgStatus.msg:
          component = 'MsgsItem'
          break
        case msgStatus.dialog:
          component = 'DialogItem'
          break
        case msgStatus.card:
          component = 'CardItem'
          break
      }
      return component
      // return type === 'text_msg' ? 'ContentItem' : type === 'time_msg' ? 'TimeItem' : ''
    },
    onClickImgMsg(id) {
      this.curPreviewImgId = id
      let curIndex = 0
      for (let i = 0; i < this.previewImgList.length; i++) {
        if (this.previewImgList[i].id === id) {
          curIndex = i
          break
        }
      }
      this.$refs.previewer.show(curIndex)
    },
    targetLink(event) {
      if (this.roomMode === roomStatus.videoChat) {
        const e = event || window.event
        e.preventDefault()
      }
      // const target = e.target
      // // eslint-disable-next-line
      // const regUrl = /((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g
      // if (target.href && target.href.match(regUrl)) {
      //   const link = target.href.match(regUrl)[0]
      //   this.$emit('showIframe', {
      //     link
      //     // clientX: e.clientX,
      //     // clientY: e.clientY
      //   })
      // }
      // return false
    },
    // 点击重连坐席
    handleReConnectToOnlineChat() {
      this.$refs.floadButton.$refs.enterMenChat.click()
    },
    // 进入留言
    toLeaveMsg() {
      this.$router.push({
        path: '/room/leaveMessage',
        query: {openId: this.$route.query.openId}
      })
    },

    /* *********************************** better scroll *********************************** */
    _initScroll() {
      if (this.$refs.chatContent) {
        this.$refs.chatContent.style.minHeight = `${Tools.RectTools.getRect(this.$refs.chatScroll).height + 1}px`
      }
      this.chatScroll = new BScroll(this.$refs.chatScroll, {
        click: true,
        // autoBlur: false,
        probeType: 3,
        swipeBounceTime: 300,
        bounceTime: 400,
        bindToWrapper: true,
        pullDownRefresh: {
          threshold: 80,
          stop: 50
        }
        // scrollbar: {
        //   fade: true,
        //   interactive: false // 1.8.0 新增
        // }
      })
      this.chatScroll.on('touchEnd', () => {
        if (this.inputBarOpen) {
          this.setInputBar(false)
          this._inputBlur()
        } else if (this.extendBarOpen) {
          this.setExtendBar(false)
          this.resetExtendBar()
          // this.toggleExtendBar()
        }
      }, this)
    },
    forceUpdate() {
      if (this.isPullingDown) {
        this.isPullingDown = false
        this._reboundPullDown().then(() => {
          this._afterPullDown()
        })
      }
    },
    _initPullDownRefresh() {
      this.chatScroll.on('pullingDown', async() => {
        this.beforePullDown = false
        this.isPullingDown = true
        // this.$emit('pullingDown')
        await this.pullingDown()
        await this._reboundPullDown()
        this._afterPullDown()
        // this.forceUpdate()
      })
      this.chatScroll.on('scroll', (pos) => {
        if (this.beforePullDown) {
          this.bubbleY = Math.max(0, pos.y + this.pullDownInitTop)
          this.pullDownStyle = `transform: translateY(${Math.min(pos.y + this.pullDownInitTop, 10)}px)`
          // this.pullDownStyle = `top: ${Math.min(pos.y + this.pullDownInitTop, 10)}px`
        } else {
          this.bubbleY = 0
        }
        if (this.isRebounding) {
          this.pullDownStyle = `transform: translateY(${10 - (this.chatScroll.options.pullDownRefresh.stop - pos.y)}px)`
          // this.pullDownStyle = `top: ${10 - (this.chatScroll.options.pullDownRefresh.stop - pos.y)}px`
        }
        this.scrollY = Math.abs(Math.round(pos.y))
        // console.log(this.scrollY)
        this.isCopyButtonShow && this.resetCopyBtn()
      })
    },
    pullingDown() {
      this.requestMsgsMixin()
    },
    _reboundPullDown() {
      const stopTime = 600
      return new Promise((resolve) => {
        setTimeout(() => {
          this.isRebounding = true
          this.isPullingDown = false
          resolve()
        }, stopTime)
      })
    },
    _afterPullDown() {
      setTimeout(() => {
        this.pullDownStyle = `transform: translateY(${this.pullDownInitTop}px)`
        // this.pullDownStyle = `top: ${this.pullDownInitTop}px`
        this.beforePullDown = true
        this.isRebounding = false
        this.chatScroll.finishPullDown()
        this.chatScroll.refresh()
      }, this.chatScroll.options.bounceTime)
    },
    /* *********************************** inputBar *********************************** */
    async targetInputBuffer() {
      if (this.inputBarOpen || this.extendBarOpen) {
        // 软键盘弹出
        this.resetExtendBar()
        // 软键盘收起
        this.toggleBar(toggleBarStatus.allFold)
        this._inputBlur()
      } else {
        // this.toggleBar(toggleBarStatus.inputBar)
        // self._inputFocus()
        // this.toggleBar(toggleBarStatus.inputBar)
        this.setInputBar(true)
        this._inputFocus()
      }
    },
    _inputFocus() {
      console.log('键盘弹出辣=========================')
      // this.$refs.inputBar.setInputEditState('true')
      // document.getElementById('input-content-hook').focus()
      // this.$refs.inputBar.setInputEditState('true')
      this.$nextTick(() => {
        document.getElementById('input-content-hook').focus()
        this.inputBarTimer = setTimeout(function() {
          document.body.scrollTop = document.body.scrollHeight
        }, 100)
      })
      // this.inputEle.focus()
      // 聊天内容滚动到最底部
      this._resolveKeyboard()
    },
    _inputBlur() {
      console.log('键盘收起辣=========================')
      // this.inputFocPos = this.$refs.inputBar.getCursortPosition(this.inputEle)
      // console.log(this.inputFocPos)
      // this.inputEle.blur()
      this.$nextTick(() => {
        document.getElementById('input-content-hook').blur()
        document.body.scrollTop = 0
        clearTimeout(this.inputBarTimer)
      })
      // this.$refs.inputBar.setInputEditState('false')
      this.chatScroll.refresh()
      this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 400)
    },
    chatInputChange(text) {
      console.log(text)
    },
    async chatInputCommit(text) {
      this.toggleBar(toggleBarStatus.allFold)
      this.resetExtendBar()
      this._inputBlur()
      this.inputEle.innerText = ''
      text = text.replace(/<\/?.+?>/g, '').replace(/&nbsp;/g, '')
      text = Tools.strWithLink(text)

      if (text && text.trim()) {
        // this.roomMode === roomStatus.AIChat ? await this.sendTextMsgToBot(text) : await this.sendC2CMsgs(text)
        if (this.roomMode === roomStatus.AIChat) {
          await this.sendTextMsgToBot(text)
          if (!this.isBotAssessShow) {
            this.isBotAssessShow = true
          }
        } else {
          await this.sendC2CMsgs(text)
          if (this.isBotAssessShow) {
            this.isBotAssessShow = false
          }
        }
      } else {
        this.$vux.alert.show({
          title: '消息为空'
        })
      }
      console.log(`submit ==> ${text}`)
    },
    resendMsgs(msg) {
      if (msg.chatType === sessionStatus.robot) {
        // 机器人消息
        this.sendTextMsgToBot(msg.content, msg.timestamp)
        return
      }
      switch (msg.msgType) {
        case msgTypes.msg_normal: // 普通消息
          this.sendC2CMsgs(msg.content, msg.timestamp)
          break
        case msgTypes.msg_gift: // 礼物消息
          this.sendGiftMsg(msg.giftInfo, msg.timestamp)
          break
        case msgTypes.msg_liked: // 点赞消息
          this.sendLikeMsg(msg.timestamp)
          break
        case msgTypes.msg_img: // 图片消息
          // const img = new File([msg.fileObj], msg.fileObj.name, { type: msg.fileObj.type })
          this.sendImgMsg(msg.fileObj, msg.timestamp)
          break
        case msgTypes.msg_XH_express: // 小华表情消息
          this.sendXiaoHuaExpress(msg.imgData.big, msg.timestamp)
          break
      }
    },
    resetExtendBar() {
      this.extendBarLaunchOpen = false
      this.$refs.extendBar.giftSectionShow = false
      this.$refs.extendBar.expressSectionShow = false
    },
    /* *********************************** entend bar *********************************** */
    async sendImgMsgClick(file) {
      await this.sendImgMsg(file)
      this.toggleExtendBar()
    },
    async sendGiftMsgClick(giftInfo) {
      this.$emit('showGiftAnime', giftInfo)
      await this.sendGiftMsg(giftInfo)
      this.toggleExtendBar()
    },
    toggleExtendBar() {
      if (this.extendBarOpen) {
        this.setExtendBar(false)
        this.resetExtendBar()
      } else if (this.inputBarOpen) {
        const self = this
        return new Promise((resolve) => {
          self.setInputBar(false)
          // self.$refs.inputBar.setInputEditState('false')
          Tools.AsyncTools.debounce(() => {
            resolve()
          }, 300)()
        }).then(() => {
          self._inputBlur()
          self.toggleBar(toggleBarStatus.extendBar)
        })
      } else {
        this.toggleBar(toggleBarStatus.extendBar)
      }
    },
    onDeleteBtnClick() {
      // 字符串删除
      let str = this.inputEle.innerText
      // 当前应该删除的字符所占的位数（因为含有emoji）
      const len = Tools.CharTools.isLastStrEmoji(str) ? 2 : 1
      // 返回删除后的字符
      this.inputEle.innerText = str.substring(0, str.length - len)
    },
    selectEmojiWithCode(code) {
      this.inputEle.innerHTML += code
      this.$refs.inputBar.inputText += code
    },
    // confirmToLineUp() {
    //   const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')
    //   switch (enterVideoStatus) {
    //     case 'safari':
    //       // 正常进入专属客服
    //       this.$router.push('/room/cusServ/list')
    //       break
    //     case 'Android':
    //       // 正常进入专属客服
    //       this.$router.push('/room/cusServ/list')
    //       break
    //     case 'ios-guide':
    //       // 当前为iOS的微信环境，需跳转至Safari
    //       this.$emit('showIosGuide')
    //       break
    //     case 'low-version':
    //       // 当前系统版本过低
    //       this.$emit('showLowVersion')
    //       break
    //   }
    // },
    _resolveKeyboard() {
      const device = sessionStorage.getItem('device')
      if (device === 'Android') {
        this._androidKBListen()
      } else if (device === 'iPhone') {
        this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 400)
      }
    },
    _androidKBListen() {
      const self = this
      window.onresize = function() {
        self.chatScroll.refresh()
        self.chatScroll.scrollToElement(self.$refs.chatContentEnd, 400)
        window.onresize = null
      }
    },
    /* *********************************** copy btn *********************************** */
    showCopy(el, msg) {
      // get window scroll Y
      let pageYScroll = window.pageYOffset || document.documentElement.scrollTop
      // get position of element relative to viewport
      this.targetEleRect = Tools.RectTools.getRectLimitDoc(el)
      this.targetEleRect.top += pageYScroll

      const pureText = msg.replace(/<\/?.+?>/g, '').replace(/&nbsp;/g, '')
      this.copyTextTemp = pureText
      this.isCopyButtonShow = true
    },
    clickCopyBtn() {
      if (!this.isCopyButtonShow) {
        return
      }
      const self = this
      this.clipboard = new Clipboard('.copy', {
        text: function() {
          return self.copyTextTemp
        }
      })
      this.resetCopyBtn()
    },
    resetCopyBtn() {
      this.isCopyButtonShow = false
      this.targetEleRect = {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      }
    },
    targetBotAssess(isResolved) {
      if (isResolved) {
        this.$vux.toast.text('感谢您的认可！', 'default')
      } else {
        const self = this
        const ZX_workT = this.userInfo.workTimeInfo.ZX
        // filter(item => item.callType === 'ZX')
        // let workT = {
        //   startT: ZX_workT[0].startTime,
        //   endT: ZX_workT[0].endTime
        // }
        if (Tools.DateTools.isWorkTime(ZX_workT)) {
          this.$vux.confirm.show({
            title: '非常抱歉，没能解决您的问题，小华正在学习中，为了更好地解决您的问题，您可以转接人工客服。',
            confirmText: '转人工',
            cancelText: '暂时不需要',
            onConfirm() {
              self.$refs.floadButton.$refs.enterMenChat.click()
            }
          })
        } else {
          this.$vux.confirm.show({
            title: '非常抱歉，没能解决您的问题，小华正在学习中，为了更好地解决您的问题，您可以去留言。',
            confirmText: '去留言',
            cancelText: '暂时不需要',
            onConfirm() {
              self.toLeaveMsg()
            }
          })
        }
      }
      this.isBotAssessShow = false
    },
    async onLineCancelQueue() {
      await this.cancelQueue()
      // action 删除msgs中排队状态的tips
      this.deleteTipMsg()
    },
    // 删除msgs里面对应时间戳的一条提示消息
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setBotInfo: 'SET_BOT_INFO',
      setCsInfo: 'SET_CS_INFO',
      setSessionId: 'SET_SESSION_ID',
      setChatGuid: 'SET_CHAT_GUID',
      setRoomMode: 'SET_ROOM_MODE',
      setInputBar: 'SET_INPUT_BAR',
      setExtendBar: 'SET_EXTEND_BAR'
    }),
    ...mapActions([
      'initSession',
      'toggleBar',
      'sendMsgs',
      'deleteTipMsg',
      // 'updateLastAction',
      'saveRoamMsgs'
    ])
  },
  watch: {
    msgs() {
      this.$nextTick(async() => {
        // 若当前为在线服务，则更新缓存
        // if (this.roomMode === roomStatus.menChat) {
        //   Tools.CacheTools.updateCacheData({
        //     key: 'curServInfo',
        //     msgs: this.msgs,
        //     timestamp: new Date().getTime()
        //   })
        // }
        await Tools.AsyncTools.sleep(30)
        this.chatScroll.refresh()
        this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 400)
      })
    }
  }
}
</script>

<style scoped lang="less">
@import '~@/common/style/mixin.less';
@import '~@/common/style/theme.less';

.chat {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  // background-color: @bg-normal;
  .chat-header-bar {
    position: relative;
    z-index: 50;
  }
  .chat-room {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
    &.extend-bar-open {
      // height: calc(~'100% - 29rem');
      transform: translateY(-10rem);
    }
    &.extend-bar-launch-open {
      transform: translateY(-23rem);
    }
    .chat-wrapper {
      position: relative;
      width: 100%;
      height: auto;
      // min-height: calc(~'100% - 4.6rem');
      overflow: hidden;
      // background-color: @bg-normal;
      flex: 1;
      background-image: url('/video/static/img/chat/bg.jpg');
      background-size: cover;
      background-position: center;
      // background-color: #000;
      // flex-basis: auto;
      // flex-shrink: 1;
      .chat-content {
        width: 100%;
        // min-height: 101%;
        // background-color: @bg-normal;
        ul {
          .chat-content-block {
            width: 100%;
            &.chat-content-start {
              height: 2rem;
            }
            &.chat-content-end {
              height: 0;
              &.bot-assess {
                height: 9.2rem;
              }
            }
          }
          .chat-content-li {
            position: relative;
            width: 100%;
            &.text-center {
              text-align: center;
            }
            &.history-block {
              display: flex;
              justify-content: center;
              align-items: center;
              padding-bottom: 2rem;
              .item {
                display: inline-block;
                &.line {
                  width: 20%;
                  .border-1px-before(@label-line-normal);
                }
                &.text {
                  font-size: 1.2rem;
                  padding: 0 1.2rem;
                  line-height: 1.2rem;
                  color: @label-line-normal;
                }
              }
            }
          }
        }
      }
      .fload-button {
        position: absolute;
        bottom: 1.2rem;
        right: 1.2rem;
      }
      .float-bot-assess {
        position: absolute;
        bottom: 1.2rem;
        left: 1.2rem;
      }
      .fade-enter-active, .fade-leave-active {
        // backdrop-filter: blur(2px);
        transition: all .3s;
        transition-delay: .3s;
      }
      .fade-enter, .fade-leave-to {
        opacity: 0;
        left: -18rem;
        // backdrop-filter: blur(0);
      }
    }
    .input-bar {
      // flex-basis: 0;
      // height: auto;
      // flex-shrink: 0;
      justify-content: flex-end;
    }
  }
  .extend-bar {
    position: absolute;
    left: 0;
    bottom: 0;
    width: 100%;
    height: 23rem;
    // height: 10rem;
    // background-color: @bg-normal;
    color: @text-normal;
    transition: all 0.3s;
    z-index: -1;
  }
  .copy {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 5000;
    opacity: 0;
    transition: opacity 0.2s ease-in-out;
    .text {
      display: inline-block;
      line-height: 1.3rem;
      padding: 1rem 1.3rem;
      background-color: #000;
      border-radius: .7rem;
      color: #fff;
      font-size: 1.3rem;
      &::after {
        content: '';
        display: block;
        width: 0;
        height: 0;
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        margin: auto;
        transform: translateY(100%);
        border-width: 0.8rem 0.8rem 0;
        border-style: solid;
        border-color: #000 transparent transparent;
      }
    }
  }
  // .copyMask {
  //   position: fixed;
  //   top: 0;
  //   bottom: 0;
  //   left: 0;
  //   right: 0;
  //   margin: auto;
  //   z-index: 4999;
  //   -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  // }
}
</style>
