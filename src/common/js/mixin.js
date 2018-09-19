import { mapGetters, mapMutations, mapActions } from 'vuex'
// import WebRTCRoom from '@/server/webRTCRoom'
import IM from '@/server/im'
// import webim from '@/common/js/webim'
// import WebRTCAPI from 'webRTCAPI'
import { ERR_OK, getUserInfoByOpenID, getLoginInfo, createSession, pushSystemMsg, sendMsgToBot } from '@/server/index.js'
import { shallowCopy } from '@/common/js/util'
import { formatDate } from '@/common/js/dateConfig.js'
import { queueStatus, systemMsgStatus, msgStatus, msgTypes } from '@/common/js/status'

export const loginMixin = {
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
    async loginByOpenID(openID) {
      const res = await getUserInfoByOpenID(openID)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 loginByOpenID 辣 =============================')
        return new Promise((resolve) => {
          // 存vuex userInfo
          this.setUserInfo(res.data.userInfo)
          resolve()
        })
      } else {
        console.log('error in getUserInfoByOpenID')
      }
    },
    async getUserInfo() {
      const res = await getLoginInfo(this.userInfo.userId)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 getUserInfo 辣 =============================')
        return new Promise((resolve) => {
          const info = shallowCopy(this.userInfo)
          info.accountType = res.data.accountType
          info.sdkAppID = res.data.sdkAppId
          info.userSig = res.data.userSig
          // 存vuex userInfo
          this.setUserInfo(info)
          resolve()
        })
      } else {
        console.log('error in getLoginInfo')
      }
    },
    async initSession() {
      const res = await createSession(this.userInfo.userId, this.userInfo.userName, this.userInfo.userPhone)
      if (res.result.code === ERR_OK) {
        console.log('============================= 会话创建成功 辣 =============================')
        return new Promise((resolve) => {
          // 存vuex roomId
          this.setRoomId(res.data.id)
          resolve()
        })
      } else {
        console.log('============================= 会话创建失败 辣 =============================')
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
      // this.getUserInfo(this.userInfo.userId, query, ...Func)
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
      'userInfo'
    ])
  },
  methods: {
    initRTC(room) {
      const self = this
      // eslint-disable-next-line
      this.RTC = new WebRTCAPI({
        'sdkAppId': self.userInfo.sdkAppID,
        'userId': self.userInfo.userId,
        'userSig': self.userInfo.userSig,
        'accountType': self.userInfo.accountType
      }, () => {
        this.RTC.createRoom({
          roomid: room,
          role: 'miniwhite'
        }, () => {
            console.info('ENTER RTC ROOM OK')
        }, (result) => {
          if (result) {
            console.error('ENTER RTC ROOM failed')
            // self.goHomeRouter()
          }
        })
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
    }
    // afterCreateRoom(courseInfo) {
    //   // const self = this
    //   this.setRoomId(courseInfo.roomId)
    //   // 创建房间
    //   this.RTC.createRoom({
    //     // roomid: parseInt(self.courseId, 10),
    //     roomid: courseInfo.roomId,
    //     role: 'miniwhite'
    //   }, () => {
    //       console.info('ENTER RTC ROOM OK')
    //   }, (result) => {
    //     if (result) {
    //       console.error('ENTER RTC ROOM failed')
    //       // self.goHomeRouter()
    //     }
    //   })
    // },
    // actionCreateRoom() {
    //   console.log('-> action create room')
    //   const self = this
    //   WebRTCRoom.createRoom(
    //     self.userInfo.userId,
    //     self.userInfo.selfName,
    //     self.roomName,
    //     (res) => {
    //       // 发送心跳包
    //       self.heartBeatTask = WebRTCRoom.startHeartBeat(
    //         self.userInfo.userId,
    //         res.data.roomID,
    //         () => {},
    //         () => {
    //           // self.$toast.center('心跳包超时，请重试~')
    //           console.log('心跳包超时，请重试~')
    //           // self.goHomeRouter()
    //         }
    //       )
    //       const info = {
    //         roomId: self.roomId
    //       }
    //       self.afterCreateRoom(info)
    //     },
    //     () => {
    //       // error, 返回
    //     }
    //   )
    // },
    // actionEnterRoom() {
    //   const self = this
    //   WebRTCRoom.enterRoom(
    //     self.userInfo.userId,
    //     self.userInfo.userName,
    //     self.roomId,
    //     (res) => {
    //       // 发送心跳包
    //       self.heartBeatTask = WebRTCRoom.startHeartBeat(
    //         self.userInfo.userId,
    //         self.roomId,
    //         () => {},
    //         () => {
    //           // self.$toast.center('心跳包超时，请重试~')
    //           console.log('心跳包超时，请重试~')
    //           // self.goHomeRouter()
    //         }
    //       )
    //       // 进房间
    //       self.RTC.createRoom(
    //         {
    //           // roomid: parseInt(self.courseId, 10),
    //           roomid: self.roomId,
    //           role: 'miniwhite'
    //         },
    //         () => {},
    //         (result) => {
    //           if (result) {
    //             console.error('webrtc建房失败')
    //             // self.goHomeRouter()
    //           }
    //         }
    //       )
    //     },
    //     () => {
    //       // error, 返回
    //     }
    //   )
    // },
    // ...mapMutations({
    //   setRoomId: 'SET_ROOM_ID'
    // })
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
    initIM() {
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
      return new Promise((resolve) => {
        IM.login(
          loginInfo,
          {
            'onBigGroupMsgNotify': self.onBigGroupMsgNotify,
            'onMsgNotify': self.onMsgNotify
          },
          () => {
            console.log('===============================> initIM success <===============================')
            // IM.joinGroup('12345678', self.userInfo.userId)
            resolve()
          },
          (err) => {
            alert(err.ErrorInfo)
          }
        )
      })
    },
    onBigGroupMsgNotify(msgs) {
      // debugger
      if (msgs && msgs.length > 0) {
        // alert('onBigGroupMsgNotify')
        // console.log(msgs)
        const msgsObj = IM.parseMsgs(msgs)
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
      // debugger
      if (msgs && msgs.length > 0) {
        if (msgs[0].fromAccount === 'administrator') {
          // 系统消息
          this.receiveSystemMsgs(msgs)
        } else {
          // 自定义消息
          this.receiveCustomMsgs(msgs)
        }
      }
    },
    receiveSystemMsgs(msgs) {
      const msgsObj = IM.parseMsgsInSystem(msgs).textMsgs[0]
      switch (msgsObj.code) {
        case systemMsgStatus.queuesReduce: // 人数减少

          break
        case systemMsgStatus.queuesSuccess: // 客户端排队成功
          // 存vuex csInfo / roomId / fullScreen
          const info = {
            csId: msgsObj.csId
          }
          this.setCsInfo(info)
          this.setRoomId(msgsObj.csId)
          // this.setFullScreen(true)
          // 发送系统消息，通知座席端视频接入
          const systemMsg = {
            userId: msgsObj.csId,
            msgBody: {
              data: {
                code: systemMsgStatus.requestCsEntance,
                csId: msgsObj.csId,
                userId: this.userInfo.userId,
                userName: this.userInfo.userName,
                openId: 'oKXX7wABsIulcFpdlbwUyMKGisjQ'
              },
              desc: `${this.userInfo.userName}排队成功辣`,
              ext: ''
            }
          }
          RTCSystemMsg.systemMsg(systemMsg)
          // 设置排队状态
          this.setQueueMode(queueStatus.queueSuccess)
          break
        case systemMsgStatus.requestCsEntance: // 座席端视频接入请求

          break
      }
    },
    receiveCustomMsgs(msgs) {
      const msgsObj = IM.parseMsgs(msgs).textMsgs[0]
      // 给图片信息配置时间
      if (msgsObj.time === '') {
        msgsObj.time = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
      }
      this.sendMsgs({
        msgs: msgsObj,
        scrollObj: this.chatScroll,
        endObj: this.$refs.chatContentEnd
      })
    },
    ...mapMutations({
      setQueueMode: 'SET_QUEUE_MODE',
      setCsInfo: 'SET_CS_INFO',
      setRoomId: 'SET_ROOM_ID'
      // setFullScreen: 'SET_FULL_SCREEN'
    }),
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
    sendC2CMsgs(text) {
      IM.sendNormalMsg(
        this.userInfo.userId,
        '00f29791-f5f1-4c21-b486-8b553d9e5e99',
        {
          msg: text,
          time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.selfName,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_normal
        })
      // const option = {
      //   'Peer_Account': '00f29791-f5f1-4c21-b486-8b553d9e5e99',
      //   'MaxCnt': 1,
      //   'LastMsgTime': 0,
      //   'MsgKey': ''
      // }
      // webim.getC2CHistoryMsgs(
      //   option,
      //   (resp) => {
      //       console.log(resp)
      //   }
      // )
    },
    sendTextMsg(text) {
      IM.sendNoticeMsg({
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
      IM.sendNoticeMsg({
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

export const RTCSystemMsg = {
  async systemMsg(systemMsg) {
    const res = await pushSystemMsg(systemMsg)
    if (res.result.code === ERR_OK) {
      console.log('排队完成，推送系统消息成功')
    } else {
      console.log('推送系统消息失败')
    }
  }
}
