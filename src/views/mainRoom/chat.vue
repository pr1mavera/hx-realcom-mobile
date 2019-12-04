<template>
  <div class="chat">
    <!-- <header-bar></header-bar> -->
    <div
      class="chat-room transition-bezier"
      ref="chatRoom"
      :class="[{'extend-bar-open': this.extendBarOpen, 'extend-bar-launch-open': extendBarLaunchOpen}]">
      <div class="chat-wrapper" ref="chatScroll" :style="chatBG">
        <pull-down
          :pullDownStyle="pullDownStyle"
          :isRebounding="isRebounding"
          :beforePullDown="beforePullDown"
          :isPullingDown="isPullingDown"
          :bubbleY="bubbleY"
          :pulldownResult="pulldownResult"
        ></pull-down>
        <div class="chat-content" ref="chatContent">
          <msgs-queue
            ref="msgsQueue"
            :historyMsgs="historyMsgs"
            :msgs="msgs"
            :isBotAssessShow="isBotAssessShow"
            @msgLongPress="showCopy"
            @onClickImgMsg="onClickImgMsg"
            @handleReConnectToOnlineChat="handleReConnectToOnlineChat"
            @clickHotQues="chatInputCommit"
            @onLineCancelQueue="onLineCancelQueue"
            @toLeaveMsg="toLeaveMsg"
            @resendMsgs="resendMsgs"
            @targetLink="targetLink"
          ></msgs-queue>
        </div>
        <div class="chat-content-end" ref="chatContentEnd" ></div>
        <fload-button
          ref="floadButton"
          :barStatus="inputBarOpen || extendBarOpen"
          @listenToChildEvent='showCode'
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
        @requestGiftSectionOpen="requestGiftSectionOpen"
        @requestExpressSectionOpen="requestExpressSectionOpen"
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
      <qr-code v-show="codeStatus" @close="codeStatus = false" :qrcode="transNoQrcode"></qr-code>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { formatRoamMsgs } from '@/common/js/MsgsLoader'
