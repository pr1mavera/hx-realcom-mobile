<template>
  <div class="chat">
    <header-bar></header-bar>
    <div class="chat-room transition-bezier" ref="chatRoom" :class="{'extendBarOpen': curExtendBar.type}">
      <div class="chat-wrapper" ref="chatScroll">
        <div class="chat-content" ref="chatContent">
          <ul>
            <li class="chat-content-block chat-content-start" ref="chatContentStart"></li>
            <li class="chat-content-li" v-for="item in this.chat" :key="item.MsgTimestamp">
              <component
                :is="_showItemByType(item.type)"
                :isSelf="item.textType === 0 ? false : true"
                :name="item.nickName"
                :text="item.msg"
                :types="item.type"
              ></component>
              <!-- <content-item
                :isSelf="item.textType === 0 ? false : true"
                :name="item.nickName"
                :text="item.msg"
              ></content-item> -->
            </li>
            <li class="chat-content-block chat-content-end" ref="chatContentEnd"></li>
          </ul>
        </div>
        <fload-button
          :inputStatus="inputStatus"
          @enterVideoLineUp="lineUpAlert = true"
        ></fload-button>
      </div>
      <input-bar
        ref="inputBar"
        :isFocus="this.inputStatus"
        :class="{'inputFocus': inputStatus}"
        @targetInputBuffer="targetInputBuffer"
        @chatInputChange="chatInputChange"
        @toggleExtend="toggleExtend"
      ></input-bar>
    </div>
    <div class="extend-bar transition-bezier" :class="{'extendBarOpen': curExtendBar.type}">
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
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapActions } from 'vuex'
import { Confirm, TransferDomDirective as TransferDom } from 'vux'
import BScroll from 'better-scroll'
import HeaderBar from '@/views/mainRoom/components/chat/header-bar'
import InputBar from '@/views/mainRoom/components/chat/input-bar'
import { needToReloadDate } from '@/common/js/dateConfig'
import { debounce } from '@/common/js/util'

export default {
  directives: {
    TransferDom
  },
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
    'SendFile': () => import('@/views/mainRoom/components/chat/send-file'),
    'SendExpress': () => import('@/views/mainRoom/components/chat/send-express'),
    'SendGift': () => import('@/views/mainRoom/components/chat/send-gift')
  },
  computed: {
    ...mapGetters([

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
      curExtendBar: {
        type: false,
        component: ''
      },
      lineUpAlert: false,
      chat: [
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '尊贵的客人，您好！',
          textType: 0,
          time: '2018-03-28 08:45:19',
          type: 'text_msg',
          MsgTimestamp: '372331123'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: 'hello！你好',
          textType: 1,
          time: '2018-03-28 08:45:19',
          type: 'text_msg',
          MsgTimestamp: '3723311223'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '请问您又有什么问题了呢？',
          textType: 0,
          time: '2018-03-28 08:45:59',
          type: 'text_msg',
          MsgTimestamp: '37233112'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: '我想要测试一条数据，一条数据你懂么',
          textType: 1,
          time: '2018-03-28 08:45:59',
          type: 'text_msg',
          MsgTimestamp: '3723'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '小华智力有限，好像听不太懂您的问题呢，转人工服务？',
          textType: 0,
          time: '2018-03-28 08:45:59',
          type: 'text_msg',
          MsgTimestamp: '37233112335'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '尊贵的客人，您好！',
          textType: 0,
          time: '2018-03-28 08:52:59',
          type: 'text_msg',
          MsgTimestamp: '37233112300'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: 'hello！你好',
          textType: 1,
          time: '2018-03-28 09:46:59',
          type: 'text_msg',
          MsgTimestamp: '3723311234567'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '请问您又有什么问题了呢？',
          textType: 0,
          time: '2018-03-28 08:46:59',
          type: 'text_msg',
          MsgTimestamp: '37233112309'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: '我想要测试一条数据，一条数据你懂么',
          textType: 1,
          time: '2018-03-28 15:23:01',
          type: 'text_msg',
          MsgTimestamp: '37'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '小华智力有限，好像听不太懂您的问题呢，转人工服务？',
          textType: 0,
          time: '2018-03-28 15:23:45',
          type: 'text_msg',
          MsgTimestamp: '372331'
        }
      ]
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
  },
  methods: {
    _initChatMsgList() {
      let map = []
      let timeCache = this.chat[0].time
      let temp = {
        msg: timeCache,
        type: 'time_msg',
        MsgTimestamp: this.msg
      }
      map.push(this._shallowCopy(temp))
      this.chat.forEach((item) => {
        if (needToReloadDate(timeCache, item.time)) {
          temp.msg = item.time
          timeCache = temp.msg
          map.push(this._shallowCopy(temp))
        }
        map.push(item)
      })
      this.chat = map
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
      let item = ''
      switch (type) {
        case 'text_msg':
          item = 'ContentItem'
          break
        case 'time_msg':
          item = 'TipsItem'
          break
      }
      return item
      // return type === 'text_msg' ? 'ContentItem' : type === 'time_msg' ? 'TimeItem' : ''
    },
    _initScroll() {
      this.chatScroll = new BScroll(this.$refs.chatScroll, {
        click: true,
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
        this._inputBlur()
        console.log(`submit ==> ${text}`)
      } else {
        console.log(text)
      }
    },
    toggleExtend(mode) {
      if (this.inputStatus) {
        this._inputBlur()
        const self = this
        debounce(() => {
          self.curExtendBar.type = true
        }, 300)()
        setTimeout(function() {
          self.curExtendBar.type = true
        }, 300)
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
    ...mapActions([
      'enterToLineUp'
    ])
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
    height: calc(~'100% - 5rem');
    display: flex;
    flex-direction: column;
    transition: all 0.3s;
    &.extendBarOpen {
      // height: calc(~'100% - 29rem');
      transform: translateY(-24rem);
    }
    .chat-wrapper {
      position: relative;
      width: 100%;
      height: auto;
      overflow: hidden;
      background-color: @bg-normal;
      flex-basis: auto;
      flex-shrink: 1;
      .chat-content {
        width: 100%;
        // min-height: 100%;
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
      flex-basis: auto;
      height: auto;
      flex-shrink: 0;
    }
  }
  .extend-bar {
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
