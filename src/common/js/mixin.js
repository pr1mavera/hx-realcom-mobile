import { mapGetters, mapMutations, mapActions } from 'vuex'
import WebRTCRoom from '@/server/webRTCRoom'
import IM from '@/server/im'
import WebRTCAPI from 'webRTCAPI'
import { ERR_OK, getUserInfoByOpenID, getLoginInfo, pushUserMsg, sendMsgToBot } from '@/server/index.js'
import { shallowCopy } from '@/common/js/util'
import { formatDate } from '@/common/js/dateConfig.js'
import { msgStatus, msgTypes } from '@/common/js/status'

export const setUserInfoMixin = {
  data() {
    return {
      userId: '',
      userName: '',
      roomName: ''
    }
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  methods: {
    async setUserBaseProfile(openID, ...Func) {
      const res = await getUserInfoByOpenID(openID)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 UserInfoByOpenID 辣 =============================')
        await this.setUserInfo(res.data.userInfo)
        // await sleep(2000)
        Func && Func.forEach(async(fn) => {
          fn()
        })
      } else {
        console.log('error in getUserInfoByOpenID')
      }
    },
    async getUserInfo(data, query, ...Func) {
      const res = await getLoginInfo(data)
      if (res.result.code === ERR_OK) {
        console.log('getUserInfo成功')
        const info = shallowCopy(this.userInfo)
        info.accountType = res.data.accountType
        info.sdkAppID = res.data.sdkAppId
        info.userSig = res.data.userSig
        this.setUserInfo(info)
        // 执行回调
        Func && Func.forEach((fn) => {
          fn(query)
        })
      } else {
        console.log('error in getUserProfile')
      }
    },
    setUserInfoToEnterRoom(query, ...Func) {
      if (!query) {
        alert('请先登录!')
      } else if (query.cmd !== 'create' && query.cmd !== 'enter') {
        alert('发生错误，无法识别身份')
      } else {
        this.userId = query.userId
        this.userName = query.userName
        this.roomName = query.roomName
        if (query.cmd === 'enter') {
          this.setRoomId(query.roomID)
        }
      }
      this.getUserInfo(this.userInfo.userId, query, ...Func)
      // WebRTCRoom.getLoginInfo(
      //   this.userId,
      //   (res) => {
      //     const info = {
      //       userId: res.data.userId,
      //       selfName: this.userName,
      //       accountType: res.data.accountType,
      //       sdkAppID: res.data.sdkAppID,
      //       userSig: res.data.userSig
      //     }
      //     self.setUserInfo(info)
      //     // 执行回调
      //     Func && Func.forEach((fn) => {
      //       fn(query)
      //     })
      //   }
      // )
    },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setRoomId: 'SET_ROOM_ID'
    })
  }
}

