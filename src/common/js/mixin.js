import { mapGetters, mapMutations, mapActions } from 'vuex'
import IM from '@/server/im'
import anime from 'animejs'
// import Creator from '@/common/js/msgsLoader'
import MsgsLoader from '@/common/js/MsgLoader'
// import WebRTCAPI from 'webRTCAPI'
import { ERR_OK, getUserInfoByOpenID, getLoginInfo, pushSystemMsg, sendMsgToBot, getSessionList, getCsAvatar, onLineQueue, getBotRoamMsgs, requestHistoryMsgs } from '@/server/index.js'
import { shallowCopy, botAnswerfilter } from '@/common/js/util'
import { formatDate } from '@/common/js/dateConfig.js'
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
    // async initSession() {
    //   // 机器人会话
    //   const res = await createSession(this.userInfo.userId, this.userInfo.userName, this.userInfo.userPhone, sessionStatus.robot)
    //   // const res = await createSession(this.userInfo.userId, this.userInfo.userName, this.userInfo.userPhone)
    //   if (res.result.code === ERR_OK) {
    //     console.log('============================= 会话创建成功 辣 =============================')
    //     return new Promise((resolve) => {
    //       // 存vuex roomId
    //       this.setSessionId(res.data.id)
    //       resolve()
    //     })
    //   } else {
    //     console.log('============================= 会话创建失败 辣 =============================')
    //   }
    // },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO',
      // setRoomId: 'SET_ROOM_ID',
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
        // self.goHomeRouter()
      })

      this.RTC.on('onRelayTimeout', () => {
        console.warn('服务器超时断开')
        // self.goHomeRouter()
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
      'roomId',
      'sessionId',
      'msgs',
      'videoMsgs',
      'queueNum'
    ])
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
          this.$nextTick(() => {
            const e = document.getElementById('video-msg-list-bottom-tag')
            if (this.videoMsgs.length > 3) {
              const scrollObj = {
                scrollTop: e.scrollTop
              }
              anime({
                targets: scrollObj,
                scrollTop: e.scrollHeight - e.clientHeight,
                easing: 'easeInOutQuad',
                round: 1,
                update: function() {
                  e.scrollTop = scrollObj.scrollTop
                }
              })
            }
          })
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
    receiveSystemMsgs(msgs) {
      // 处理系统消息（视频、在线）
      const msgsObj = IM.parseMsgsInSystem(msgs).textMsgs[0]
      switch (msgsObj.code) {
        case systemMsgStatus.video_queuesReduce: // 人数减少（视频）
          this.setQueueNum(this.queueNum - 1)
          break
        case systemMsgStatus.video_queuesSuccess: // 客户端排队成功（视频）
          RTCSystemMsg.responseVideoQueuesSuccess(msgsObj, this.userInfo)
          // 存客服基本信息
          this.setCsInfo(msgsObj)
          break
        case systemMsgStatus.video_requestCsEntance: // 座席端视频接入请求（视频）

          break
        case systemMsgStatus.video_transBaseInfo: // 座席端会话、坐席基本信息传递（视频）
          const csInfomation = RTCSystemMsg.responseVideoTransBaseInfo(msgsObj)
          this.setCsInfo(csInfomation)
          this.setRoomId(msgsObj.csCode)
          this.setSessionId(msgsObj.sessionId)
          // 设置排队状态
          this.setQueueMode(queueStatus.queueSuccess)
          break
      }
    },
    receiveCustomMsgs(msgs) {
      const msgsObj = IM.parseMsgs(msgs).textMsgs[0]
      this.sendMsgs([
        msgsObj
      ])
    },
    ...mapMutations({
      setQueueMode: 'SET_QUEUE_MODE',
      setCsInfo: 'SET_CS_INFO',
      setRoomId: 'SET_ROOM_ID',
      setSessionId: 'SET_SESSION_ID',
      setQueueNum: 'SET_QUEUE_NUM'
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
          time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_normal,
          chatType: sessionStatus.robot
        }
        // this.setMsgs(this.msgs.concat([ques]))
        this.sendMsgs([
          ques
        ])
        // 获取机器人返回
        const res = await sendMsgToBot(question, this.sessionId, this.userInfo.userId, this.userInfo.userName)
        if (res.result.code === ERR_OK) {
          // 此处将用户的输入保存至vuex
          const data = res.data.answer.data
          data.botName = this.botInfo.botName
          data.time = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
          const answer = botAnswerfilter(data)
          // this.setMsgs(this.msgs.concat([answer]))
          this.sendMsgs([
            answer
          ])
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
            time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            nickName: this.userInfo.userName,
            avatar: this.csInfo.csId,
            identifier: this.userInfo.userId,
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal,
            chatType: sessionStatus.video
          })
      })
    },
    // sendTextMsg(text) {
    //   return new Promise(resolve => {
    //     resolve()
    //     IM.sendNoticeMsg({
    //       sessionId: this.sessionId,
    //       toUserId: this.csInfo.csId,
    //       toUserName: this.csInfo.nickName,
    //       groupId: this.roomId,
    //       msg: text,
    //       time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    //       nickName: this.userInfo.userName,
    //       identifier: this.userInfo.userId,
    //       msgStatus: msgStatus.msg,
    //       msgType: msgTypes.msg_normal
    //     })
    //   })
    // },
    sendGiftMsg(giftInfo) {
      IM.sendNoticeMsg({
        groupId: this.roomId,
        // groupId: '987654321',
        msg: `${this.userInfo.userName}给你送了一个礼物`,
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        nickName: this.userInfo.userName,
        avatar: this.csInfo.csId,
        identifier: this.userInfo.userId,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_gift,
        chatType: sessionStatus.video,
        giftInfo
      })
    },
    sendLikeMsg() {
      IM.sendNoticeMsg({
        groupId: this.roomId,
        // groupId: '987654321',
        msg: `我${this.userInfo.userName}给你点赞`,
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        nickName: this.userInfo.userName,
        avatar: this.csInfo.csId,
        identifier: this.userInfo.userId,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_liked,
        chatType: sessionStatus.video
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
        const info = {
          msg: '图片消息',
          time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.userName,
          avatar: this.csInfo.csId,
          toUserName: this.csInfo.csName,
          sessionId: this.sessionId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_img,
          chatType: sessionStatus.video
        }
        // 上传图片
        const resp = await IM.uploadPic(img, info)
        // 发送图片
        const customMsgInfo = IM.formatImgMsgOption(resp, info)
        await IM.sendNormalMsg(this.userInfo.userId, this.csInfo.csId, customMsgInfo)
      })
    },
    afterSendC2CTextMsgs(text) {
      const msg = {
        nickName: this.userInfo.userName,
        avatar: this.csInfo.csId,
        content: text,
        isSelfSend: true,
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_normal,
        chatType: sessionStatus.video
      }
      this.sendMsgs([
        msg
      ])
    },
    afterSendC2CImgMsgs(imgData) {
      const msg = {
        nickName: this.userInfo.userName,
        avatar: this.csInfo.csId,
        isSelfSend: true,
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_img,
        chatType: sessionStatus.video,
        imgData
      }
      this.sendMsgs([
        msg
      ])
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
  responseVideoQueuesSuccess(msgsObj, userInfo) {
    // 发送系统消息，通知座席端视频接入
    const sessionStorage = window.sessionStorage
    const startTime = parseInt(sessionStorage.getItem('queue_start_time'))
    const queueTimeLength = new Date().getTime() - startTime
    sessionStorage.removeItem('queue_start_time')
    const systemMsg = {
      userId: msgsObj.csId,
      msgBody: {
        data: {
          queueTimeLength,
          code: systemMsgStatus.video_requestCsEntance,
          // code: systemMsgStatus.onLine_requestCsEntance,
          csId: msgsObj.csId,
          csName: msgsObj.csName || msgsObj.csId,
          userId: userInfo.userId,
          userName: userInfo.userName,
          userPhone: userInfo.userPhone,
          openId: userInfo.openId,
          orign: '官微',
          robotSessionId: this.sessionId
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
    const csInfo = shallowCopy(this.csInfo)
    csInfo.csAvatar = getCsAvatar(this.csInfo.csId)
    csInfo.csName = msgsObj.csName
    csInfo.likesCount = msgsObj.likesCount
    csInfo.csCode = msgsObj.csCode
    return csInfo
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
      onLineQueueCsId: ''
    }
  },
  computed: {
    ...mapGetters([
      'userInfo',
      'queueNum'
    ])
  },
  methods: {
    async enterOnLineLineUp() {
      window.sessionStorage.setItem('queue_start_time', new Date().getTime())
      // // 在线转人工流程
      // // 1. 添加转人工提示
      // this.pushNormalTipMsg('正在为您转接在线客服，请稍候')
      // // 2. 请求排队
      // const res = await this.formatOnLineQueueAPI()
      // // 3. 处理
      // if (res.code === ERR_OK) {
      //   this.afterQueueSuccess(res.data)
      // } else {
      //   this.botSendLeaveMsg()
      // }

      // 排队成功，直接通知坐席
      const msg = {
        csId: '00535530bcdd11e8bac9b72d08583923'
      }
      RTCSystemMsg.responseVideoQueuesSuccess(msg, this.userInfo)
      // 存客服基本信息
      this.setCsInfo(msg)
    },
    async formatOnLineQueueAPI() {
      // const res = await onLineQueue({
      //   chatGuid: this.sessionId,
      //   customerGuid: this.userInfo.userId,
      //   customerNick: this.userInfo.userName,
      //   identity: this.userInfo.userGrade,
      //   insuranceType: '1',
      //   origin: '官微',
      //   type: '2'
      // })
      const res = await onLineQueue({
        chatGuid: this.sessionId,
        customerGuid: this.userInfo.userId,
        customerImg: '',
        customerNick: this.userInfo.userName,
        identity: '4',
        insuranceType: '1',
        origin: '1',
        type: '1'
      })
      const data = res.data
      if (res.result_code === '200') {
        if (data.workTIme) {
          // 排队中
          return {
            code: '0',
            data: {
              num: data.teamNum,
              csId: data.userCode
            }
          }
        }
      } else {
        console.log('===== 排队出错 辣 =====')
      }
      return {
        code: '1',
        data: '请留言'
      }
    },
    afterQueueSuccess(data) {
      if (data.num === 0) {
        // 排队成功，直接通知坐席
        const msg = {
          csId: data.csId
        }
        RTCSystemMsg.responseVideoQueuesSuccess(msg)
      } else {
        // 排队等待
        // 设置排队人数
        this.setQueueNum(data.num)
        // 记录系统返回的默认排队坐席Id
        this.onLineQueueCsId = data.csId
        const msg = {
          content: '',
          time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          msgStatus: msgStatus.tip,
          msgType: tipTypes.tip_line_up,
          queueNum: this.queueNum
        }
        this.sendMsgs([
          msg
        ])
        // 设置排队状态
        this.setQueueMode(queueStatus.queuing)
      }
    },
    botSendLeaveMsg() {
      const msg = {
        nickName: this.botInfo.botName,
        content: '',
        isSelfSend: false,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_leave
      }
      this.sendMsgs([
        msg
      ])
    },
    pushNormalTipMsg(content) {
      const tip = {
        content,
        time: formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.tip,
        msgType: tipTypes.tip_normal
      }
      this.sendMsgs([
        tip
      ])
    },
    ...mapMutations({
      setCsInfo: 'SET_CS_INFO',
      setQueueMode: 'SET_QUEUE_MODE',
      setQueueNum: 'SET_QUEUE_NUM'
    })
  }
}
