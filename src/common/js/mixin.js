import { mapGetters, mapMutations, mapActions } from 'vuex'
import IM from '@/server/im'
// import Creator from '@/common/js/msgsLoader'
import MsgsLoader from '@/common/js/MsgsLoader'
// import WebRTCAPI from 'webRTCAPI'
import { ERR_OK, getUserInfoByOpenID, getLoginInfo, pushSystemMsg, sendMsgToBot, getSessionList, getCsAvatar, onLineQueue, getBotRoamMsgs, requestHistoryMsgs, onLineQueueCancel, chatQueueHeartBeat } from '@/server/index.js'
import Tools from '@/common/js/tools'
// import { formatDate } from '@/common/js/dateConfig.js'
import { queueStatus, sessionStatus, systemMsgStatus, msgStatus, msgTypes, tipTypes } from '@/common/js/status'

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
          res.data.userInfo.openId = this.$route.query.openId
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
          const info = Tools.CopyTools.objShallowClone(this.userInfo)
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
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      setSessionId: 'SET_SESSION_ID'
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
        this.hangUpVideo()
      })

      this.RTC.on('onKickOut', () => {
        console.warn('其他地方登录，被踢下线')
        // self.goHomeRouter()
      })

      this.RTC.on('onWebSocketClose', () => {
        console.warn('websocket断开')
        this.$vux.toast.show({
          text: '当前websocket已断开',
          position: 'top'
        })
      })

      this.RTC.on('onRelayTimeout', () => {
        console.warn('服务器超时断开')
        this.$vux.toast.show({
          text: '当前网络状况不佳，服务器超时断开',
          position: 'top'
        })
      })
    },
    quitRTC() {
      this.RTC && this.RTC.quit({}, () => {
        console.log('退出音视频房间 成功 辣')
      }, () => {
        console.error('退出音视频房间 失败 辣')
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
      'csInfo',
      'roomId',
      'sessionId',
      'msgs',
      'videoMsgs',
      'queueNum'
    ])
  },
  data() {
    return {
      // 通话开始时间
      startTimeStamp: null
    }
  },
  methods: {
    initIM() {
      // const self = this
      // self.onMsgNotify.bind(this)
      const loginInfo = {
        sdkAppID: this.userInfo.sdkAppID,
        appIDAt3rd: this.userInfo.sdkAppID,
        identifier: this.userInfo.userId,
        identifierNick: this.userInfo.userName,
        accountType: this.userInfo.accountType,
        userSig: this.userInfo.userSig
      }
      console.debug('initIM', loginInfo)
      return new Promise((resolve) => {
        IM.login(
          loginInfo,
          {
            'onBigGroupMsgNotify': this.onBigGroupMsgNotify,
            'onMsgNotify': this.onMsgNotify
          },
          () => {
            console.log('===============================> initIM success <===============================')
            // IM.joinGroup('987654321', this.userInfo.userId)
            resolve()
          },
          (err) => {
            alert(err.ErrorInfo)
          }
        )
      })
    },
    onBigGroupMsgNotify(msgs) {
      if (msgs && msgs.length > 0) {
        if (msgs[0].fromAccount !== '@TIM#SYSTEM') {
          this.receiveCustomMsgs(msgs)
        }
      }
    },
    onMsgNotify(msgs) {
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
    async receiveSystemMsgs(msgs) {
      // 处理系统消息（视频、在线）
      const msgsObj = IM.parseMsgsInSystem(msgs).textMsgs[0]
      switch (+msgsObj.code) {
        /* ******************************** 视频 ******************************** */
        // 人数减少（视频）
        case systemMsgStatus.video_queuesReduce:
          this.setQueueNum(this.queueNum - 1)
          break

        // 客户端排队成功（视频）
        case systemMsgStatus.video_queuesSuccess:
          msgsObj.queueSounce = sessionStatus.video
          RTCSystemMsg.responseVideoQueuesSuccess(msgsObj, this.userInfo, this.sessionId)
          // 存客服基本信息
          this.setCsInfo(msgsObj)
          break

        // 座席端视频接入请求（视频）
        case systemMsgStatus.video_requestCsEntance:

          break

        // 座席端会话、坐席基本信息传递（视频）
        case systemMsgStatus.video_transBaseInfo:
          const csInfomation = RTCSystemMsg.responseVideoTransBaseInfo(msgsObj)
          this.setCsInfo(csInfomation)
          this.setRoomId(csInfomation.csCode)
          this.setSessionId(msgsObj.sessionId)
          // 设置排队状态
          this.setQueueMode(queueStatus.queueSuccess)
          break

        /* ******************************** 在线 ******************************** */
        // 人数减少（在线）
        case systemMsgStatus.onLine_queuesReduce:
          this.setQueueNum(msgsObj.num || 1)
          break

        // 客户端排队成功（在线）
        case systemMsgStatus.onLine_queuesSuccess:
          msgsObj.queueSounce = sessionStatus.onLine
          RTCSystemMsg.responseVideoQueuesSuccess(msgsObj, this.userInfo, this.sessionId)
          // 存客服基本信息
          // this.setCsInfo(msgsObj)
          break

        // 座席端会话、坐席基本信息传递（在线）
        case systemMsgStatus.onLine_transBaseInfo:
          const csInfo = RTCSystemMsg.responseVideoTransBaseInfo(msgsObj)
          // action 删除msgs中排队状态的tips
          this.deleteTipMsg()
          // 设置坐席信息
          this.setCsInfo(csInfo)
          // 设置会话ID
          this.setSessionId(msgsObj.sessionId)
          // 设置排队状态
          this.setQueueMode(queueStatus.queueSuccess)
          // 排队完成
          this.queueFinishEnterRoom(sessionStatus.onLine)
          break

        // 结束会话（在线）
        case systemMsgStatus.onLine_serverFinish:
          this.setServerTime('00:00')
          this.$vux.toast.text('当前人工服务已结束', 'middle')
          await Tools.AsyncTools.sleep(3000)
          // assess
          if (!this.hasAssess) {
            this.setAssessView(true)
          } else {
            // action
            this.resetVuexOption(sessionStatus.onLine)
          }
          break
      }
    },
    receiveCustomMsgs(msgs) {
      const msgsObj = IM.parseMsgs(msgs).textMsgs[0]
      this.sendMsgs(msgsObj)
    },
    ...mapMutations({
      setQueueMode: 'SET_QUEUE_MODE',
      setCsInfo: 'SET_CS_INFO',
      setRoomId: 'SET_ROOM_ID',
      setSessionId: 'SET_SESSION_ID',
      setQueueNum: 'SET_QUEUE_NUM',
      setServerTime: 'SET_SERVER_TIME',
      setAssessView: 'SET_ASSESS_VIEW'
      // setFullScreen: 'SET_FULL_SCREEN'
    }),
    ...mapActions([
      'sendMsgs',
      'queueFinishEnterRoom',
      'resetVuexOption'
    ])
  }
}