export const RTCRoomMixin = {
  data() {
    return {
      RTC: null
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'roomId'
    ])
  },
  methods: {
    initRTC(query) {
      const self = this
      this.RTC = new WebRTCAPI({
        'sdkAppId': self.userInfo.sdkAppID,
        'userId': self.userInfo.userId,
        'userSig': self.userInfo.userSig,
        'accountType': self.userInfo.accountType
      }, () => {
        if (query.cmd === 'create') {
            self.actionCreateRoom(query)
        } else if (query.cmd === 'enter') {
            self.actionEnterRoom(query)
        }
      }, (error) => {
        console.error(error)
      })

      this.RTC.on('onLocalStreamAdd', (info) => {
        const videoElement = document.getElementById('localVideo')
        // const fullScreenBtn = document.getElementById('fullScreenBtn')
        if (info && info.stream) {
          videoElement.srcObject = info.stream
          videoElement.muted = true
        }
      })
      this.RTC.on('onRemoteStreamUpdate', (info) => {
        const videoElement = document.getElementById('remoteVideo')
        const videoElementMini = document.getElementById('remoteVideoMini')
        if (info && info.stream) {
          videoElement.srcObject = info.stream
          videoElementMini.srcObject = info.stream
        }
      })

      this.RTC.on('onRemoteStreamRemove', (info) => {
        const videoElement = document.getElementById(`v_${info.videoId}`)
        if (videoElement) {
          videoElement.srcObject = null
        }
        const temp = []
        // eslint-disable-next-line
        for (let i = 0; i < self.members.length; i++) {
          if (self.members[i].id !== info.videoId) {
            temp.push(self.members[i])
          }
        }
        self.members = temp
      })

      this.RTC.on('onKickOut', () => {
        console.warn('其他地方登录，被踢下线')
        // self.goHomeRouter()
      })

      this.RTC.on('onWebSocketClose', () => {
        console.warn('websocket断开')
        // self.goHomeRouter()
      })

      this.RTC.on('onRelayTimeout', () => {
        console.warn('服务器超时断开')
        // self.goHomeRouter()
      })
    },
    afterCreateRoom(courseInfo) {
      // const self = this
      this.setRoomId(courseInfo.roomId)
      // 创建房间
      this.RTC.createRoom({
        // roomid: parseInt(self.courseId, 10),
        roomid: courseInfo.roomId,
        role: 'miniwhite'
      }, () => {
          console.info('ENTER RTC ROOM OK')
      }, (result) => {
        if (result) {
          console.error('ENTER RTC ROOM failed')
          // self.goHomeRouter()
        }
      })
    },
    actionCreateRoom(query) {
      console.log('-> action create room')
      const self = this
      WebRTCRoom.createRoom(
        self.userInfo.userId,
        self.userInfo.selfName,
        self.roomName,
        (res) => {
          // 发送心跳包
          self.heartBeatTask = WebRTCRoom.startHeartBeat(
            self.userInfo.userId,
            res.data.roomID,
            () => {},
            () => {
              // self.$toast.center('心跳包超时，请重试~')
              console.log('心跳包超时，请重试~')
              // self.goHomeRouter()
            }
          )
          const info = {
            // 测试阶段默认'12345678'
            roomId: self.roomId || '12345678',
            // roomId: res.data.roomID, ///////////////////////////////////////////////////////////////
            roomName: self.roomName
          }
          self.afterCreateRoom(info)
        },
        () => {
          // error, 返回
        }
      )
    },
    actionEnterRoom(query) {
      const self = this
      WebRTCRoom.enterRoom(
        self.userInfo.userId,
        self.userInfo.userName,
        self.roomId,
        (res) => {
          // 发送心跳包
          self.heartBeatTask = WebRTCRoom.startHeartBeat(
            self.userInfo.userId,
            self.roomId,
            () => {},
            () => {
              // self.$toast.center('心跳包超时，请重试~')
              console.log('心跳包超时，请重试~')
              // self.goHomeRouter()
            }
          )
          // 进房间
          self.RTC.createRoom(
            {
              // roomid: parseInt(self.courseId, 10),
              roomid: self.roomId,
              role: 'miniwhite'
            },
            () => {},
            (result) => {
              if (result) {
                console.error('webrtc建房失败')
                // self.goHomeRouter()
              }
            }
          )
        },
        () => {
          // error, 返回
        }
      )
    },
    ...mapMutations({
      setRoomId: 'SET_ROOM_ID'
    })
  }
}

export const IMMixin = {
  computed: {
    ...mapGetters([
      'userInfo',
      'roomId',
      'msgs'
    ])
  },
  data() {
    return {

    }
  },
  methods: {
    initIM(query) {
      const self = this
      self.onMsgNotify.bind(this)
      const loginInfo = {
        sdkAppID: self.userInfo.sdkAppID,
        appIDAt3rd: self.userInfo.sdkAppID,
        identifier: self.userInfo.userId,
        identifierNick: self.userInfo.userName,
        accountType: self.userInfo.accountType,
        userSig: self.userInfo.userSig
      }
      console.debug('initIM', loginInfo)
      IM.login(
        loginInfo,
        {
          'onBigGroupMsgNotify': self.onBigGroupMsgNotify,
          'onMsgNotify': self.onMsgNotify
        },
        () => {
          console.log('===============================> initIM success <===============================')
          IM.joinGroup('12345678', self.userInfo.userId)
        },
        (err) => {
          alert(err.ErrorInfo)
        }
      )
    },
    onBigGroupMsgNotify(newMsgList) {
      if (newMsgList && newMsgList.length > 0) {
        // alert('onBigGroupMsgNotify')
        // console.log(newMsgList)
        const msgsObj = IM.parseMsgs(newMsgList)
        // 给图片信息配置时间
        if (msgsObj.textMsgs[0].time === '') {
          msgsObj.textMsgs[0].time = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
        }
        this.sendMsgs({
          msgs: msgsObj.textMsgs,
          scrollObj: this.chatScroll,
          endObj: this.$refs.chatContentEnd
        })
      }
    },
    onMsgNotify(msgs) {
      if (msgs && msgs.length > 0) {
        alert('onMsgNotify')
        const msgsObj = IM.parseMsgs(msgs)
        msgsObj.textMsgs.forEach((msg) => {
          const content = JSON.parse(msg.content)
          if (content.cmd === 'sketchpad') {
            const body = JSON.parse(content.data.msg)
            if (body.type === 'request' && body.action === 'currentBoard') {
              if (this.$refs.sketchpadCom) {
                const currentBoard = this.$refs.sketchpadCom.getCurrentBoard()
                const boardBg = this.$refs.sketchpadCom.getBoardBg() || {}
                IM.sendBoardMsg({
                  groupId: this.courseId,
                  msg: JSON.stringify({
                    action: body.action,
                    currentBoard
                    // boardBg: JSON.stringify(boardBg)
                  }),
                  nickName: this.selfName,
                  identifier: this.userId
                })
                // 如果有图片则补发图片
                const bgUrl = boardBg[currentBoard] && boardBg[currentBoard].url
                if (bgUrl) {
                  this.sendBoardBgPicMsg(currentBoard, bgUrl)
                  setTimeout(() => {
                      this.sendSwitchBoardMsg(currentBoard)
                  }, 500)
                }
              }
            }
          }
        })
      }
    },
    // ...mapMutations({
    //   setMsgs: 'SET_MSGS'
    // }),
    ...mapActions([
      'sendMsgs'
    ])
  }
}

