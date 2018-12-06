import { mapGetters, mapMutations, mapActions } from 'vuex'
import IM from '@/server/im'
// import Creator from '@/common/js/msgsLoader'
import MsgsLoader from '@/common/js/MsgsLoader'
// import WebRTCAPI from 'webRTCAPI'
import { ERR_OK, getImgUrl, getUserInfoByOpenID, getLoginInfo, getBotInfo, sendMsgToBot, getSessionList, getCsAvatar, onLineQueue, getBotRoamMsgs, requestHistoryMsgs, onLineQueueCancel, chatQueueHeartBeat } from '@/server/index.js'
import Tools from '@/common/js/tools'
// import { formatDate } from '@/common/js/dateConfig.js'
import { roomStatus, queueStatus, sessionStatus, systemMsgStatus, msgStatus, cardTypes, msgTypes, tipTypes } from '@/common/js/status'

export const loginMixin = {
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  methods: {
    async loginByOpenID(openId) {
      // 若本地缓存存在且未过期，直接返回本地缓存
      let data = {}
      if (data = Tools.CacheTools.getCacheData({ key: 'userBaseInfo', check: openId })) return data

      const res = await getUserInfoByOpenID(openId)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 loginByOpenID 辣 =============================')
        // 配置 userInfo
        !res.data.userInfo.openId && (res.data.userInfo.openId = this.$route.query.openId)
        res.data.userInfo.avatar = res.data.wxUserInfo ? res.data.wxUserInfo.headImgUrl : ''
        res.data.userInfo.nickName = res.data.wxUserInfo ? res.data.wxUserInfo.nickName : ''
        // 存本地localstorage
        Tools.CacheTools.setCacheData({
          key: 'userBaseInfo',
          check: res.data.userInfo.openId,
          data: res.data.userInfo
        })
        return res.data.userInfo
      } else {
        console.log('error in getUserInfoByOpenID')
      }
    },
    async getUserInfo(userId) {
      // 若本地缓存存在且未过期，直接返回本地缓存
      let data = {}
      if (data = Tools.CacheTools.getCacheData({ key: 'userSigInfo', check: this.userInfo.openId })) return data

      const res = await getLoginInfo(userId, 1)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 getUserInfo 辣 =============================')
        // const info = Tools.CopyTools.objShallowClone(this.userInfo)
        const info = {
          accountType: res.data.accountType,
          sdkAppID: res.data.sdkAppId,
          userSig: res.data.userSig
        }
        Tools.CacheTools.setCacheData({
          key: 'userSigInfo',
          check: this.userInfo.openId,
          data: info
        })
        return info
      } else {
        console.log('error in getLoginInfo')
      }
    },
    async getBotBaseInfo() {
      // 若本地缓存存在且未过期，直接返回本地缓存
      let data = {}
      let botInfo = {}
      if (data = Tools.CacheTools.getCacheData({ key: 'botInfo', check: this.userInfo.openId })) {
        // 若本地缓存存在且未过期，直接取本地缓存
        botInfo = data
      } else {
        const res = await getBotInfo()
        if (res.result.code === ERR_OK) {
          console.log('============================= 我现在来请求 BotInfo 辣 =============================')
          botInfo = {
            avatarUrl: getImgUrl(res.data.headUrl),
            botName: res.data.name,
            welcomeTip: res.data.welcomeTip,
            hotspotDoc: res.data.hotspotDoc,
            hotspotQuestions: (function() {
              return res.data.hotspotQuestions.map((item) => {
                return { question: item.name }
              })
            })()
          }
          Tools.CacheTools.setCacheData({
            key: 'botInfo',
            check: this.userInfo.openId,
            data: botInfo
          })
        } else {
          console.log('============================= getBotInfo error =============================')
          throw Error('getBotInfo error')
        }
      }

      // // 若当前有未结束服务，则不配置机器人欢迎语，会在拉取的缓存消息里配置
      // if (Tools.CacheTools.getCacheData({ key: 'curServInfo', check: this.userInfo.openId })) {
      //   return {
      //     botInfo,
      //     welcomeMsg: []
      //   }
      // }

      // 配置欢迎语消息
      const botCard = {
        msgStatus: msgStatus.card,
        msgType: cardTypes.bot_card,
        cardInfo: {
          avatar: botInfo.avatarUrl,
          nickName: botInfo.botName
        }
      }
      const botWelcomeMsg = {
        nickName: botInfo.botName,
        content: botInfo.welcomeTip,
        isSelfSend: false,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_normal
      }
      const botHotMsg = {
        content: botInfo.hotspotDoc,
        nickName: botInfo.botName,
        isSelfSend: false,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_hot,
        msgExtend: botInfo.hotspotQuestions
      }
      const welcomeMsg = [ botCard, botWelcomeMsg, botHotMsg ]

      return {
        botInfo,
        welcomeMsg
      }
    }
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
      'roomMode',
      'roomId',
      'sessionId',
      'chatGuid',
      'msgs',
      'videoMsgs',
      'queueNum',
      'hasAssess'
    ])
  },
  methods: {
    initIM(userInfo) {
      // const self = this
      // self.onMsgNotify.bind(this)
      const loginInfo = {
        sdkAppID: userInfo.sdkAppID,
        appIDAt3rd: userInfo.sdkAppID,
        identifier: userInfo.userId,
        identifierNick: userInfo.userName,
        accountType: userInfo.accountType,
        userSig: userInfo.userSig
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
        case systemMsgStatus.VIDEO_QUEUES_REDUCE:
          const video_num = this.queueNum - 1
          this.setQueueNum(video_num)
          break

        // 客户端排队成功（视频）
        case systemMsgStatus.VIDEO_QUEUES_SUCCESS:
          this.isQueuingTextShow = false
          const videoQueueSuccMsg = {
            code: systemMsgStatus.VIDEO_REQUEST_CS_ENTENCE,
            csId: this.$route.query.csId,
            csName: this.$route.query.csName,
            accessId: msgsObj.accessId,
            startTime: msgsObj.startTime,
            endTime: msgsObj.endTime
          }
          const videoConfig = await this.configSendSystemMsg(videoQueueSuccMsg)
          await IM.sendSystemMsg(videoConfig)

          // 客服转接定时器
          const VIDEO_CS_REQ_TRANS_FAIL_msg = {
            code: systemMsgStatus.VIDEO_CS_REQ_TRANS_FAIL,
            csId: videoQueueSuccMsg.csId
          }
          this.reqTransTimeout({
            msg: VIDEO_CS_REQ_TRANS_FAIL_msg,
            toast: this.$vux.toast,
            delay: 30000
          }).then(() => {
            if (this.$route.query.goindex === 'true') {
              this.$router.push('/')
            } else {
              this.$router.back(-1)
            }
            this.afterQueueFailed()
          })
          break

        // 座席端视频接入请求（视频）
        case systemMsgStatus.VIDEO_REQUEST_CS_ENTENCE:

          break

        // 座席端会话、坐席基本信息传递（视频）
        case systemMsgStatus.VIDEO_TRANS_BASE_INFO:
          // 清空转接定时器
          this.userInfo.transTimeout && clearTimeout(this.userInfo.transTimeout)

          const csInfo_video = Tools.CopyTools.objDeepClone(this.csInfo)
          csInfo_video.csId = msgsObj.csId
          csInfo_video.csAvatar = getCsAvatar(msgsObj.csId)
          csInfo_video.csName = msgsObj.csName
          csInfo_video.likesCount = msgsObj.likesCount
          csInfo_video.csCode = msgsObj.csCode

          // 视频坐席基本信息
          this.setCsInfo(csInfo_video)
          // 设置房间ID
          this.setRoomId(csInfo_video.csCode)
          // 设置会话ID
          this.setSessionId(msgsObj.sessionId)
          // 设置排队状态
          this.setQueueMode({
            mode: roomStatus.videoChat,
            status: queueStatus.queueSuccess
          })
          break

        // 坐席端创建会话失败（视频）
        case systemMsgStatus.VIDEO_CS_INIT_SESSIONID_FAIL:
          this.reqTransTimeout({
            msg: null,
            toast: this.$vux.toast
          }).then(() => {
            if (this.$route.query.goindex === 'true') {
              this.$router.push('/')
            } else {
              this.$router.back(-1)
            }
            this.afterQueueFailed()
          })
          break

        /* ********************************************* 在线 ********************************************* */
        // 人数减少（在线）
        case systemMsgStatus.ONLINE_QUEUES_REDUCE:
          const online_num = this.queueNum - 1
          this.setQueueNum(online_num)
          break

        // 客户端排队成功（在线）
        case systemMsgStatus.ONLINE_QUEUES_SUCCESS:
          this.$router.replace({path: `/room/chat?openId=${this.userInfo.openId}`})
          const onlineQueueSuccMsg = {
            code: systemMsgStatus.ONLINE_REQUEST_CS_ENTANCE,
            csId: msgsObj.csId,
            startTime: msgsObj.queueStartTime,
            endTime: msgsObj.queueEndTime
          }
          const onlineConfig = await this.configSendSystemMsg(onlineQueueSuccMsg)
          await IM.sendSystemMsg(onlineConfig)

          // 客服转接定时器
          const ONLINE_CS_REQ_TRANS_FAIL_msg = {
            code: systemMsgStatus.ONLINE_CS_REQ_TRANS_FAIL,
            csId: onlineQueueSuccMsg.csId
          }
          this.reqTransTimeout({
            msg: ONLINE_CS_REQ_TRANS_FAIL_msg,
            toast: this.$vux.toast,
            delay: 30000
          }).then(() => {
            this.afterQueueFailed()
          })
          break

        // 座席端会话、坐席基本信息传递（在线）
        case systemMsgStatus.ONLINE_TRANS_BASE_INFO:
          // 清空转接定时器
          this.userInfo.transTimeout && clearTimeout(this.userInfo.transTimeout)

          const csInfo_onLine = Tools.CopyTools.objDeepClone(this.csInfo)
          csInfo_onLine.csId = msgsObj.csId
          csInfo_onLine.csAvatar = getCsAvatar(msgsObj.csId)
          csInfo_onLine.csName = msgsObj.csName

          // action 删除msgs中排队状态的tips
          this.deleteTipMsg()
          // 设置坐席信息
          this.setCsInfo(csInfo_onLine)
          // 设置会话ID
          this.setSessionId(msgsObj.sessionId)
          // 设置排队状态
          this.setQueueMode({
            mode: roomStatus.menChat,
            status: queueStatus.noneQueue
          })
          // action 排队完成，进入会话
          this.afterQueueSuccess(roomStatus.menChat)
          // 发送欢迎语
          const msg = {
            nickName: this.csInfo.csName,
            avatar: this.csInfo.csId,
            content: this.csInfo.welcomeText,
            isSelfSend: false,
            time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            timestamp: new Date().getTime(),
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal,
            chatType: this.sendType
          }
          this.sendMsgs(msg)
          // action 初始化用户最后响应时间
          this.updateLastAction()

          // 存本地localstorage
          const self = this
          Tools.CacheTools.setCacheData({
            key: 'curServInfo',
            check: self.userInfo.openId,
            data: Object.assign({}, {
              csInfo: csInfo_onLine,
              sessionId: self.sessionId,
              chatGuid: self.chatGuid,
              roomMode: roomStatus.menChat,
              msgs: self.msgs
            })
          })

          break

        // 结束会话（在线）
        case systemMsgStatus.ONLINE_SERVER_FINISH:
          if (this.roomMode !== roomStatus.menChat) {
            return
          }
          const csId = this.csInfo.csId
          const csName = this.csInfo.csName
          this.setServerTime('00:00')
          this.$vux.toast.text('当前人工服务已结束', 'default')
          await Tools.AsyncTools.sleep(3000)
          // assess
          if (!this.hasAssess) {
            this.setAssessView(true)
          } else {
            // action
            this.afterServerFinish(sessionStatus.onLine)
            this.$emit('showShare', csId, csName)
          }
          // 清空本地localstorage
          Tools.CacheTools.removeCacheData('curServInfo')

          break

        // 坐席端创建会话失败（在线）
        case systemMsgStatus.ONLINE_CS_INIT_SESSIONID_FAIL:
          // 转接失败
          this.reqTransTimeout({
            msg: null,
            toast: this.$vux.toast
          }).then(() => {
            this.afterQueueFailed()
          })
          break
      }
    },
    receiveCustomMsgs(msgs) {
      if (this.roomMode === roomStatus.AIChat) {
        return
      }
      const msgsObjs = IM.parseMsgs(msgs).textMsgs
      msgsObjs.forEach(item => {
        item.timestamp = new Date().getTime()
        this.sendMsgs(item)
      })
    },
    ...mapMutations({
      setQueueMode: 'SET_QUEUE_MODE',
      setCsInfo: 'SET_CS_INFO',
      setRoomId: 'SET_ROOM_ID',
      setSessionId: 'SET_SESSION_ID',
      setQueueNum: 'SET_QUEUE_NUM',
      setServerTime: 'SET_SERVER_TIME',
      setAssessView: 'SET_ASSESS_VIEW',
      setFullScreen: 'SET_FULL_SCREEN'
    }),
    ...mapActions([
      'sendMsgs',
      'configSendSystemMsg',
      'afterQueueSuccess',
      'afterServerFinish',
      'reqTransTimeout',
      'updateLastAction',
      'afterQueueFailed'
    ])
  }
}

