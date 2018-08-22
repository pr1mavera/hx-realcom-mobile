<template>
  <div class="chat">
    <!-- <header-bar></header-bar> -->
    <div class="chat-room transition-bezier" ref="chatRoom" :class="{'extendBarOpen': isExtendBarOpen}">
      <div class="chat-wrapper" ref="chatScroll">
        <div class="chat-content" ref="chatContent">
          <ul>
            <li class="chat-content-block chat-content-start" ref="chatContentStart"></li>
            <li class="chat-content-li" v-for="(msg, index) in this.msgs" :key="msg.time || index">
              <component
                :is="_showItemByType(msg.msgType)"
                :isSelf="msg.isSelfSend"
                :name="msg.who"
                :text="msg.content"
                :types="msg.msgType"
                @enterToMenChat="enterToMenChat"
              ></component>
              <!-- <content-msg
                :isSelf="msg.isSelfSend"
                :name="msg.who"
                :text="msg.content"
              ></content-msg> -->
            </li>
            <li class="chat-content-block chat-content-end" ref="chatContentEnd"></li>
          </ul>
        </div>
        <fload-button
          :inputStatus="inputStatus"
          @enterVideoLineUp="lineUpAlert = true"
          @ios-guide="showGuide"
        ></fload-button>
      </div>
      <input-bar
        ref="inputBar"
        :isFocus="this.inputStatus"
        :class="{'inputFocus': inputStatus}"
        @targetInputBuffer="targetInputBuffer"
        @chatInputChange="chatInputChange"
        @toggleExtend="toggleExtendBar"
      ></input-bar>
    </div>
    <extend-bar :class="{'extendBarOpen': isExtendBarOpen}"></extend-bar>
    <div class="extend-bar-launch transition-bezier" :class="{'extendBarOpen': curExtendBar.type}">
      <keep-alive>
        <component
          :inputPos="inputFocPos"
          @selectEmojiWithCode="selectEmojiWithCode"
          :is="curExtendBar.component"
        ></component>
      </keep-alive>
    </div>
    <div v-transfer-dom>
      <confirm v-model="lineUpAlert"
        :title="'您即将转入视频客服'"
        @on-cancel="lineUpAlert = false"
        @on-confirm="confirmToLineUp"
      ></confirm>
    </div>
    <ios-guide v-if="iosGuide"></ios-guide>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { Confirm, TransferDomDirective as TransferDom } from 'vux'
import BScroll from 'better-scroll'
import HeaderBar from '@/views/mainRoom/components/chat/header-bar'
import InputBar from '@/views/mainRoom/components/chat/input-bar'
import { needToReloadDate } from '@/common/js/dateConfig'
import { debounce } from '@/common/js/util'
import { setUserInfoMixin, IMMixin } from '@/common/js/mixin'