export const sendMsgsMixin = {
  computed: {
    ...mapGetters([
      'botInfo',
      'userInfo',
      'csInfo',
      'roomId',
      'sessionId'
    ])
  },
  methods: {
    sendTextMsgToBot(question) {
      return new Promise(async(resolve) => {
        // 保存用户输入
        const ques = {
          nickName: this.userInfo.userName,
          content: question,
          isSelfSend: true,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_normal,
          chatType: sessionStatus.robot
        }
        // this.setMsgs(this.msgs.concat([ques]))
        this.sendMsgs(ques)
        // 获取机器人返回
        const res = await sendMsgToBot(question, this.sessionId, this.userInfo.userId, this.userInfo.userName)
        if (res.result.code === ERR_OK) {
          // 此处将用户的输入保存至vuex
          const data = res.data.answer.data
          data.botName = this.botInfo.botName
          data.time = Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
          const answer = Tools.MsgsFilterTools.botAnswerfilter(data)
          // this.setMsgs(this.msgs.concat([answer]))
          this.sendMsgs(answer)
          resolve()
          console.log('============================= 我现在来请求 sendMsgToBot 辣 =============================')
        } else {
          alert('你可能不信，但是机器人崩了')
        }
      })
    },
    sendC2CMsgs(text) {
      return new Promise(resolve => {
        this.afterSendC2CTextMsgs(text)
        resolve()
        IM.sendNormalMsg(
          this.userInfo.userId,
          this.csInfo.csId,
          // '123456789',
          {
            sessionId: this.sessionId,
            toUserName: this.csInfo.csName,
            msg: text,
            time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            nickName: this.userInfo.userName,
            avatar: this.csInfo.csId,
            identifier: this.userInfo.userId,
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal,
            chatType: sessionStatus.video
          })
      })
    },
    sendGiftMsg(giftInfo) {
      return new Promise(resolve => {
        this.afterSendC2CGiftMsgs(giftInfo)
        resolve()
        IM.sendNormalMsg(
          this.userInfo.userId,
          this.csInfo.csId,
          // '123456789',
          {
            sessionId: this.sessionId,
            toUserName: this.csInfo.csName,
            msg: `${this.userInfo.userName}给你送了一个礼物`,
            time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            nickName: this.userInfo.userName,
            avatar: this.csInfo.csId,
            identifier: this.userInfo.userId,
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_gift,
            chatType: sessionStatus.video,
            giftInfo,
            isMsgSync: 2
          })
      })
    },
    sendLikeMsg() {
      this.afterSendC2CLikeMsgs()
      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          toUserName: this.csInfo.csName,
          msg: `我${this.userInfo.userName}给你点赞`,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.userName,
          avatar: this.csInfo.csId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_liked,
          chatType: sessionStatus.video,
          isMsgSync: 2
        })
    },
    sendImgMsg(img) {
      return new Promise(async(resolve) => {
        const _URL = window.URL || window.webkitURL
        const imgSrc = _URL.createObjectURL(img)
        const imgData = {
          big: imgSrc,
          small: imgSrc
        }
        // 配置图片本地显示
        this.afterSendC2CImgMsgs(imgData)
        resolve()
        // IM 封装上传/发送图片
        const self = this
        const info = {
          msg: '图片消息',
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: self.userInfo.userName,
          avatar: self.csInfo.csId,
          toUserName: self.csInfo.csName,
          sessionId: self.sessionId,
          identifier: self.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_img,
          chatType: sessionStatus.video
        }
        // 上传图片
        const resp = await IM.uploadPic(img, {
          sendUserId: this.userInfo.userId,
          toUserId: this.csInfo.csId
        })
        // 发送图片
        const customMsgInfo = IM.formatImgMsgOption(resp, info)
        await IM.sendNormalMsg(this.userInfo.userId, this.csInfo.csId, customMsgInfo)
      })
    },
    afterSendC2CTextMsgs(text) {
      const self = this
      const msg = {
        nickName: self.userInfo.userName,
        avatar: self.csInfo.csId,
        content: text,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_normal,
        chatType: sessionStatus.video
      }
      this.sendMsgs(msg)
    },
    afterSendC2CGiftMsgs(giftInfo) {
      const self = this
      const msg = {
        nickName: self.userInfo.userName,
        avatar: self.csInfo.csId,
        content: `${self.userInfo.userName}给你送了一个礼物`,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_gift,
        chatType: sessionStatus.video,
        giftInfo
      }
      this.sendMsgs(msg)
    },
    afterSendC2CLikeMsgs() {
      const self = this
      const msg = {
        nickName: self.userInfo.userName,
        avatar: self.csInfo.csId,
        content: `我${self.userInfo.userName}给你点赞`,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_liked,
        chatType: sessionStatus.video
      }
      this.sendMsgs(msg)
    },
    afterSendC2CImgMsgs(imgData) {
      const self = this
      const msg = {
        nickName: self.userInfo.userName,
        avatar: self.csInfo.csId,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_img,
        chatType: sessionStatus.video,
        imgData
      }
      this.sendMsgs(msg)
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
      return 0
    } else {
      console.log('推送系统消息失败')
    }
  },

  /* 响应 客户端排队成功（视频） */
  responseVideoQueuesSuccess(msgsObj, userInfo, sessionId) {
    // 发送系统消息，通知座席端视频接入
    const sessionStorage = window.sessionStorage
    const startTime = parseInt(sessionStorage.getItem('queue_start_time'))
    const queueTimeLength = new Date().getTime() - startTime
    sessionStorage.removeItem('queue_start_time')
    let code = ''
    switch (msgsObj.queueSounce) {
      case sessionStatus.video:
        code = systemMsgStatus.video_requestCsEntance
        break
      case sessionStatus.onLine:
        code = systemMsgStatus.onLine_requestCsEntance
        break
    }
    const systemMsg = {
      userId: msgsObj.csId,
      msgBody: {
        data: {
          queueTimeLength,
          code,
          // code: systemMsgStatus.onLine_requestCsEntance,
          csId: msgsObj.csId,
          csName: msgsObj.csName || msgsObj.csId,
          userId: userInfo.userId,
          userName: userInfo.userName,
          userPhone: userInfo.userPhone,
          openId: userInfo.userId,
          orign: '官微',
          robotSessionId: sessionId
        },
        desc: `${userInfo.userName}排队成功辣`,
        ext: ''
      }
    }
    this.systemMsg(systemMsg)
  },

  /* 响应 座席端会话、坐席基本信息传递（视频） */
  responseVideoTransBaseInfo(msgsObj) {
    // 存csName & sessionId
    const csInfoTemp = {
      csId: msgsObj.csId,
      csAvatar: getCsAvatar(msgsObj.csId),
      csName: msgsObj.csName,
      likesCount: msgsObj.likesCount,
      csCode: msgsObj.csCode
    }
    return csInfoTemp
  }
}

