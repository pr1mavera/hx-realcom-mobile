<template>
  <div class="chatRoom">
    <chat-header-bar></chat-header-bar>
    <div class="chat-room" ref="chatRoom">
      <div class="chat-wrapper" ref="chatScroll">
        <div class="chat-content" ref="chatContent">
          <ul>
            <li class="chat-content-block chat-content-start" ref="chatContentStart"></li>
            <li class="chat-content-li" v-for="(item, index) in this.chat" :key="index">
              <chat-content-item
                :isSelf="item.textType === 0 ? false : true"
                :name="item.nickName"
                :text="item.msg"
              ></chat-content-item>
            </li>
            <li class="chat-content-block chat-content-end" ref="chatContentEnd"></li>
          </ul>
        </div>
        <fload-button
          :inputStatus="inputStatus"
        ></fload-button>
      </div>
      <input-bar
        ref="inputBar"
        :class="{'inputFocus': inputStatus}"
        @isInputfocus="isInputfocus"
        @chatInputChange="chatInputChange"
      ></input-bar>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import BScroll from 'better-scroll'
// import HeaderBar from '@/views/components/chat-header-bar'
// import ChatContentItem from '@/views/components/chat-content-item'
// import InputBar from '@/views/chatRoom/components/input-bar'

import { formatDate, needToReloadDate } from '@/common/js/formatDate.js'

export default {
  components: {
    'ChatHeaderBar': () => import('@/views/chatRoom/components/chat-header-bar'),
    'ChatContentItem': () => import('@/views/chatRoom/components/chat-content-item'),
    'InputBar': () => import('@/views/chatRoom/components/input-bar'),
    // InputBar,
    'FloadButton': () => import('@/views/chatRoom/components/fload-button')
  },
  data() {
    return {
      inputStatus: false,
      scrollY: 0,
      inputEle: null,
      inputObserver: null,
      chat: [
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '尊贵的客人，您好！',
          textType: 0,
          time: '2018-03-28 08:45:19',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: 'hello！你好',
          textType: 1,
          time: '2018-03-28 08:45:19',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '请问您又有什么问题了呢？',
          textType: 0,
          time: '2018-03-28 08:45:59',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: '我想要测试一条数据，一条数据你懂么',
          textType: 1,
          time: '2018-03-28 08:45:59',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '小华智力有限，好像听不太懂您的问题呢，转人工服务？',
          textType: 0,
          time: '2018-03-28 08:45:59',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '尊贵的客人，您好！',
          textType: 0,
          time: '2018-03-28 08:52:59',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: 'hello！你好',
          textType: 1,
          time: '2018-03-28 09:46:59',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '请问您又有什么问题了呢？',
          textType: 0,
          time: '2018-03-28 08:46:59',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '客人',
          msg: '我想要测试一条数据，一条数据你懂么',
          textType: 1,
          time: '2018-03-28 15:23:01',
          type: 'text_msg'
        },
        {
          groupId: '372331123',
          identifier: 'userid_web_1530869554913',
          nickName: '小华',
          msg: '小华智力有限，好像听不太懂您的问题呢，转人工服务？',
          textType: 0,
          time: '2018-03-28 15:23:45',
          type: 'text_msg'
        }
      ]
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.inputEle = document.getElementById('input-content-hook')
    })
    // 初始化聊天信息
    // 真实项目中拿到对应数据之后再初始化
    this._initChatMsgList()
    // 初始化滚动
    this._initScroll()
  },
  methods: {
    _initChatMsgList() {
      let map = []
      let timeCache = this.chat[0].time
      let temp = {
        time: timeCache,
        type: 'time_msg'
      }
      map.push(this._shallowCopy(temp))
      this.chat.forEach((item) => {
        if (needToReloadDate(timeCache, item.time)) {
          temp.time = item.time
          timeCache = temp.time
          map.push(this._shallowCopy(temp))
        }
        map.push(item)
      })
      console.log(map)
    },
    _shallowCopy(obj) {
      let newObj = {}
      for (let key in obj) {
        newObj[key] = obj[key]
      }
      return newObj
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
    // 键盘弹出或收起
    isInputfocus(val) {
      this.inputStatus = val
      if (val) {
        // 键盘弹出
        // 聊天内容滚动到最底部
        this._resolveKeyboard()

        // 定义观察者实时监听输入框状态变化，更新聊天区域高度
        // this._reloadChatContentHeight()
        const self = this
        // 监听聊天区域滑动，触发回调关闭软键盘，重置聊天区域高度
        this.chatScroll.once('touchEnd', () => {
          self.inputEle.blur()
        })
      } else {
        // 键盘收起
        // this.inputObserver.disconnect()
        // this.inputObserver = null
        this.chatScroll.refresh()
        this.chatScroll.scrollToElement(this.$refs.chatContentEnd, 400)
      }
    },
    chatInputChange(text, isEnter) {
      if (isEnter) {
        // 提交，清空输入框，重新计算滚动区域高度，键盘收起
        this.inputEle.innerText = ''
        this.inputEle.blur()
        console.log(`submit ==> ${text}`)
      } else {
        console.log(text)
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
    }
  }
}
</script>

<style lang="less">
@import '../common/style/mixin.less';

.chatRoom {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  // background-color: @bg-normal;
  .header-bar {
    position: relative;
    z-index: 50;
  }
  .chat-room {
    position: relative;
    width: 100%;
    height: calc(~'100% - 5rem');
    display: flex;
    flex-direction: column;
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
}
</style>