import BScroll from 'better-scroll'
import Clipboard from 'clipboard'
import IM from '@/server/im'
import InputBar from '@/views/mainRoom/components/chat/input-bar'
import FloadButton from '@/views/mainRoom/components/chat/fload-button'
// import ExtendBar from '@/views/mainRoom/components/chat/extend-bar'
// import PullDown from '@/views/mainRoom/components/chat/pull-down'
import Tools from '@/common/js/tools'
// import { formatDate } from '@/common/js/dateConfig.js'
import { loginMixin, IMMixin, sendMsgsMixin, getMsgsMixin, onLineQueueMixin } from '@/common/js/mixin'
// eslint-disable-next-line
import { TIME_5_MIN, roomStatus, queueStatus, sessionStatus, toggleBarStatus, msgStatus, msgTypes, tipTypes, dialogTypes, cardTypes, themeMap } from '@/common/js/status'
import { ERR_OK, getSessionStatus, getLoginState, saveVisitorRecord, getVideoMiniProgramQRcode } from '@/server/index.js'
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
    FloadButton,
    // ExtendBar,
    // PullDown,
    'msgsQueue': () => import('@/views/mainRoom/components/chat/msgs-queue'),
    // 'FloadButton': () => import('@/views/mainRoom/components/chat/fload-button'),
    'FloatBotAssess': () => import('@/views/mainRoom/components/chat/float-bot-assess'),
    'ExtendBar': () => import('@/views/mainRoom/components/chat/extend-bar'),
    'PullDown': () => import('@/views/mainRoom/components/chat/pull-down'),
    'qrCode': () => import('@/views/mainRoom/components/chat/code')
  },
  computed: {
    chatBG() {
      return this.theme && this.theme['chat-bg']
    },
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
    copyButtonRect() {
      const self = this
      const rect = this.targetEleRect
      const pos = {
        top: rect.top - 60,
        left: rect.left - 30
      }
      return `transform: translate(${pos.left}px, ${pos.top}px); opacity: ${self.isCopyButtonShow ? 1 : 0};`
    },
    previewImgList: {
      get() {
        return this.$store.state.previewImgList
      },
      set(value) {
        this.$store.commit('SET_PREVIEW_IMG_LIST', value)
      }
    },
    ...mapGetters([
      'theme',
      'userInfo',
      'botInfo',
      'msgs',
      'roomMode',
      'roomId',
      'extendBarOpen',
      'inputBarOpen',
      'sessionRamId'
    ])
  },
  data() {
    return {
      clipboard: null,
      chatScroll: {},
      scrollY: 0,
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
      // previewImgList: [],
      isCopyButtonShow: false,
      copyTextTemp: '',
      // 长按对话dom的位置信息
      targetEleRect: {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      },
      isBotAssessShow: false,
      lastMsgRecord: {
        timestramp: '',
        length: 0
      },
      codeStatus: false,
      transNoQrcode: ''
    }
  },
  mounted() {
    const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')

    if (enterVideoStatus === 'iOS-Safari' && this.roomMode !== roomStatus.videoChat) { // Safari 环境，只允许进入视频
      this.$emit('iOSVideoFailed')
      return undefined
    }
    // 初始化主题
    this._setTheme()

    this.$nextTick(async() => {
      // this.$vux.loading.show({ text: '请稍后' })
      // 初始化滚动
      this._initScroll()
      this._initPullDownRefresh()
      await this._initChat()
      // this.$vux.loading.hide()
    })

    // 断网
    window.addEventListener('offline', () => {
      this.$vux.toast.show({
        type: 'text',
        text: '哎呀，断网了 (-_-||)',
        position: 'top',
        width: '80%',
        time: 5000
      })
    }, true)

    // 联网
    window.addEventListener('online', () => {
      // alert('online')
      this.visibilityChange_cb()
    }, true)

    // 手机息屏
    window.addEventListener('visibilitychange', async() => {
      if (document.hidden) {
        // 记录离线时间
        this.lastMsgRecord = {
          timestramp: new Date().getTime(),
          length: this.msgs.length
        }
        return undefined
      }
      // alert('visibilitychange')
      await Tools.AsyncTools.sleep(2000)
      this.visibilityChange_cb()
    }, true)
  },
  activated() {
    this.$nextTick(async() => {
      await Tools.AsyncTools.sleep(1)
      this.chatScroll.refresh()
      this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 0)
    })
  },
  methods: {
    async _setTheme() {
      // 配置主题
      const themeConfig = await this.systemConfig('theme')
      const theme = themeConfig.getTheme()
      this.setTheme(theme)
    },
    async _initChat() {
      const query = this.$route.query

      // 漫游消息初始化分页
      await this.saveRoamMsgs(query.origin || 'WE')
      // 加载一次缓存消息消息
      const roamMsgs = await this.requestMsgsMixin()

      // 初始化时当前房间状态为视频，则跳出
      if (this.roomMode === roomStatus.videoChat) return

      // 通过 openId 获取用户基本信息
      const baseInfo = await this.getUserBaseInfo(query.openId, query.origin)
      // 通过 userId 获取用户签名
      const userSig = await this.getUserSig(query.openId, baseInfo.userId)
      // 封装用户基本信息进 vuex
      const userInfo = Object.assign(baseInfo, userSig)
      this.setUserInfo(userInfo)

      const setBotWelcome = async(userInfo) => {
        // 获取机器人基本信息，及配置机器人欢迎语
        const { botInfo, welcomeMsg } = await this.getBotBaseInfo(userInfo.userId, query.origin)
        this.setBotInfo(botInfo)
        // 配置机器人欢迎语
        this.setMsgs(welcomeMsg)
      }

      // 获取当前服务状态缓存
      const lastServ = Tools.CacheTools.getLastServiceData({ origin: userInfo.origin, userId: userInfo.userId })

      if (lastServ) {
        // 存在上一次服务记录
        // IM 初始化
        await this.initIM(userInfo)
        // 初始化本地缓存消息最后一条的时间
        const lastMsgT = roamMsgs.length && new Date(roamMsgs[roamMsgs.length - 1].time.replace(/-/g, '/')).getTime()
        this.lastMsgRecord.timestramp = lastMsgT || new Date().getTime()
        // 拉取离线消息
        const offlineMsgs = await this.getOfflineMsgs(+this.lastMsgRecord.timestramp, lastServ.data.csInfo.csId)(Tools.DateTools.formatDate('yyyy-MM-dd hh:mm:ss'))
        if (offlineMsgs.length) {
          offlineMsgs.forEach(item => {
            item.timestamp = item.timestamp || `${new Date(item.time).getTime()}_${Tools.randomMin2Max(1000, 9999)}`
          })
          // 映射出图片消息，存进相册列表
          const imgList = this.getAllImg(offlineMsgs)
          this.previewImgList = [...imgList, ...this.previewImgList]
          // 存消息列表
          this.sendMsgs(offlineMsgs)
          // 保存当前服务状态
          this.saveCurMsgs({ origin: this.userInfo.origin, msg: offlineMsgs })
        }

        // 查看当前坐席是否结束会话
        const res = await getSessionStatus(lastServ.data.sessionId)
        const quality = await this.systemConfig('sessionTimeOut')
        if (
          res.result.code === ERR_OK &&
          res.data.status === 'true' &&
          quality &&
          quality.compare(lastServ.timestamp)
        ) {
          // 重连
          this.reConnect(lastServ.data)
        } else {
          // 会话已结束
          // 清空当前缓存
          Tools.CacheTools.removeCacheData(`${this.userInfo.origin}_curServInfo`)
          // 设置机器人欢迎语
          setBotWelcome(this.userInfo)
        }
      }
      else {
        // 无缓存
        // IM 初始化
        this.initIM(userInfo)
        // 设置机器人欢迎语
        setBotWelcome(this.userInfo)
      }

      this.$router.replace({path: `/room/chat?openId=${userInfo.openId}&origin=${userInfo.origin}`})
      // 保存访客记录
      saveVisitorRecord(userInfo.userId, userInfo.nickName, userInfo.origin, userInfo.openId)

      return undefined
    },
    async getCurServStatus() {
      // 如果有会话未结束，则重连
      const quality = await this.systemConfig('sessionTimeOut')
      let data = Tools.CacheTools.getCacheData({ key: `${this.userInfo.origin}_curServInfo`, check: this.userInfo.userId, quality })
      if (!data) {
        // 当前无缓存
        return false
      }
      if (data === undefined) {
        // 缓存过期
        this.$vux.toast.text('上次服务已结束')
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
      // 发送重连消息
      IM.sendNormalMsg(
        this.userInfo.userId,
        data.csInfo.csId,
        {
          sessionId: data.sessionId,
          chatGuid: data.chatGuid,
          toUserName: data.csInfo.csNick,
          msg: '客户重连成功',
          time: Tools.DateTools.formatDate('yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_normal,
          chatType: roomStatus.menChat,
          MsgLifeTime: 0
        })

      return this.$vux.toast.text('重连成功', 'default')
    },
    async getIMLoginState() {
      const res = await getLoginState(this.userInfo.userId)
      if (res.result.code === ERR_OK) {
        console.log('查看用户IM登录状态：', res.data.status)
        return res.data.status === 'Online'
      } else {
        return false
      }
    },
    // 获取离线消息
    getOfflineMsgs(initTimestamp, csId = this.csInfo.csId) {
      // 递归查找离线消息
      const self = this
      return async function reqOfflineMsgs(timeTask, ...msgsTask) {
        const task = await self.getVideoAPI(self.userInfo.userId, csId, timeTask, 10)
        const msgs = formatRoamMsgs.IMMsgsparse(task.MsgList)
        // 过滤出离线时间之后的消息
        console.warn('漫游消息 ！！！过滤前', msgs)

        const offlineMsgs = msgs.filter(msg => {
          return msg.time && (new Date(msg.time.replace(/-/g, '/')).getTime() >= +initTimestamp)
        })
        console.warn('漫游消息 ！！！过滤后', offlineMsgs)
        // 若最后拿到的消息条数小于15，则一定为完整的离线消息
        return offlineMsgs.length < 10
              ? offlineMsgs.concat(msgsTask || [])
              : await reqOfflineMsgs(offlineMsgs[0].time, ...offlineMsgs) // eslint-disable-line
      }
    },
    async visibilityChange_cb() {
      // alert('重新联网！！！')
      const loginState = await this.getIMLoginState()
      // IM 重新登录
      !loginState && this.initIM(this.userInfo)

      const quality = await this.systemConfig('sessionTimeOut')
      let data = Tools.CacheTools.getCacheData({ key: `${this.userInfo.origin}_curServInfo`, check: this.userInfo.userId, quality })
      // 如果当前存在人工客服服务，查询当前服务状态，尝试重连
      if ((this.roomMode === roomStatus.menChat) && data) {
        // 拉取离线消息
        if (this.msgs.length === this.lastMsgRecord.length) {
          // 拉取离线消息
          const offlineMsgs = await this.getOfflineMsgs(this.lastMsgRecord.timestramp)(Tools.DateTools.formatDate('yyyy-MM-dd hh:mm:ss'))
          if (offlineMsgs.length) {
            offlineMsgs.forEach(item => {
              item.timestamp = item.timestamp || `${new Date(item.time).getTime()}_${Tools.randomMin2Max(1000, 9999)}`
            })
            // 映射出图片消息，存进相册列表
            const imgList = this.getAllImg(offlineMsgs)
            this.previewImgList = [...imgList, ...this.previewImgList]
            // 存消息列表
            this.sendMsgs(offlineMsgs)
            // 保存当前服务状态
            this.saveCurMsgs({ origin: this.userInfo.origin, msg: offlineMsgs })
          }
        }
        // 重连状态
        const reConnectStatus = await this.getCurServStatus()
        if (!reConnectStatus) {
          // 结束会话
          this.setServerTime('00:00')
          this.$vux.toast.text('当前人工服务已结束', 'default')
          // 清空本地localstorage
          Tools.CacheTools.removeCacheData(`${this.userInfo.origin}_curServInfo`)
          // assess
          !this.hasAssess && this.setAssessView({
            show: true,
            task: {
              csInfo: Object.assign({}, this.csInfo),
              sessionId: this.sessionId,
              chatGuid: this.chatGuid,
              mode: this.roomMode
            }
          })
          // await Tools.AsyncTools.sleep(3000)
          this.afterServerFinish(sessionStatus.onLine)
        }
      }
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
      if (!this.previewImgList.length) {
        return
      }
      this.curPreviewImgId = id
      const curIndex = this.previewImgList.findIndex(item => item.id === id)
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
        // observeDOM: false,
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
        if (this.inputBarOpen || this.extendBarOpen) {
          this.toggleBar(toggleBarStatus.allFold)
          this._inputBlur()
          this.resetExtendBar()
        }
        // if (this.inputBarOpen) {
        //   this.setInputBar(false)
        //   this._inputBlur()
        // } else if (this.extendBarOpen) {
        //   this.setExtendBar(false)
        //   this.resetExtendBar()
        //   // this.toggleExtendBar()
        // }
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
      if (!this.inputBarOpen || this.extendBarOpen) {
        this.toggleBar(toggleBarStatus.inputBar)
        this.resetExtendBar()
        this._inputFocus()
      }
    },
    _inputFocus() {
      console.log('键盘弹出辣=========================')
      this.$nextTick(() => {
        document.getElementById('input-content-hook').focus()
        this.inputBarTimer && clearTimeout(this.inputBarTimer)
        this.inputBarTimer = setTimeout(function() {
          document.body.scrollTop = document.body.scrollHeight
        }, 10)
      })
      // 聊天内容滚动到最底部
      this._resolveKeyboard()
    },
    _inputBlur() {
      console.log('键盘收起辣=========================')
      this.$nextTick(() => {
        document.getElementById('input-content-hook').blur()
        this.inputBarTimer && clearTimeout(this.inputBarTimer)
        this.inputBarTimer = setTimeout(function() {
          document.body.scrollTop = 0
        }, 10)
      })
    },
    chatInputChange(text) {
      console.log(text)
    },
    async chatInputCommit(text) {
      this.toggleBar(toggleBarStatus.allFold)
      this.resetExtendBar()
      this._inputBlur()
      this.$refs.inputBar.setInputText('')
      text = text.replace(/&nbsp;/g, '').replace(/<(?!a).*?>/g, '')
      text = Tools.strWithLink(text, this.theme['button'])

      if (text && text.trim()) {
        if (this.roomMode === roomStatus.AIChat) {
          !this.sessionId && await this.initSession()
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
        // await this.sendC2CMsgs(text)
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
    requestGiftSectionOpen() {
      this._inputBlur()
      this.toggleBar(toggleBarStatus.extendBar)
      this.$refs.extendBar.onSendGiftClick()
    },
    requestExpressSectionOpen() {
      this._inputBlur()
      this.toggleBar(toggleBarStatus.extendBar)
      this.$refs.extendBar.onSendExpressClick()
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
      let str = this.$refs.inputBar.getInputText()
      // 当前应该删除的字符所占的位数（因为含有emoji）
      const len = Tools.CharTools.isLastStrEmoji(str) ? 2 : 1
      // 返回删除后的字符
      this.$refs.inputBar.setInputText(str.substring(0, str.length - len))
    },
    selectEmojiWithCode(code) {
      const t = this.$refs.inputBar.getInputText()
      this.$refs.inputBar.setInputText(`${t}${code}`)
      this.$refs.inputBar.inputText += code
    },
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
    showCopy({ e, msg }) {
      // get position of element relative to viewport
      this.targetEleRect = Tools.RectTools.getRectLimitDoc(e)

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
    async showCode(status) {
      // this.codeStatus = status

      // 当前为关闭二维码，直接关闭
      if (status === false) return (this.codeStatus = status)

      /**
       * 生成访客二维码
       * author: pr1mavera
       * date: 2019-11-26 16:50
       */
      if (!this.transNoQrcode) {
        try {
          const res = await getVideoMiniProgramQRcode({
            headers: {
              // 签名串：appid + timestamp + 请求参数 + 私钥，用md5生成的签名串后转大写
              // 暂时享受免签待遇，后续考虑在node层实现
              // signature: xxx,
              appid: 'SPZX',
              timestamp: Date.now()
            },
            transNo: this.sessionRamId,
            origin: this.userInfo.origin,
            validPeriod: 60 * 60, // 单位：分
            ext: {},
            openId: this.userInfo.openId
          })

          debugger

          res.code === ERR_OK
            ? this.transNoQrcode = 'data:image/png;base64,' + res.qrcode
            : console.warn('Error in show qrcode: ', res.message)
        }
        catch (e) {
          console.warn('Error in show qrcode: ', e)
        }
      }

      this.codeStatus = status
    },
    async onLineCancelQueue() {
      const self = this
      this.$vux.confirm.show({
        title: '马上就要转接成功啦，确定不等了吗~~',
        onConfirm() {
          self.definiteCancelQueue()
        }
      })
    },
    definiteCancelQueue() {
      this.cancelQueue()
      // action 删除msgs中排队状态的tips
      this.deleteTipMsg()
    },
    // 删除msgs里面对应时间戳的一条提示消息
    ...mapMutations({
      setTheme: 'SET_THEME',
      setUserInfo: 'SET_USER_INFO',
      setBotInfo: 'SET_BOT_INFO',
      setCsInfo: 'SET_CS_INFO',
      setMsgs: 'SET_MSGS',
      setSessionId: 'SET_SESSION_ID',
      setChatGuid: 'SET_CHAT_GUID',
      setRoomMode: 'SET_ROOM_MODE',
      setInputBar: 'SET_INPUT_BAR',
      setExtendBar: 'SET_EXTEND_BAR'
    }),
    ...mapActions([
      'systemConfig',
      'initSession',
      'toggleBar',
      'sendMsgs',
      'deleteTipMsg',
      // 'updateLastAction',
      'saveRoamMsgs',
      'saveCurMsgs'
    ])
  },
  watch: {
    msgs() {
      this.$nextTick(async() => {
        await Tools.AsyncTools.sleep(10)
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
      .chat-content-end {
        width: 100%;
        height: 0;
      }
      .fload-button {
        position: absolute;
        top: 1.2rem;
        bottom: 1.2rem;
        right: 1.2rem;
      }
      .float-bot-assess {
        position: absolute;
        bottom: 1.2rem;
        // left: 1.2rem;
        left: 0;
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
  // .water-mark {
  //   position: absolute;
  //   top: 0;
  //   left: 0;
  //   width: 100%;
  //   height: 100%;
  //   z-index: 1000000;
  // }
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