export const sendMsgsMixin = {
  computed: {
    ...mapGetters([
      'botInfo',
      'userInfo',
      'csInfo'
    ])
  },
  methods: {
    async sendTextMsgToBot(question) {
      // 保存用户输入
      const ques = {
        nickName: this.userInfo.userName,
        content: question,
        isSelfSend: true,
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_normal
      }
      // this.setMsgs(this.msgs.concat([ques]))
      this.sendMsgs({
        msgs: [
          ques
        ],
        scrollObj: this.chatScroll,
        endObj: this.$refs.chatContentEnd
      })
      // 获取机器人返回
      var params = new URLSearchParams()
      params.append('question', question)
      params.append('sessionId', this.roomId)
      const res = await sendMsgToBot(params)
      if (res.result.code === ERR_OK) {
        // 此处将用户的输入保存至vuex
        const answer = this.botAnswerfilter(res.data.answer.data)
        // this.setMsgs(this.msgs.concat([answer]))
        this.sendMsgs({
          msgs: [
            answer
          ],
          scrollObj: this.chatScroll,
          endObj: this.$refs.chatContentEnd
        })
        console.log('============================= 我现在来请求 sendMsgToBot 辣 =============================')
      } else {
        alert('你可能不信，但是机器人崩了')
      }
    },
    botAnswerfilter(data) {
      let msg
      if (data.info.length === 1) {
        if (data.info[0].question === '如何转人工') {
          // 转人工
          msg = {
            nickName: this.botInfo.name,
            content: '',
            isSelfSend: false,
            time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_no_idea
          }
        } else {
          // normal
          msg = {
            nickName: this.botInfo.name,
            content: data.info[0].answer,
            isSelfSend: false,
            time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal
          }
        }
      } else if (data.info.length === 3) {
        // 猜问题
        msg = {
          nickName: this.botInfo.name,
          content: '',
          isSelfSend: false,
          time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_guess,
          msgExtend: [
            {
              question: data.info[0].question,
              answer: data.info[0].answer
            },
            {
              question: data.info[1].question,
              answer: data.info[1].answer
            },
            {
              question: data.info[2].question,
              answer: data.info[2].answer
            }
          ]
        }
      }
      return msg
    },
    sendTextMsg(text) {
      IM.sendRoomTextMsg({
        groupId: '12345678',
        msg: text,
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        nickName: this.userInfo.selfName,
        identifier: this.userInfo.userId,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_normal
      })
    },
    sendGiftMsg(type) {
      IM.sendRoomTextMsg({
        groupId: '12345678',
        msg: '给你送了一个礼物',
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        nickName: this.userInfo.selfName,
        identifier: this.userInfo.userId,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_gift,
        giftType: type
      })
    },
    sendImgMsg(img) {
      const info = {
        from_id: 'cust-test',
        to_id: 'cs-test',
        groupId: '12345678',
        identifier: ''
      }
      IM.uploadPic(img, info)
    },
    ...mapActions([
      'sendMsgs'
    ])
  }
}

export const RTCSystemMsgMixin = {
  methods: {
    async lineUpOkPushSystemMsg(systemMsg) {
      const res = await pushUserMsg(systemMsg)
      if (res.code === ERR_OK) {
        console.log('排队完成，推送系统消息成功')
      } else {
        console.log('推送系统消息失败')
      }
    }
  }
}
