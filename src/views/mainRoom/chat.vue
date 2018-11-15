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
                ></component>
              </keep-alive>
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
                  @enterOnLineLineUp="enterOnLineLineUp"
                  @clickHotQues="chatInputCommit"
                  @onLineCancelQueue="onLineCancelQueue"
                  @toLeaveMsg="toLeaveMsg"
                ></component>
              </keep-alive>
            </li>
            <li class="chat-content-block chat-content-end" ref="chatContentEnd"></li>
          </ul>
        </div>
        <fload-button
          :barStatus="this.inputBarOpen || this.extendBarOpen"
          @enterVideoLineUp="confirmToLineUp"
          @enterOnLineLineUp="enterOnLineLineUp"
        ></fload-button>
      </div>
      <input-bar
        ref="inputBar"
        :isFocus="this.inputBarOpen"
        :class="{'inputFocus': this.inputBarOpen}"
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
import { beforeEnterVideo } from '@/common/js/beforeEnterVideo'
// eslint-disable-next-line
import { roomStatus, queueStatus, toggleBarStatus, msgStatus, msgTypes, tipTypes, dialogTypes, cardTypes } from '@/common/js/status'
import { ERR_OK, getImgUrl, getBotInfo, syncGroupC2CMsg } from '@/server/index.js'
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
      const allMsgs = this.historyMsgs.concat(this.msgs)
      let map = []
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
      sessionList: [],
      curPreviewImgId: '',
      isCopyButtonShow: false,
      copyTextTemp: '',
      // 长按对话dom的位置信息
      targetEleRect: {
        top: 0,
        left: 0,
        width: 0,
        height: 0
      }
    }
  },
  mounted() {
    // 初始化滚动
    this.$nextTick(() => {
      this.inputEle = this.$refs.inputBar.$refs.inputContent
      this.login()
      this._initScroll()
      this._initPullDownRefresh()
    })
  },
  methods: {
    async login() {
      const query = this.$route.query
      await this.loginByOpenID(query.openId)
      await this.getUserInfo()
      await this.initSession()
      await this._setBotBaseInfo()
      await this.initIM()
      beforeEnterVideo()
      this.requestSessionList()
    },
    async _setBotBaseInfo() {
      const res = await getBotInfo()
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 BotInfo 辣 =============================')
        return new Promise((resolve) => {
          const info = {
            avatarUrl: getImgUrl(res.data.headUrl),
            botName: res.data.name
          }
          this.setBotInfo(info)

          const botCard = {
            msgStatus: msgStatus.card,
            msgType: cardTypes.bot_card,
            cardInfo: {
              avatar: this.botInfo.avatarUrl,
              nickName: this.botInfo.botName
            }
          }
          this.sendMsgs(botCard)

          const botWelcomeMsg = {
            nickName: res.data.name,
            content: res.data.welcomeTip,
            isSelfSend: false,
            time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal
          }
          this.sendMsgs(botWelcomeMsg)

          const botHotMsg = {
            content: res.data.hotspotDoc,
            nickName: res.data.name,
            isSelfSend: false,
            time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_hot,
            msgExtend: res.data.hotspotQuestions.map((item) => {
              return {
                question: item.name
              }
            })
          }
          this.sendMsgs(botHotMsg)

          resolve()
        })
      } else {
        console.log('============================= getBotInfo error =============================')
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
        swipeBounceTime: 200,
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
      return new Promise((resolve) => {
        if (!this.historyMsgs.length) {
          const tip = {
            content: '以上为历史消息',
            time: '2018-03-28 15:23:14',
            msgStatus: msgStatus.tip,
            msgType: tipTypes.tip_normal
          }
          this.historyMsgs.push(tip)
        }
        this.requestMsgsMixin()
        resolve()
      })
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
      if (text && text.trim()) {
        switch (this.roomMode) {
          case roomStatus.AIChat:
            await this.sendTextMsgToBot(text)
            // await this.sendC2CMsgs(text)
            break
          case roomStatus.menChat:
            await this.sendC2CMsgs(text)
            break
          case roomStatus.videoChat:
            // this.sendTextMsg(text)
            await this.sendC2CMsgs(text)
            break
        }
      } else {
        this.$vux.alert.show({
          title: '消息为空'
        })
      }
      console.log(`submit ==> ${text}`)
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
    confirmToLineUp() {
      const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')
      switch (enterVideoStatus) {
        case 'enter-video-line-up':
          // 正常进入专属客服
          this.$router.push('/room/cusServ/list')
          break
        case 'ios-guide':
          // 当前为iOS的微信环境，需跳转至Safari
          this.$emit('showIosGuide')
          break
        case 'low-version':
          // 当前系统版本过低
          this.$emit('showLowVersion')
          break
      }
    },
    // _reloadChatContentHeight() {
    //   const self = this
    //   let config = {
    //     attributes: true,
    //     attributeFilter: ['height'],
    //     childList: true,
    //     subtree: true
    //   }
    //   const mutationCallback = (mutationsList) => {
    //     for (let mutation of mutationsList) {
    //       let type = mutation.type
    //       switch (type) {
    //       case 'childList':
    //         console.log('A child node has been added or removed.')
    //         break
    //       case 'attributes':
    //         console.log(`The ${mutation.attributeName} attribute was modified.`)
    //         self.chatScroll.refresh()
    //         break
    //       case 'subtree':
    //         console.log(`The subtree was modified.`)
    //         break
    //       default:
    //         break
    //       }
    //     }
    //   }
    //
    //   let observer = new MutationObserver(mutationCallback)
    //   observer.observe(document.querySelector(`.chat-wrapper`), config)
    //   this.inputObserver = observer
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
      this.targetEleRect = Tools.RectTools.getRectLimitDoc(el)
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
    async onLineCancelQueue(id) {
      await this.cancelQueue()
      // action 删除msgs中排队状态的tips
      this.deleteTipMsg()
    },
    // 删除msgs里面对应时间戳的一条提示消息
    ...mapMutations({
      setBotInfo: 'SET_BOT_INFO',
      setModeToMenChat: 'SET_ROOM_MODE',
      setMsgs: 'SET_MSGS',
      setInputBar: 'SET_INPUT_BAR',
      setExtendBar: 'SET_EXTEND_BAR',
      setQueueMode: 'SET_QUEUE_MODE'
    }),
    ...mapActions([
      'initSession',
      'toggleBar',
      'sendMsgs',
      'deleteTipMsg'
    ]),
    // 若ios用户 不在微信内置浏览器中打开该页面 则需要拉取漫游信息
    async getRoamMessage() {
      const device = sessionStorage.getItem('device')
      const browser = sessionStorage.getItem('browser')

      if (device === 'iPhone' && browser === 'safari') {
        // const groupID = '12345678'
        const groupID = this.$route.query.groupId
        const ReqMsgNumber = 2
        let data = {
          groupID,
          msgNum: ReqMsgNumber
        }
        const res = await syncGroupC2CMsg(data)
        // debugger
        if (res.code === ERR_OK) {
          const roamMsgList = res.data.RspMsgList
          for (var i in roamMsgList) {
            console.log('漫游消息：' + i + JSON.stringify(roamMsgList[i].MsgBody))
          }
        } else {
          console.log('error:' + res)
        }
      }
    }
  },
  watch: {
    msgs() {
      this.$nextTick(async() => {
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
      background-image: url('/static/img/chat/chatBG.png');
      background-size: cover;
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
            }
          }
          .chat-content-li {
            position: relative;
            width: 100%;
            &.text-center {
              text-align: center;
            }
          }
        }
      }
      .fload-button {
        position: absolute;
        bottom: 1.2rem;
        right: 1.2rem;
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
  .copyMask {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
    z-index: 4999;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
  }
}
</style>