export default {
  directives: {
    TransferDom
  },
  mixins: [
    setUserInfoMixin,
    IMMixin
  ],
  components: {
    /**
     * 注册组件
     */
    HeaderBar,
    InputBar,
    Confirm,
    'ContentItem': () => import('@/views/mainRoom/components/chat/content-item'),
    'TipsItem': () => import('@/views/mainRoom/components/chat/tips-item'),
    'FloadButton': () => import('@/views/mainRoom/components/chat/fload-button'),
    'extendBar': () => import('@/views/mainRoom/components/chat/extend-bar'),
    'SendFile': () => import('@/views/mainRoom/components/chat/send-file'),
    'SendExpress': () => import('@/views/mainRoom/components/chat/send-express'),
    'SendGift': () => import('@/views/mainRoom/components/chat/send-gift'),
    'IosGuide': () => import('@/views/mainRoom/components/video/ios-guide')
  },
  computed: {
    ...mapGetters([
      'msgs',
      'extendBarOpen',
      'inputBarOpen',
      'extendBarLaunch'
    ])
  },
  data() {
    return {
      /**
       * [inputStatus    输入框焦点状态]
       * [scrollY        消息显示区域滑动距离]
       * [inputEle       真实输入框元素]
       * [inputFocPos    每次键盘弹出记录的光标位置]
       * [curExtendBar   当前弹出的额外输入内容的模式]
       * [chat           消息队列]
       */
      inputStatus: false,
      scrollY: 0,
      inputEle: null,
      inputFocPos: 0,
      // inputObserver: null,
      isExtendBarOpen: false,
      curExtendBar: {
        type: false,
        component: ''
      },
      lineUpAlert: false,
      historyMsgs: [
        {
          who: '小华',
          content: '尊贵的客人，您好！',
          isSelfSend: false,
          time: '2018-03-28 08:45:19',
          msgType: 'text_msg'
        },
        {
          who: '客人',
          content: 'hello！你好',
          isSelfSend: true,
          time: '2018-03-28 08:45:56',
          msgType: 'text_msg'
        },
        {
          who: '小华',
          content: 'text_msg_no_result',
          isSelfSend: false,
          time: '2018-03-28 15:23:45',
          msgType: 'no_result'
        }
      ],
      iosGuide: false
    }
  },
  mounted() {
    // 初始化聊天信息
    // 真实项目中拿到对应数据之后再初始化
    this._initChatMsgList()
    // 初始化滚动
    const self = this
    this.$nextTick(() => {
      this.inputEle = self.$refs.inputBar.$refs.inputContent
      this._initScroll()
    })
    // 拉取历史消息
    this.setMsgs(this.historyMsgs)
  },
  methods: {
    _initChatMsgList() {
      let map = []
      let timeCache = this.historyMsgs[0].time
      let temp = {
        content: timeCache,
        msgType: 'time_msg'
      }
      map.push(this._shallowCopy(temp))
      this.historyMsgs.forEach((item) => {
        if (needToReloadDate(timeCache, item.time)) {
          temp.msg = item.time
          timeCache = temp.msg
          map.push(this._shallowCopy(temp))
        }
        map.push(item)
      })
      this.historyMsgs = map
      console.log(map)
    },
    // 浅拷贝
    _shallowCopy(obj) {
      let newObj = {}
      for (let key in obj) {
        newObj[key] = obj[key]
      }
      return newObj
    },
    _showItemByType(type) {
      let component = ''
      switch (type) {
        case 'text_msg':
          component = 'ContentItem'
          break
        case 'time_msg':
          component = 'TipsItem'
          break
        case 'no_result':
          component = 'ContentItem'
          break
      }
      return component
      // return type === 'text_msg' ? 'ContentItem' : type === 'time_msg' ? 'TimeItem' : ''
    },
    _initScroll() {
      this.chatScroll = new BScroll(this.$refs.chatScroll, {
        click: true,
        // autoBlur: false,
        probeType: 3,
        swipeBounceTime: 200,
        bounceTime: 400,
        bindToWrapper: true
      })
      this.chatScroll.on('scroll', (pos) => {
        this.scrollY = Math.abs(Math.round(pos.y))
        console.log(this.scrollY)
      })
    },
    targetInputBuffer() {
      if (this.curExtendBar.type) {
        const self = this
        this.curExtendBar.type = false
        this.$refs.inputBar.setInputEditState('true')
        debounce(() => {
          self._inputFocus()
        }, 300)()
      } else {
        this.inputStatus === false ? this._inputFocus() : this._inputBlur()
      }
    },
    _inputFocus() {
      console.log('键盘弹出辣=========================')
      this.inputStatus = true
      this.$refs.inputBar.setInputEditState('true')
      this.inputEle.focus()
      // document.querySelector('#input-content-hook').focus()
      // document.getElementById('input-content-hook').focus()
      // 聊天内容滚动到最底部
      this._resolveKeyboard()
      // 监听聊天区域滑动，触发回调关闭软键盘，重置聊天区域高度
      this.chatScroll.once('touchEnd', () => {
        this._inputBlur()
      }, this)
    },
    _inputBlur() {
      this.inputStatus = false
      console.log('键盘收起辣=========================')
      this.inputFocPos = this.$refs.inputBar.getCursortPosition(this.inputEle)
      console.log(this.inputFocPos)
      this.inputEle.blur()
      this.$refs.inputBar.setInputEditState('false')
      this.chatScroll.refresh()
      this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 400)
    },
    chatInputChange(text, isEnter) {
      if (isEnter) {
        // 提交，清空输入框，重新计算滚动区域高度，键盘收起
        this.inputEle.innerText = ''
        this.sendTextMsg(text)
        this._inputBlur()
        console.log(`submit ==> ${text}`)
      } else {
        console.log(text)
      }
    },
    enterToMenChat() {
      const self = this
      console.log('人工客服排队')
      debounce(() => {
        self.$router.push({
          path: '/room/chat',
          query: {
            cmd: 'create',
            groupID: '12345678',
            userID: 'cust-test',
            userName: '田老师红烧肉盖饭'
          }
          // query: {
          //   cmd: 'create',
          //   userID: 'cs-test',
          //   userName: '膳当家黄焖鸡米饭'
          // }
        })
        self.readyToMenChat()
      }, 1000)()
    },
    readyToMenChat() {
      const query = this.$route.query
      // new Promise((resolve) => {
      //   this.setUserInfoToEnterRoom(query)
      //   resolve()
      // }).then(()=> {
      //   this.initIM(query)
      // })
      this.setUserInfoToEnterRoom(query, this.initIM)
    },
    toggleExtendBar() {
      this.isExtendBarOpen = true
    },
    toggleExtend(mode) {
      if (this.inputStatus) {
        this._inputBlur()
        const self = this
        debounce(() => {
          self.curExtendBar.type = true
        }, 300)()
      } else {
        this.curExtendBar.type = true
      }
      // this.curExtendBar.type = true
      this.chatScroll.once('touchEnd', () => {
        this.curExtendBar.type = false
      }, this)
      switch (mode) {
        case 'gift':
          this.curExtendBar.component = 'SendGift'
          break
        case 'express':
          this.curExtendBar.component = 'SendExpress'
          break
        case 'file':
          this.curExtendBar.component = 'SendFile'
          break
      }
    },
    selectEmojiWithCode(code) {
      let str = this.inputEle.innerText
      str = `${str.substring(0, this.inputFocPos)}${code}${str.substring(this.inputFocPos, str.length)}`
      this.inputEle.innerHTML = str
    },
    confirmToLineUp() {
      this.lineUpAlert = false
      const self = this
      debounce(() => {
        self.enterToLineUp()
      }, 1000)()
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
      setModeToMenChat: 'SET_ROOM_MODE',
      setMsgs: 'SET_MSGS'
    }),
    ...mapActions([
      'enterToLineUp'
    ]),
    showGuide(data) {
      this.iosGuide = data
      // console.log(data)
    }
  }
}
</script>