export const getMsgsMixin = {
  data() {
    return {
      sessionList: [],
      historyMsgs: [],
      pulldownResult: '加载历史消息成功',
      MsgsLoader: null
    }
  },
  methods: {
    /* ********************************* 获取当天会话列表 ********************************* */
    async requestSessionList() {
      const res = await getSessionList(this.userInfo.userId)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 会话列表 辣 =============================')
        return new Promise((resolve) => {
          this.sessionList = res.data.sessionList
          resolve()
        })
      } else {
        console.log('error in getHistoryMsgs')
      }
    },
    // async requestMsgsMixin() {
    //   if (!this.MsgsLoader) {
    //     // 初始化
    //     let sessions = []
    //     this.sessionList.forEach(item => {
    //       if (item.chatCount) {
    //         sessions.push(Creator.createSession(item))
    //       }
    //     })
    //     let SessionList = Creator.createSessionList(sessions)
    //     this.MsgsLoader = Creator.createMsgsLoader(this.userInfo, SessionList)
    //   }
    //   const newMsgs = await this.MsgsLoader.getMsgs()
    //   if (newMsgs && newMsgs.length) {
    //     const list = this.MsgsLoader.timeTipsFormat(newMsgs)
    //     this.historyMsgs = list.concat(this.historyMsgs)
    //   } else {
    //     // 没有更多数据
    //     this.pulldownResult = '别拉了，没有更多消息了！！！'
    //   }
    // },
    async requestMsgsMixin() {
      if (!this.MsgsLoader) {
        // 初始化
        const MsgLoader = Object.create(MsgsLoader)
        this.MsgsLoader = MsgLoader.init({
          info: {
            id: this.userInfo.userId
          }, // 用户信息（必须）
          sessions: this.sessionList, // 当日会话列表（必须）
          getHistoryMsgsAPI: this.getHistoryMsgsAPI, // 查询历史消息接口（必须）
          getBotAPI: this.getBotAPI, // 查询机器人漫游消息接口（必须）
          getVideoAPI: this.getVideoAPI, // 查询IM漫游消息接口（必须）
          pageSize: 15 // 单页条数（非必须，默认为5）
        })
      }
      const newMsgs = await this.MsgsLoader.getMsgs()
      if (newMsgs && newMsgs.length) {
        const list = this.MsgsLoader.timeTipsFormat(newMsgs)
        this.historyMsgs = list.concat(this.historyMsgs)
      } else {
        // 没有更多数据
        this.pulldownResult = '别拉了，没有更多消息了！！！'
      }
    },
    /* 机器人漫游消息 */
    async getBotAPI(userId, sessionId, curPage, pageSize) {
      const res = await getBotRoamMsgs(sessionId, curPage, pageSize)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 机器人 漫游消息 辣 =============================')
        return res.data.msgList
      } else {
        console.log('error in getBotRoamMsgs')
      }
    },
    /* IM漫游消息 */
    async getVideoAPI(userId, csId, curTime, pageSize) {
      const res = await IM.getIMRoamMsgs(csId, curTime, pageSize)
      if (res && res.MsgList) {
        console.log('============================= 我现在来请求 视频坐席 漫游消息 辣 =============================')
        return res
      } else {
        console.log('error in getIMRoamMsgs')
      }
    },
    /* 历史消息 */
    async getHistoryMsgsAPI(userId, page) {
      const res = await requestHistoryMsgs(userId, page.curPage, page.pageSize)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 历史消息 辣 =============================')
        return res.data.msgList
      } else {
        console.log('error in requestHistoryMsgs')
      }
    }
  }
}