export const sendMsgsMixin = {
  computed: {
    ...mapGetters([
      'roomMode',
      'botInfo',
      'userInfo',
      'csInfo',
      'roomId',
      'sessionId',
      'chatGuid',
      'sendType',
      'msgs'
    ])
  },
  methods: {
    sendTextMsgToBot(question, timestamp) {
      return new Promise(async(resolve) => {
        if (!timestamp) {
          // 没有时间戳，说明为第一次发送（若有，则为重发）
          timestamp = new Date().getTime()
          // 保存用户输入
          const ques = {
            nickName: this.userInfo.userName,
            content: question,
            isSelfSend: true,
            time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            timestamp: timestamp,
            status: 'pending',
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal,
            chatType: this.sendType
          }
          this.sendMsgs(ques)
        }

        // 获取机器人返回
        const res = await sendMsgToBot(question, this.sessionId, this.userInfo.userId, this.userInfo.userName)
        if (res.result.code === ERR_OK) {
          this.setMsgStatus(timestamp, 'succ')
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
          alert('小华开小差去了，暂时不能回答您的问题')
          this.setMsgStatus(timestamp, 'failed')
        }
      })
    },
    sendC2CMsgs(text, timestamp) {
      if (!timestamp) {
        // 没有时间戳，说明为第一次发送（若有，则为重发）
        timestamp = new Date().getTime()
        this.afterSendC2CTextMsgs(timestamp, text)
      }

      // 重置消息状态
      this.setMsgStatus(timestamp, 'pending')

      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csName,
          msg: text,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_normal,
          chatType: this.sendType
        }, () => {
          this.setMsgStatus(timestamp, 'succ')
        }, () => {
          this.setMsgStatus(timestamp, 'failed')
        }
      )
    },
    sendGiftMsg(giftInfo, timestamp) {
      if (!timestamp) {
        // 没有时间戳，说明为第一次发送（若有，则为重发）
        timestamp = new Date().getTime()
        this.afterSendC2CGiftMsgs(timestamp, giftInfo)
      }

      // 重置消息状态
      this.setMsgStatus(timestamp, 'pending')

      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csName,
          msg: `${this.userInfo.userName}给你送了一个礼物`,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_gift,
          chatType: this.sendType,
          giftInfo,
          isMsgSync: 2
        }, () => {
          this.setMsgStatus(timestamp, 'succ')
        }, () => {
          this.setMsgStatus(timestamp, 'failed')
        }
      )
    },
    sendLikeMsg(timestamp) {
      if (!timestamp) {
        // 没有时间戳，说明为第一次发送（若有，则为重发）
        timestamp = new Date().getTime()
        this.afterSendC2CLikeMsgs(timestamp)
      }

      // 重置消息状态
      this.setMsgStatus(timestamp, 'pending')

      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csName,
          msg: `我${this.userInfo.userName}给你点赞`,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_liked,
          chatType: this.sendType,
          isMsgSync: 2
        }, () => {
          this.setMsgStatus(timestamp, 'succ')
        }, () => {
          this.setMsgStatus(timestamp, 'failed')
        }
      )
    },
    sendImgMsg(img, timestamp) {
      if (!timestamp) {
        const _URL = window.URL || window.webkitURL
        const imgSrc = _URL.createObjectURL(img)
        // 配置图片本地显示
        timestamp = new Date().getTime()
        const imgData = {
          big: imgSrc,
          small: imgSrc
        }
        this.afterSendC2CImgMsgs(timestamp, imgData, img)
      }
      return new Promise(async(resolve) => {
        // 重置消息状态
        this.setMsgStatus(timestamp, 'pending')
        resolve()
        // IM 封装上传/发送图片
        const info = {
          msg: '图片消息',
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.userName,
          avatar: this.userInfo.userId,
          toUserName: this.csInfo.csName,
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_img,
          chatType: this.sendType
        }
        // 上传图片
        let resp = await IM.uploadPic(img, {
          sendUserId: this.userInfo.userId,
          toUserId: this.csInfo.csId
        }, () => {
          this.setMsgStatus(timestamp, 'failed')
        })
        // 发送图片
        const customMsgInfo = IM.formatImgMsgOption(resp, info)
        await IM.sendNormalMsg(
          this.userInfo.userId,
          this.csInfo.csId,
          customMsgInfo, () => {
            this.setMsgStatus(timestamp, 'succ', customMsgInfo)
          }, () => {
            this.setMsgStatus(timestamp, 'failed')
          }
        )
      })
    },
    sendXiaoHuaExpress(url, timestamp) {
      if (!timestamp) {
        // 没有时间戳，说明为第一次发送（若有，则为重发）
        timestamp = new Date().getTime()
        this.afterSendXiaoHuaExpress(timestamp, url)
      }

      // 重置消息状态
      this.setMsgStatus(timestamp, 'pending')

      this.roomMode !== roomStatus.AIChat && IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csName,
          msg: `小华表情`,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_XH_express,
          chatType: this.sendType,
          imgData: {
            big: url,
            small: url
          }
        }, () => {
          this.setMsgStatus(timestamp, 'succ')
        }, () => {
          this.setMsgStatus(timestamp, 'failed')
        }
      )
    },
    afterSendC2CTextMsgs(timestamp, text) {
      const msg = {
        nickName: this.userInfo.userName,
        avatar: this.userInfo.userId,
        content: text,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_normal,
        chatType: this.sendType
      }
      this.sendMsgs(msg)
    },
    afterSendC2CGiftMsgs(timestamp, giftInfo) {
      const msg = {
        nickName: this.userInfo.userName,
        avatar: this.userInfo.userId,
        content: `${this.userInfo.userName}给你送了一个礼物`,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_gift,
        chatType: this.sendType,
        giftInfo
      }
      this.sendMsgs(msg)
    },
    afterSendC2CLikeMsgs(timestamp) {
      const msg = {
        nickName: this.userInfo.userName,
        avatar: this.userInfo.userId,
        content: `我${this.userInfo.userName}给你点赞`,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_liked,
        chatType: this.sendType
      }
      this.sendMsgs(msg)
    },
    afterSendC2CImgMsgs(timestamp, imgData, file_Obj) {
      // const fileObj = Tools.CopyTools.objWithTypeDeepClone(file_Obj)
      const fileObj = new File([file_Obj], file_Obj.name, { type: file_Obj.type })
      const msg = {
        nickName: this.userInfo.userName,
        avatar: this.userInfo.userId,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_img,
        chatType: this.sendType,
        fileObj,
        imgData
      }
      this.sendMsgs(msg)
    },
    afterSendXiaoHuaExpress(timestamp, url) {
      const msg = {
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        nickName: this.userInfo.userName,
        avatar: this.userInfo.userId,
        isSelfSend: true,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_XH_express,
        chatType: this.sendType,
        imgData: {
          big: url,
          small: url
        }
      }
      this.sendMsgs(msg)
    },
    setMsgStatus(timestamp, status, ...msg) {
      for (let i = this.msgs.length - 1; i > 0; i--) {
        if (this.msgs[i].timestamp && this.msgs[i].timestamp === timestamp) {
          let msgsList = Tools.CopyTools.arrShallowClone(this.msgs)
          let currMsg = Tools.CopyTools.objDeepClone(this.msgs[i])
          // 修改对应消息的状态
          currMsg.status = status
          // 若为图片消息，则对应添加图片的真实地址
          if (msg.length && (msg[0].msgType === msgTypes.msg_img)) {
            const img = msg[0].imgData
            currMsg.imgData = {
              big: img.big,
              small: img.small
            }
          }
          msgsList.splice(i, 1, currMsg)
          this.setMsgs(msgsList)
          break
        }
      }
    },
    ...mapMutations({
      setMsgs: 'SET_MSGS'
    }),
    ...mapActions([
      'sendMsgs'
    ])
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
    /* 获取当天会话列表 */
    async requestSessionList(userId) {
      const res = await getSessionList(userId)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 会话列表 辣 =============================')
        this.sessionList = res.data.sessionList
      } else {
        console.log('error in getHistoryMsgs')
      }
    },
    /* 初始化 */
    initMsgLoader() {
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
    },
    /* 拉取消息（漫游消息，历史消息） */
    async requestMsgsMixin() {
      // 初始化
      !this.MsgsLoader && this.initMsgLoader()
      // 拉取消息
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
      'msgs',
      'userInfo',
      'queueNum',
      'sessionId',
      'chatGuid'
    ])
  },
  methods: {
    async enterOnLineLineUp() {
      this.$router.replace({path: `/room/chat?openId=${this.userInfo.openId}&csId=${this.onLineQueueCsId || 'wait_for_distribution'}`})
      // // 排队成功，直接通知坐席
      // this.setChatGuid(new Date().getTime())
      // const msg = {
      //   code: systemMsgStatus.ONLINE_REQUEST_CS_ENTANCE,
      //   chatGuid: this.chatGuid,
      //   csId: 'webchat7',
      //   csName: 'webchat7',
      //   startTime: '',
      //   endTime: ''
      // }
      // const config = await this.configSendSystemMsg(msg)
      // await IM.sendSystemMsg(config)

      // 在线转人工流程
      // 1. 请求排队
      const res = await this.formatOnLineQueueAPI()
      // 2. 处理
      if (res.code === ERR_OK) {
        window.sessionStorage.setItem('queue_start_time', new Date().getTime())
        this.handleQueueRes(res.data)
      } else {
        this.botSendLeaveMsg()
      }
    },
    async formatOnLineQueueAPI() {
      // 初始化人工客服排队ID，存vuex
      this.setChatGuid(new Date().getTime())
      const option = {
        chatGuid: `${this.chatGuid}`,
        customerGuid: `${this.userInfo.userId}`,
        customerImg: '',
        customerNick: this.userInfo.userName,
        identity: this.userInfo.userGrade,
        robotSessionId: this.sessionId,
        origin: 'WE',
        callType: 'ZX',
        type: '2'
      }
      const res = await onLineQueue(option)
      const data = res.data.data
      if (res.data.result_code === '200') {
        // if (data.online) {
        // 发送正在转接提示
        this.beforeQueue({
          mode: roomStatus.menChat,
          content: `尊敬的${+this.userInfo.userGrade <= 3 ? this.userInfo.userGradeName : ''}客户，正在为您转接人工客服，请稍后。`
        })
        // 排队中
        return {
          code: '0',
          data: {
            num: data.teamNum,
            csId: data.userCode || '',
            csName: data.userName || '',
            isTeam: data.team,
            startTime: data.queueStartTime,
            endTime: data.queueEndTime,
            welcomeText: data.content
          }
        }
        // }
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
    async handleQueueRes(data) {
      const csInfo_onLine = {
        welcomeText: data.welcomeText
      }
      // 设置坐席信息
      this.setCsInfo(csInfo_onLine)

      if (!data.isTeam) {
        // 排队成功，直接通知坐席
        const msg = {
          code: systemMsgStatus.ONLINE_REQUEST_CS_ENTANCE,
          csId: data.csId,
          csName: data.csName,
          startTime: data.startTime,
          endTime: data.endTime
        }
        const config = await this.configSendSystemMsg(msg)
        await IM.sendSystemMsg(config)

        // 客服转接定时器
        const ONLINE_CS_REQ_TRANS_FAIL_msg = {
          code: systemMsgStatus.ONLINE_CS_REQ_TRANS_FAIL,
          csId: msg.csId
        }
        this.reqTransTimeout({
          msg: ONLINE_CS_REQ_TRANS_FAIL_msg,
          toast: this.$vux.toast,
          delay: 30000
        }).then(() => {
          this.afterQueueFailed()
        })
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
        this.setQueueMode({
          mode: roomStatus.menChat,
          status: queueStatus.queuing
        })
      }
    },
    async cancelQueue() {
      const res = await onLineQueueCancel({
        customerGuid: `${this.userInfo.userId}`,
        chatGuid: `${this.chatGuid}`,
        origin: 'WE',
        callType: 'ZX'
      })
      if (res.data.result_code === '200') {
        console.info('取消排队成功')
        this.$vux.toast.text('您已经取消排队', 'default')
        this.stopHeartBeat()
        this.setQueueMode({
          mode: roomStatus.AIChat,
          status: queueStatus.noneQueue
        })
        return 0
      } else {
        console.info('取消排队失败')
      }
    },
    startHeartBeat() {
      this.heart = true
      this.heartBeatTimer = setInterval(async() => {
        console.warn('====== 在线的 我现在请求心跳 ======')
        if (!this.heart || !this.$route.query.csId) {
          // 非常规退出 & 浏览器回退
          this.stopHeartBeat()
          return
        }
        this.heartBeatReq = await chatQueueHeartBeat({
          customerGuid: `${this.userInfo.userId}`,
          chatGuid: `${this.chatGuid}`,
          origin: 'WE',
          callType: 'ZX'
        })
        if (this.heartBeatReq.data.result_code === '200') {
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
      // 最后一条msg消息是否为留言消息，是则return，否则发送留言消息
      for (let i = this.msgs.length - 1; i > 0; i--) {
        if (this.msgs[i].msgStatus === msgStatus.msg) {
           if (this.msgs[i].msgType === msgTypes.msg_leave) {
             return
           } else {
             break
           }
        }
      }
      const msg = {
        nickName: this.botInfo.botName,
        content: '当前人工客服忙碌',
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
      setQueueNum: 'SET_QUEUE_NUM',
      setChatGuid: 'SET_CHAT_GUID'
    }),
    ...mapActions([
      'beforeQueue',
      'configSendSystemMsg',
      'reqTransTimeout',
      'afterQueueFailed'
    ])
  }
}
