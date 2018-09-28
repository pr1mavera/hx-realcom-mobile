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
            <li class="chat-content-li" v-for="(item, i) in this.historyMsgs" :key="`history-${i}`" :class="{'text-center': item.msgStatus === msgStatus.tip}">
              <component
                :is="_showItemByType(item.msgStatus)"
                :isSelf="item.isSelfSend"
                :name="item.nickName"
                :text="item.content"
                :imgSrc="item.imgData"
                :giftType="item.giftType"
                :types="item.msgType"
                :extend="item.msgExtend"
                :cardInfo="item.cardInfo"
                :dialogInfo="item.dialogInfo"
                @enterToMenChat="enterToMenChat"
              ></component>
            </li>
            <li class="chat-content-li" v-for="(msg, index) in this.msgs" :key="index" :class="{'text-center': msg.msgStatus === msgStatus.tip}">
              <component
                :is="_showItemByType(msg.msgStatus)"
                :isSelf="msg.isSelfSend"
                :name="msg.nickName"
                :text="msg.content"
                :imgSrc="msg.imgData"
                :giftType="msg.giftType"
                :types="msg.msgType"
                :extend="msg.msgExtend"
                :cardInfo="msg.cardInfo"
                :dialogInfo="msg.dialogInfo"
                @enterToMenChat="enterToMenChat"
              ></component>
            </li>
            <li class="chat-content-block chat-content-end" ref="chatContentEnd"></li>
          </ul>
        </div>
        <fload-button
          :barStatus="this.inputBarOpen || this.extendBarOpen"
          @enterVideoLineUp="lineUpAlert = true"
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
    ></extend-bar>
    <div v-transfer-dom>
      <confirm v-model="lineUpAlert"
        :title="'您即将转入视频客服'"
        @on-cancel="lineUpAlert = false"
        @on-confirm="confirmToLineUp"
      ></confirm>
    </div>
    <ios-guide v-if="iosGuide" @click.native="toggleGuide(false)"></ios-guide>
    <low-version v-if="lowVersion" @close="toggleUpgrade(false)"></low-version>
  </div>
</template>

<script type="text/ecmascript-6">
// import { wxConfig } from '@/server/index.js'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { Confirm, TransferDomDirective as TransferDom } from 'vux'
import BScroll from 'better-scroll'
// import HeaderBar from '@/views/mainRoom/components/chat/header-bar'
import InputBar from '@/views/mainRoom/components/chat/input-bar'
import { timeTipFormat } from '@/common/js/dateConfig'
import { debounce, shallowCopy, getRect } from '@/common/js/util'
import { loginMixin, IMMixin, sendMsgsMixin, getMsgsMixin } from '@/common/js/mixin'
import { beforeEnterVideo } from '@/common/js/beforeEnterVideo'
// eslint-disable-next-line
import { roomStatus, queueStatus, toggleBarStatus, msgStatus, msgTypes, tipTypes, dialogTypes, cardTypes } from '@/common/js/status'
// 调用拉取漫游信息的接口
// import IM from '@/server/im'
import { ERR_OK, getImgUrl, getBotInfo, syncGroupC2CMsg } from '@/server/index.js'