export const onLineQueueMixin = {
  data() {
    return {
      onLineQueueCsId: '',
      heart: false, // 判断心跳变量
      heartBeatTimer: 0,
      heartBeatReq: null,
      heartBeatFailCount: 0 // 心跳包超时失败次数
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'queueNum',
      'sessionId'
    ])
  },
  methods: {
    async enterOnLineLineUp() {
      // // 排队成功，直接通知坐席
      // window.sessionStorage.setItem('queue_start_time', new Date().getTime())
      // const msg = {
      //   csId: 'webchat1',
      //   queueSounce: sessionStatus.onLine
      // }
      // RTCSystemMsg.responseVideoQueuesSuccess(msg, this.userInfo, this.sessionId)
      // 在线转人工流程
      // 1. 请求排队
      const res = await this.formatOnLineQueueAPI()
      // 2. 处理
      if (res.code === ERR_OK) {
        window.sessionStorage.setItem('queue_start_time', new Date().getTime())
        this.afterQueueSuccess(res.data)
      } else {
        this.botSendLeaveMsg()
      }
    },
    async formatOnLineQueueAPI() {
      const self = this
      const option = {
        chatGuid: self.sessionId,
        customerGuid: self.userInfo.userId,
        customerImg: '',
        customerNick: self.userInfo.userName,
        identity: '3',
        insuranceType: '1',
        origin: '1',
        type: '1'
      }
      const res = await onLineQueue(option)
      const data = res.data
      if (res.result_code === '200') {
        if (data.workTIme) {
          // 发送正在转接提示
          this.enterToLineUp('正在为您转接在线客服，请稍候')
          // 排队中
          return {
            code: '0',
            data: {
              num: data.teamNum,
              csId: data.userCode || '',
              isTeam: data.team
            }
          }
        }
      } else {
        console.log('===== 排队出错 辣 =====')
        const tip = {
          content: '转接失败',
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          msgStatus: msgStatus.tip,
          msgType: tipTypes.tip_fail
        }
        this.sendMsgs(tip)
      }
      return {
        code: '1',
        data: '请留言'
      }
    },
    afterQueueSuccess(data) {
      if (!data.isTeam) {
        // 排队成功，直接通知坐席
        const msg = {
          csId: data.csId,
          queueSounce: sessionStatus.onLine
        }
        RTCSystemMsg.responseVideoQueuesSuccess(msg, this.userInfo, this.sessionId)
      } else {
        // 排队等待
        // 开启心跳
        this.startHeartBeat()
        // 设置排队人数
        this.setQueueNum(data.num)
        // 记录系统返回的默认排队坐席Id
        this.onLineQueueCsId = data.csId
        const msg = {
          content: '',
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          msgStatus: msgStatus.tip,
          msgType: tipTypes.tip_line_up,
          queueNum: this.queueNum
        }
        this.sendMsgs(msg)
        // 设置排队状态
        this.setQueueMode(queueStatus.queuing)
      }
    },
    async cancelQueue() {
      const res = await onLineQueueCancel({
        chatGuid: this.sessionId,
        customerGuid: this.userInfo.userId
      })
      if (res.result_code === '200') {
        console.info('取消排队成功')
        this.$vux.toast.text('你已经取消排队辣', 'middle')
        return 0
      } else {
        console.info('取消排队失败')
      }
    },
    startHeartBeat() {
      this.heart = true
      this.heartBeatTimer = setInterval(async() => {
        console.warn('====== 在线的 我现在请求心跳 ======')
        if (!this.heart || !this.$route.params.csId) {
          // 非常规退出 & 浏览器回退
          this.stopHeartBeat()
          return
        }
        this.heartBeatReq = await chatQueueHeartBeat(this.$route.params.csId, this.userInfo.userId)
        if (this.heartBeatReq.code === ERR_OK) {
          console.info('心跳成功')
          this.heartBeatFailCount = 0
        } else {
          this.heartBeatFailCount++
          if (this.heartBeatFailCount > 2) {
            console.error('心跳失败 辣')
          }
        }
      }, 10000)
    },
    stopHeartBeat() {
      this.heart = false
      this.heartBeatTimer = clearInterval(this.heartBeatTimer)
      if (this.heartBeatReq) {
        this.heartBeatReq = null
      }
    },
    botSendLeaveMsg() {
      const msg = {
        nickName: this.botInfo.botName,
        content: '',
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        isSelfSend: false,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_leave
      }
      this.sendMsgs(msg)
    },
    pushNormalTipMsg(content) {
      const tip = {
        content,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.tip,
        msgType: tipTypes.tip_normal
      }
      this.sendMsgs(tip)
    },
    ...mapMutations({
      setCsInfo: 'SET_CS_INFO',
      sendMsgs: 'SET_MSGS',
      setQueueMode: 'SET_QUEUE_MODE',
      setQueueNum: 'SET_QUEUE_NUM'
    }),
    ...mapActions([
      'enterToLineUp'
    ])
  }
}
