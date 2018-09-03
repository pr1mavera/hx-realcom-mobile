import { mapGetters, mapMutations } from 'vuex'
import WebRTCRoom from '@/server/webRTCRoom'
import IM from '@/server/im'
import WebRTCAPI from 'webRTCAPI'
import { ERR_OK, getLoginInfo, pushUserMsg } from '@/server/index.js'

// import { formatDate } from '@/common/js/dateConfig.js'
// import { roomStatus, queueStatus } from '@/common/js/status'

export const setUserInfoMixin = {
  data() {
    return {
      userID: '',
      userName: '',
      roomName: ''
    }
  },
  methods: {
    async getUserInfo(data, query, ...Func) {
      const res = await getLoginInfo(data)
      if (res.code === ERR_OK) {
        console.log('getUserInfo成功')
        const info = {
          userID: res.userID,
          selfName: this.userName,
          accountType: res.accountType,
          sdkAppID: res.sdkAppID,
          userSig: res.userSig
        }
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
        this.userID = query.userID
        this.userName = query.userName
        this.roomName = query.roomName
        if (query.cmd === 'enter') {
          this.setRoomId(query.roomID)
        }
      }
      let data = {}
      data.userID = this.userID
      this.getUserInfo(data, query, ...Func)
      // WebRTCRoom.getLoginInfo(
      //   this.userID,
      //   (res) => {
      //     const info = {
      //       userID: res.data.userID,
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
        'userId': self.userInfo.userID,
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
        self.userInfo.userID,
        self.userInfo.selfName,
        self.roomName,
        (res) => {
          // 发送心跳包
          self.heartBeatTask = WebRTCRoom.startHeartBeat(
            self.userInfo.userID,
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
        self.userInfo.userID,
        self.userInfo.userName,
        self.roomId,
        (res) => {
          // 发送心跳包
          self.heartBeatTask = WebRTCRoom.startHeartBeat(
            self.userInfo.userID,
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
        identifier: self.userInfo.userID,
        identifierNick: self.userInfo.selfName,
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
          IM.joinGroup('12345678', self.userInfo.userID)
        },
        (err) => {
          alert(err.ErrorInfo)
        }
      )
    },
    onBigGroupMsgNotify(newMsgList) {
      if (newMsgList && newMsgList.length > 0) {
        alert('onBigGroupMsgNotify')
        const msgsObj = IM.parseMsgs(newMsgList)
        // msgsObj[time] = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
        let temp = this.msgs
        temp = temp.concat(msgsObj.textMsgs)
        this.setMsgs(temp)
        this.chatScroll.refresh && this.chatScroll.refresh()
        console.log(this.msgs)
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
                  identifier: this.userID
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
    sendTextMsg(text) {
      const self = this
      IM.sendRoomTextMsg({
        groupId: '12345678',
        msg: text,
        nickName: self.userInfo.selfName,
        identifier: self.userInfo.userID,
        msgType: 'text_msg'
      })
    },
    ...mapMutations({
      setMsgs: 'SET_MSGS'
    })
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