<style lang="less">
@import '../../common/style/mixin.less';
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
    &.extendBarOpen {
      // height: calc(~'100% - 29rem');
      transform: translateY(-10rem);
    }
    .chat-wrapper {
      position: relative;
      width: 100%;
      height: auto;
      // min-height: calc(~'100% - 4.6rem');
      overflow: hidden;
      background-color: @bg-normal;
      flex: 1;
      // flex-basis: auto;
      // flex-shrink: 1;
      .chat-content {
        width: 100%;
        background-color: @bg-normal;
        ul {
          .chat-content-block {
            width: 100%;
            &.chat-content-start {
              height: 3.6rem;
            }
            &.chat-content-end {
              height: 0;
            }
          }
          .chat-content-li {
            position: relative;
            width: 100%;
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
    height: 10rem;
    background-color: @bg-normal;
    color: @text-normal;
    transition: all 0.3s;
    &.extendBarOpen {
      // height: calc(~'100% - 29rem');
      transform: translateY(-10rem);
    }
  }
  .extend-bar-launch {
    height: 24rem;
    background-color: @bg-normal;
    color: #000;
    transition: all 0.3s;
    &.extendBarOpen {
      // height: calc(~'100% - 29rem');
      transform: translateY(-24rem);
    }
  }
}
</style>