export default {
  directives: {
    TransferDom
  },
  mixins: [
    loginMixin,
    IMMixin,
    sendMsgsMixin,
    getMsgsMixin
  ],
  components: {
    /**
     * 注册组件
     */
    // HeaderBar,
    InputBar,
    Confirm,
    'MsgsItem': () => import('@/views/mainRoom/components/chat/msgs-item'),
    'TipsItem': () => import('@/views/mainRoom/components/chat/tips-item'),
    'DialogItem': () => import('@/views/mainRoom/components/chat/dialog-item'),
    'CardItem': () => import('@/views/mainRoom/components/chat/card-item'),
    'FloadButton': () => import('@/views/mainRoom/components/chat/fload-button'),
    'extendBar': () => import('@/views/mainRoom/components/chat/extend-bar'),
    'IosGuide': () => import('@/views/mainRoom/components/video/ios-guide'),
    'LowVersion': () => import('@/views/mainRoom/components/video/low-version'),
    // 'SendFile': () => import('@/views/mainRoom/components/chat/send-file'),
    // 'SendExpress': () => import('@/views/mainRoom/components/chat/send-express'),
    // 'SendGift': () => import('@/views/mainRoom/components/chat/send-gift'),
    'PullDown': () => import('@/views/mainRoom/components/chat/pull-down')
  },
  computed: {
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
      /**
       * [scrollY        消息显示区域滑动距离]
       * [inputEle       真实输入框元素]
       * [inputFocPos    每次键盘弹出记录的光标位置]
       * [chat           消息队列]
       */
      scrollY: 0,
      inputEle: null,
      inputFocPos: 0,
      // inputObserver: null,
      extendBarLaunchOpen: false,
      lineUpAlert: false,
      msgStatus: msgStatus,
      // historyMsgs: [],
      // historyMsgs: [
      //   {
      //     content: '',
      //     nickName: '小华',
      //     isSelfSend: false,
      //     time: '2018-03-28 15:23:18',
      //     msgStatus: msgStatus.msg,
      //     msgType: msgTypes.msg_guess,
      //     msgExtend: [
      //       {
      //         question: '常青树12345678？',
      //         answer: '1234'
      //       },
      //       {
      //         question: '常青树可以搭配什么产品?',
      //         answer: '1234'
      //       },
      //       {
      //         question: '什么事常青树？',
      //         answer: '1234'
      //       }
      //     ]
      //   },
      // ],
      // historyMsgs: [
      //   {
      //     time: '2018-03-28 08:45:19',
      //     msgStatus: msgStatus.card,
      //     msgType: cardTypes.bot_card,
      //     cardInfo: {
      //       avatar: '',
      //       nickName: '小华'
      //     }
      //   },
      //   {
      //     time: '2018-09-05 08:45:89',
      //     msgStatus: msgStatus.dialog,
      //     msgType: dialogTypes.dialog_success,
      //     dialogInfo: {
      //       avatar: '',
      //       csName: '花花',
      //       rank: '钻石'
      //     }
      //   },
      //   {
      //     time: '2018-09-05 08:46:66',
      //     msgType: dialogTypes.dialog_disconnect,
      //     msgStatus: msgStatus.dialog,
      //     dialogInfo: {
      //       disconnectTime: 5
      //     }
      //   },
      //   {
      //     nickName: '小华',
      //     content: '尊贵的客人，您好！',
      //     isSelfSend: false,
      //     time: '2018-03-28 08:45:19',
      //     msgStatus: msgStatus.msg,
      //     msgType: msgTypes.msg_normal
      //   },
      //   {
      //     nickName: '客人',
      //     content: 'hello！你好',
      //     isSelfSend: true,
      //     time: '2018-03-28 08:45:56',
      //     msgStatus: msgStatus.msg,
      //     msgType: msgTypes.msg_normal
      //   },
      //   {
      //     nickName: '小华',
      //     content: '',
      //     isSelfSend: false,
      //     time: '2018-03-28 15:23:45',
      //     msgStatus: msgStatus.msg,
      //     msgType: msgTypes.msg_no_idea
      //   },
      //   {
      //     content: '服务结束，期待与您的下次对话！',
      //     time: '2018-03-28 15:23:14',
      //     msgStatus: msgStatus.tip,
      //     msgType: tipTypes.tip_normal
      //   },
      //   {
      //     content: '',
      //     time: '2018-03-28 15:23:44',
      //     msgStatus: msgStatus.tip,
      //     msgType: tipTypes.tip_success
      //   },
      //   {
      //     content: '',
      //     time: '2018-03-28 15:23:25',
      //     msgStatus: msgStatus.tip,
      //     msgType: tipTypes.tip_fail
      //   },
      //   {
      //     content: '',
      //     time: '2018-03-28 15:23:18',
      //     msgStatus: msgStatus.tip,
      //     msgType: tipTypes.tip_line_up
      //   },
      //   {
      //     content: '',
      //     nickName: '小华',
      //     isSelfSend: false,
      //     time: '2018-03-28 15:23:18',
      //     msgStatus: msgStatus.msg,
      //     msgType: msgTypes.msg_guess,
      //     msgExtend: [
      //       '常青树12345678？',
      //       '常青树可以搭配什么产品?',
      //       '什么事常青树？'
      //     ]
      //   },
      //   {
      //     content: '小华很高兴为您服务，请点击以下问题或简要描述您的问题详细咨询',
      //     nickName: '小华',
      //     isSelfSend: false,
      //     time: '2018-03-28 15:23:18',
      //     msgStatus: msgStatus.msg,
      //     msgType: msgTypes.msg_hot,
      //     msgExtend: [
      //       '华夏保险医保通怎么选合适',
      //       '常青树可以搭配什么产品',
      //       '我应该怎么续保'
      //     ]
      //   },
      //   {
      //     nickName: '小华',
      //     content: '',
      //     isSelfSend: false,
      //     time: '2018-03-28 08:45:19',
      //     msgStatus: msgStatus.msg,
      //     msgType: msgTypes.msg_leave
      //   }
      // ],
      translateX: 0,
      iosGuide: false,
      lowVersion: false,
      /* pull-down-load */
      pullDownInitTop: -50,
      beforePullDown: true,
      isRebounding: false,
      isPullingDown: false,
      pullDownStyle: '',
      bubbleY: 0,
      /* pull-down-load  over */
      sessionList: []
    }
  },
  mounted() {
    // 初始化聊天信息
    // 真实项目中拿到对应数据之后再初始化
    // this._initChatMsgList()
    // 初始化滚动
    this.$nextTick(() => {
      this.inputEle = this.$refs.inputBar.$refs.inputContent
      this.login()
      this._initScroll()
      this._initPullDownRefresh()
    })
    // 拉取历史消息
    // this.setMsgs(this.historyMsgs)
    // 获取漫游消息
    // this.getRoamMessage()

    // const params = this.$route.params
    // params.openId = 'oKXX7wABsIulcFpdlbwUyMKGisjQ'
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
    },
    async _setBotBaseInfo() {
      const res = await getBotInfo()
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 BotInfo 辣 =============================')
        return new Promise((resolve) => {
          const info = {
            avatarUrl: getImgUrl(res.data.headUrl),
            name: res.data.name
          }
          this.setBotInfo(info)
          const botCard = {
            msgStatus: msgStatus.card,
            msgType: cardTypes.bot_card,
            cardInfo: {
              avatar: this.botInfo.avatarUrl,
              nickName: this.botInfo.name
            }
          }
          const botWelcomeMsg = {
            nickName: res.data.name,
            content: res.data.welcomeTip,
            isSelfSend: false,
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal
          }
          const botHotMsg = {
            content: res.data.hotspotDoc,
            nickName: res.data.name,
            isSelfSend: false,
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_hot,
            msgExtend: res.data.hotspotQuestions.map((item) => {
              return item.name
            })
          }
          this.sendMsgs([
            botCard,
            botWelcomeMsg,
            botHotMsg
          ])
          resolve()
        })
      } else {
        console.log('============================= getBotInfo error =============================')
      }
    },
    // async requestSessionList() {
    //   // 请求sessionList
    //   // const res =
    //   const localStorage = window.localStorage
    //   if (!sessionList) {
    //     // 当天无漫游消息，清空localStotage, 稍后拉取直接上历史消息
    //     localStorage.removeItem('msgsQueue')
    //     localStorage.removeItem('msgsQueueMap')
    //   } else {
    //     // 判断本地缓存新鲜度
    //   }
    // },
    _initChatMsgList() {
      let map = []
      let timeCache = this.historyMsgs[0].time
      let temp = {
        content: timeCache,
        time: timeCache,
        msgStatus: msgStatus.tip,
        msgType: tipTypes.tip_time
      }
      map.push(shallowCopy(temp))
      this.historyMsgs.forEach((item) => {
        if (timeTipFormat(timeCache, item.time)) {
          temp.msg = item.time
          timeCache = temp.msg
          map.push(this._shallowCopy(temp))
        }
        map.push(item)
      })
      this.historyMsgs = map
      console.log(map)
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
    /* *********************************** better scroll *********************************** */
    _initScroll() {
      if (this.$refs.chatContent) {
        this.$refs.chatContent.style.minHeight = `${getRect(this.$refs.chatScroll).height + 1}px`
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
      // this.chatScroll.on('scroll', (pos) => {
      //   this.scrollY = Math.abs(Math.round(pos.y))
      //   console.log(this.scrollY)
      // })
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
        console.log(this.scrollY)
      })
    },
    pullingDown() {
      return new Promise((resolve) => {
        const localStorage = window.localStorage
        // const map = {
        //   total: 5,
        //   cur: 5
        // }
        // localStorage.setItem('msgsQueueMap', JSON.stringify(map))
        if (!this.historyMsgs.length) {
          const tip = {
            content: '以上为历史消息',
            time: '2018-03-28 15:23:14',
            msgStatus: msgStatus.tip,
            msgType: tipTypes.tip_normal
          }
          this.historyMsgs.push(tip)
        }
        const msgsQueueMap = JSON.parse(localStorage.getItem('msgsQueueMap'))
        switch (true) {
          case !msgsQueueMap:
            // 请求历史消息
            this.requestHistoryMsgs()
            break
          case msgsQueueMap.total:
            // 当前已缓存漫游消息，直接拉取
            break
          default:
            // 按sessionList请求漫游消息
        }
        resolve()
      })
      // const option = {
      //   'Peer_Account': '00f29791-f5f1-4c21-b486-8b553d9e5e99',
      //   'MaxCnt': 5,
      //   'LastMsgTime': Math.round(new Date('2018/09/18 14:20:05').getTime() / 1000),
      //   'MsgKey': ''
      // }
      // const self = this
      // return new Promise((resolve) => {
      //   // eslint-disable-next-line
      //   webim.getC2CHistoryMsgs(
      //     option,
      //     (resp) => {
      //       let msgsObj = []
      //       resp.MsgList.forEach((item) => {
      //         msgsObj.push(IM.parseMsg(item))
      //       })
      //       self.history = msgsObj.concat(self.history)
      //       console.log(msgsObj)
      //       resolve()
      //     }
      //   )
      // })
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
    targetInputBuffer() {
      if (this.inputBarOpen) {
        // 软键盘收起
        this.toggleBar(toggleBarStatus.allFold)
        this._inputBlur()
      } else {
        // 软键盘弹出
        const self = this
        this.resetExtendBar()
        self.$refs.inputBar.setInputEditState('true')

        // this.toggleBar(toggleBarStatus.inputBar)
        // self._inputFocus()
        this.toggleBar(toggleBarStatus.inputBar).then(() => {
          self._inputFocus()
        })
      }
    },
    _inputFocus() {
      console.log('键盘弹出辣=========================')
      // this.$refs.inputBar.setInputEditState('true')
      // document.getElementById('input-content-hook').focus()

      this.inputEle.focus()
      // 聊天内容滚动到最底部
      this._resolveKeyboard()
    },
    _inputBlur() {
      console.log('键盘收起辣=========================')
      // this.inputFocPos = this.$refs.inputBar.getCursortPosition(this.inputEle)
      // console.log(this.inputFocPos)
      this.inputEle.blur()
      this.$refs.inputBar.removeInputEditState()
      this.chatScroll.refresh()
      this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 400)
    },
    chatInputChange(text) {
      console.log(text)
    },
    async chatInputCommit(text) {
      const localStorage = window.localStorage
      if (!localStorage.getItem('msgsDateCache')) {
        const date = new Date()
        localStorage.setItem('msgsDateCache', date.getDate())
      }
      this.inputEle.innerText = ''
      switch (this.roomMode) {
        case roomStatus.AIChat:
          // this.sendTextMsgToBot(text)
          await this.sendC2CMsgs(text)
          break
        case roomStatus.menChat:
          await this.sendTextMsg(text)
          break
        case roomStatus.videoChat:
          // this.sendTextMsg(text)
          await this.sendC2CMsgs(text)
          break
      }
      this.setInputBar(false)
      this._inputBlur()
      console.log(`submit ==> ${text}`)
    },
    resetExtendBar() {
      this.extendBarLaunchOpen = false
      this.$refs.extendBar.giftSectionShow = false
      this.$refs.extendBar.expressSectionShow = false
    },
    /* *********************************** change chat mode *********************************** */
    enterToMenChat() {
      const self = this
      console.log('人工客服排队')
      debounce(() => {
        self.$router.push({
          path: '/room/chat',
          query: {
            cmd: 'create',
            groupID: '12345678',
            userId: 'cust-test',
            userName: '田老师红烧肉盖饭'
          }
          // query: {
          //   cmd: 'create',
          //   userId: 'cs-test',
          //   userName: '膳当家黄焖鸡米饭'
          // }
        })
        self.readyToMenChat()
      }, 1000)()
    },
    readyToMenChat() {
      const query = this.$route.query
      this.setModeToMenChat(roomStatus.menChat)
      this.setUserInfoToEnterRoom(query, this.initIM)
    },
    toggleGuide(data) {
      this.iosGuide = data
    },
    toggleUpgrade(data) {
      this.lowVersion = data
    },
    /* *********************************** entend bar *********************************** */
    async sendImgMsgClick(file) {
      await this.sendImgMsg(file)
      this.toggleExtendBar()
    },
    async sendGiftMsgClick(type) {
      await this.sendGiftMsg(type)
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
          debounce(() => {
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
      // 删除
      console.log('我想删点东西，比如说田老师红烧肉')
    },
    selectEmojiWithCode(code) {
      let str = this.inputEle.innerText
      str = `${str.substring(0, this.inputFocPos)}${code}${str.substring(this.inputFocPos, str.length)}`
      this.inputEle.innerHTML = str
    },
    confirmToLineUp() {
      this.lineUpAlert = false
      const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')
      switch (enterVideoStatus) {
        case 'enter-video-line-up':
          // 正常进入专属客服
          this.$router.push('/room/cusServ/list')
          break
        case 'ios-guide':
          // 当前为iOS的微信环境，需跳转至Safari
          this.toggleGuide(true)
          break
        case 'low-version':
          // 当前系统版本过低
          this.toggleUpgrade(true)
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
    ...mapMutations({
      setBotInfo: 'SET_BOT_INFO',
      setModeToMenChat: 'SET_ROOM_MODE',
      setMsgs: 'SET_MSGS',
      setInputBar: 'SET_INPUT_BAR',
      setExtendBar: 'SET_EXTEND_BAR',
      setQueueMode: 'SET_QUEUE_MODE'
    }),
    ...mapActions([
      'enterToLineUp',
      'toggleBar',
      'sendMsgs'
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
  }
  // watch: {
  //   $route(newVal) {
  //     switch (newVal.query.cmd) {
  //       case 'ios-guide':
  //         this.showGuide(true)
  //         break
  //       case 'low-version':
  //         this.tipsUpgrade(true)
  //         break
  //     }
  //   }
  // }
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
      // background-image: url('/video/static/img/chat/chatBG.png');
      background-image: url('/video/static/img/chat/chatBG.png');
      background-size: cover;
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
}
</style>
