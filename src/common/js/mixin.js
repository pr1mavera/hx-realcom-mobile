import { mapGetters, mapMutations, mapActions } from 'vuex'
import IM from '@/server/im'
import { MsgsLoader } from '@/common/js/MsgsLoader'
// import WebRTCAPI from 'webRTCAPI'
import { ERR_OK, getImgUrl, getUserInfoByOpenID, getLoginInfo, getBotInfo, sendMsgToBot, getSessionList, getCsAvatar, onLineQueue, getBotRoamMsgs, requestHistoryMsgs, videoQueueCancel, onLineQueueCancel, chatQueueHeartBeat, getWorkTime } from '@/server/index.js'
import Tools from '@/common/js/tools'
// import { Either } from '@/common/js/container/either'
import { roomStatus, queueStatus, sessionStatus, systemMsgStatus, msgStatus, cardTypes, msgTypes, tipTypes, dialogTypes, videoLogMap } from '@/common/js/status'

export const loginMixin = {
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  methods: {
    async getUserBaseInfo(openId, origin = 'WE') {
      let userInfo = {}
      if (origin === 'WE') {
        // 调用openId拿用户信息
        userInfo = await this.getUserInfoFromOpenId(openId)
      }
      if (!userInfo.baseInfo || userInfo.baseInfo.userGrade === '5') {
        // 配置游客信息
        userInfo.baseInfo = this.getVisitorInfo(openId, origin, userInfo.baseInfo)
      }
      if (!userInfo.workTimeInfo) {
        // 配置工作时间
        userInfo.workTimeInfo = await this.getWorkTimeInfo()
      }
      return Object.assign(userInfo.baseInfo, userInfo.wxUserInfo, { workTimeInfo: userInfo.workTimeInfo })
    },
    async getUserInfoFromOpenId(openId) {
      const res = await getUserInfoByOpenID(openId)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 loginByOpenID 辣 =============================')
        let data = res.data
        const query = this.$route.query
        const info = {
          baseInfo: Object.assign(data.userInfo, {
            openId: openId,
            origin: query.origin || 'WE'
          }),
          wxUserInfo: {},
          workTimeInfo: Tools.reduce((val, item) => Object.assign(val, {
            [item.callType]: {
              startTime: item.startTime,
              endTime: item.endTime
            }
          }), {})(data.userInfo.workTimeInfo)
        }
        const wxUserInfo = data.wxUserInfo
        info.wxUserInfo.avatar = wxUserInfo.headImgUrl || ''
        info.wxUserInfo.nickName = wxUserInfo.nickName.replace(/(\\n|\/\/|\\b|\\f|\\r|\\t|\\")/g, '') || data.userName
        return info
      } else {
        console.log('error in getUserInfoByOpenId')
        return {}
      }
    },
    getVisitorInfo(openId, origin, baseInfo) {
      let data = {}
      // 缓存中有游客信息，直接返回：
      if (data = Tools.CacheTools.getCacheData({ key: `${origin}_visitor`, check: origin })) {
        return Object.assign({}, baseInfo, data, { openId })
      }

      // 缓存中没有对应渠道的游客信息：
      // 1. 创建游客信息
      const rand = Tools.randomMin2Max(1000)(9999) // 随机四位数
      const timestamp = new Date().getTime() // 时间戳
      const visitorInfo = {
        avatar: '',
        openId: openId || `visitor_${rand}_${timestamp}`,
        nickName: `游客_${rand}`,
        birthday: '1971-01-01',
        isVip: 'N',
        userGrade: '5',
        userGradeName: `游客`,
        userId: `visitor_${rand}_${timestamp}`,
        userName: `游客_${rand}`,
        userPhone: '00000000000',
        origin: origin,
        userPriority: '5'
      }
      // 2. 游客信息存缓存
      Tools.CacheTools.setCacheData({ key: `${origin}_visitor`, check: origin, data: visitorInfo })
      // 3. 返回
      return Object.assign({}, baseInfo, visitorInfo)
    },
    async getWorkTimeInfo() {
      // 获取工作时间
      const res = await getWorkTime()
      let workTimeInfo = {
        'SP': {
          startTime: '09:00',
          endTime: '20:00'
        },
        'ZX': {
          startTime: '09:00',
          endTime: '20:00'
        }
      }
      if (res && res.result && res.result.code === ERR_OK) {
        const workTime = res.data.workTime
        // 处理工作时间数据结构
        if (workTime) {
          workTimeInfo = Tools.reduce((val, item) => Object.assign(val, {
            [item.callType]: {
              startTime: item.startTime,
              endTime: item.endTime
            }
          }), {})(workTime)
        }
      }
      return workTimeInfo
    },
    async getUserSig(openId, userId) {
      // 若本地缓存存在且未过期，直接返回本地缓存
      let data = {}
      const quality = await this.systemConfig('cacheExpireTime')
      if (data = Tools.CacheTools.getCacheData({ key: 'userSigInfo', check: userId, quality })) return data

      const res = await getLoginInfo(userId, 1)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 getUserInfo 辣 =============================')
        // const info = Tools.CopyTools.objShallowClone(this.userInfo)
        const info = {
          accountType: res.data.accountType,
          sdkAppID: res.data.sdkAppId,
          userSig: res.data.userSig
        }
        // 缓存本地，用户签名
        Tools.CacheTools.setCacheData({ key: 'userSigInfo', check: userId, data: info })
        return info
      } else {
        console.log('error in getLoginInfo')
      }
    },
    async getBotBaseInfo(userId, origin) {
      // 若本地缓存存在且未过期，直接返回本地缓存
      let data = {}
      let botInfo = {}
      // TIME_24_HOURS
      const quality = await this.systemConfig('cacheExpireTime')
      if (data = Tools.CacheTools.getCacheData({ key: 'botInfo', check: userId, quality })) {
        // 若本地缓存存在且未过期，直接取本地缓存
        botInfo = data
      } else {
        const res = await getBotInfo(origin)
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
          // 缓存本地，机器人信息
          Tools.CacheTools.setCacheData({ key: 'botInfo', check: userId, data: botInfo })
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
    },
    ...mapActions([
      'systemConfig'
    ])
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
  mounted() {
    // 手机切换屏幕
    // window.addEventListener('visibilitychange', () => {
    //   if (document.hidden) {
    //     return undefined
    //   }
    //   this.RTC.openAudio()
    //   this.RTC.openVideo()
    // }, true)
  },
  methods: {
    initRTC() {
      // 质量报告计数
      // const getVideoQuaRepCount = (function() {
      //   let count = 0
      //   return function getConut() {
      //     return ++count
      //   }
      // })()
      // let count = 0

      return new Promise((resolve, reject) => {
        const self = this
        // eslint-disable-next-line
        this.RTC = new WebRTCAPI({
          'sdkAppId': self.userInfo.sdkAppID,
          'userId': self.userInfo.userId,
          'userSig': self.userInfo.userSig
          // 'accountType': self.userInfo.accountType
        }, () => {
          resolve()
        }, err => {
          reject(new Error(`error in initRTC: ${JSON.stringify(err)}`))
          // 视频异常上报
          this.videoLogReport([ ...videoLogMap.init_RTC_failed, { checkInfo: err } ])
        })

        this.RTC.on('onQualityReport', data => {
          // count = getVideoQuaRepCount()
          return this.handleRTCQualityReport(data)
        })

        this.RTC.on('onLocalStreamAdd', (info) => {
          const videoElement = document.getElementById('localVideo')
          const remoteVideoElement = document.getElementById('remoteVideo')
          if (info && info.stream) {
            videoElement.srcObject = info.stream
            remoteVideoElement.play()
          }
        })

        this.RTC.on('onRemoteStreamUpdate', (info) => {
          console.log('onRemoteStreamUpdate ----------------')
          const videoElement = document.getElementById('remoteVideo')
          if (info && info.stream && this.RTCconnecting) {
            // 绑定视频流
            videoElement.srcObject = info.stream
            videoElement.play()
          }
        })

        const remoteVideoElement = document.getElementById('remoteVideo')
        // 添加监听，远程流视频加载完全时，关闭铃声，切换摄像头...
        remoteVideoElement.addEventListener('playing', () => {
          this.setStateConnected()
        }, false)

        this.RTC.on('onKickOut', () => {
          console.warn('其他地方登录，被踢下线')
          // self.goHomeRouter()
        })

        this.RTC.on('onRelayTimeout', () => {
          console.warn('服务器超时断开')
          this.showToast('当前网络状况不佳，服务器超时断开')
        })

        this.RTC.on('onStreamNotify', (info) => {
          console.log(info)
          if (info.isLocal === true && info.event === 'inactive' && info.type === 'stream') {
            // this.hangUpVideo()
            // 停止推流
            // return this.setStateUnconnect()
            // 30秒之后断开，直接显示重连
            this.RTC && this.setStateUnconnect({ info: 'onStreamNotify响应，流主动断开' })
          }
          // debugger
          // 本地流断开
          // if (info.event === 'onended' || info.event === 'inactive') {
          //   this.RTC.getLocalStream({ video: true, audio: true }, (info) => {
          //     this.RTC.startRTC({ stream: info.stream, role: 'user' })
          //   })
          // }
        })
      })
    },

    // 加入房间
    enterRoom(room) {
      return new Promise((resolve, reject) => {
        this.RTC.enterRoom({ roomid: room, role: 'cs' }, () => {
          resolve()
        }, err => {
          reject(new Error(`error in enterRoom: ${JSON.stringify(err)}`))
          // 视频异常上报
          this.videoLogReport([ ...videoLogMap.enter_room_failed, { checkInfo: err } ])
        })
      })
    },

    // 获取本地流
    getLocalStream() {
      return new Promise((resolve, reject) => {
        this.RTC.getLocalStream({ video: true, audio: true }, info => {
          resolve(info)
          const videoElement = document.getElementById('localVideo')
          if (info && info.stream) {
            videoElement.srcObject = info.stream
          }
        }, err => {
          reject(new Error(`error in getLocalStream: ${JSON.stringify(err)}`))
          // 视频异常上报
          this.videoLogReport([ ...videoLogMap.get_local_stream_failed, { checkInfo: err } ])
        })
      })
    },

    // 本地推流
    startRTC(stream) {
      // 记录差值
      // function getDiffAndRecordWithInitVal(initVal) {
      //   let oldVal = initVal
      //   return (newVal) => {
      //     const diff = newVal - oldVal
      //     oldVal = newVal
      //     return diff
      //   }
      // }

      return new Promise((resolve, reject) => {
        this.RTC.startRTC({ stream },
          () => {
            // // 初始化 bytesSent
            // const getDiffOfBytesSent = getDiffAndRecordWithInitVal(0)
            // // 初始化 packetsSent
            // const getDiffOfPacketsSent = getDiffAndRecordWithInitVal(0)
            // this.RTC.getStats({ interval: 1000 }, res => {
            //   const video = res.video
            //   console.log('getStats => !!!!!!!', res)
            //   console.log('getStats => bytesReceived:', video.bytesReceived / 1024)
            //   // console.log('getStats => bytesSent:', getDiffOfBytesSent(video.bytesSent) / 1024)
            //   // console.log('getStats => packetsLost:', video.packetsLost)
            //   // console.log('getStats => packetsReceived:', video.packetsReceived)
            //   // console.log('getStats => packetsSent:', getDiffOfPacketsSent(video.packetsSent))
            // }, err => {
            //   console.log('ERR in getStats:', err)
            // })
            resolve()
            const remoteVideoElement = document.getElementById('remoteVideo')
            remoteVideoElement.play()
          }, err => {
            reject(new Error(`error in startRTC: ${JSON.stringify(err)}`))
            // 视频异常上报
            this.videoLogReport([ ...videoLogMap.start_RTC_failed, { checkInfo: err } ])
          }
        )
      })
    },

    // 停止推流
    stopRTC() {
      this.RTC.stopRTC({}, () => {
        console.debug('stop succ')
      }, () => {
        console.debug('stop end')
      })
    },

    // 退出RTC
    quitRTC() {
      return new Promise((resolve, reject) => {
        this.RTC && this.RTC.quit(() => {
          console.log('退出音视频房间 成功 辣'); // eslint-disable-line
          // 记录视频结束时间节点
          (this.endTimeTrunk.length === this.startTimeTrunk.length - 1) && this.endTimeTrunk.push(new Date().getTime())
          resolve()
        }, err => {
          console.error('退出音视频房间 失败 辣', JSON.stringify(err))
          reject()
        })
      })
    },

    // 音视频流监控
    handleRTCQualityReport(data) {
      // 当前远程流已经断开，显示重连按钮
      console.log('this.serviceBreakOff: ', this.serviceBreakOff)
      console.log('data!!!!!!!!!!!!: ', data)
      console.log('音频流!!!!!!!!!!!!: ', data.WebRTCQualityReq.AudioReportState.uint32_audio_enc_pkg_br)

      if (this.serviceBreakOff || this.RTCconnecting) {
        return undefined
      }

      Tools.trace('视频质量报告：---> ')(data)
      const total_delay = data.WebRTCQualityReq.uint32_delay
      const daley = data.WebRTCQualityReq.VideoReportState.uint32_video_delay
      // const send_bps = data.WebRTCQualityReq.uint32_total_send_bps
      // const recv_bps = data.WebRTCQualityReq.uint32_total_recv_bps
      const videoDecState = data.WebRTCQualityReq.VideoReportState.VideoDecState[0]
      const fps = videoDecState ? videoDecState.uint32_video_recv_fps : 30
      const rsv_br = data.WebRTCQualityReq.VideoReportState.uint32_video_rcv_br / 1024
      const audio_br = data.WebRTCQualityReq.AudioReportState.uint32_audio_enc_pkg_br
      // const snd_br = data.WebRTCQualityReq.VideoReportState.uint32_video_snd_br
      Tools.trace('rsv_br：=== ')(rsv_br)
      // Tools.trace('snd_br：=== ')(snd_br)

      Tools.trace('总延迟：')(total_delay)
      Tools.trace('视频延迟：')(daley)
      Tools.trace('fps：')(fps)

      const self = this
      const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')

      // 视频卡顿计数
      if (
        total_delay >= (this.totalDelay || 1000) ||
        daley >= (this.delay || 600) ||
        (enterVideoStatus === 'Android' ? (fps <= this.fps) : false) ||
        rsv_br <= this.byteRate
        // true
      ) {
        // 卡顿计数
        // 连续三次卡顿，提示网络状况不佳
        const count = this.unsmoothCount.addCount(() => {
          self.showToast('当前网络状况不佳', 3000)
          // 视频异常上报
          self.videoLogReport([ ...videoLogMap.bad_network_condition,
            { rsvBr: { '视频流：': rsv_br, '音频流：': audio_br } }
          ])
        })
        console.warn('卡顿计数: ', count)
      } else {
        // 重置计数
        const count = this.unsmoothCount.resetCount()
        console.warn('网络好了，重置计数: ', count)
      }

      // 接收视频数据包为零时计数
      if (+rsv_br === 0) {
        // 网络无响应计数，超过限制提示重连
        this.brZeroCount.addCount(() => {
          self.setStateUnconnect({ netStateBad: true })
          // 视频异常上报
          self.videoLogReport([ ...videoLogMap.video_unconnect,
            { rsvBr: { '视频流：': rsv_br, '音频流：': audio_br } }
          ])
        })
      } else {
        // 重置计数
        this.brZeroCount.resetCount()
      }

      // 音频丢包
      if (+audio_br === 0) {
        // 音频丢包计数，超过限制提示重连
        this.audioZeroCount.addCount(() => {
          // self.setStateUnconnect({ info: '音频流为空次数超上限' })
          // 视频异常上报
          // self.videoLogReport(videoLogMap.audio_unconnect)
          self.videoLogReport([ ...videoLogMap.audio_unconnect,
            { rsvBr: { '视频流：': rsv_br, '音频流：': audio_br } }
          ])
        })
      }

      // 获取上一次保存的音频流大小
      const pre_audio_br = sessionStorage.getItem('audio_br')
      if (audio_br !== 0 && +pre_audio_br === 0) {
        // 上一次音频流为0，且本次音频流非0，即音频恢复时
        console.log('恢复时，总计数: ', self.audioZeroCount.count())

        if (self.audioZeroCount.count() >= this.audioMuteTimes) {
          // self.setStateUnconnect({ info: '音频流恢复，但次数超上限' })
          // 视频异常上报
          // this.videoLogReport(videoLogMap.audio_unconnect)
          self.videoLogReport([ ...videoLogMap.audio_unconnect,
            { rsvBr: { '视频流：': rsv_br, '音频流：': audio_br } }
          ])
        } else {
          self.audioZeroCount.resetCount()
        }
        // self.audioZeroCount.count() >= 3
        //   ? self.setStateUnconnect()
        //   : self.audioZeroCount.resetCount()
      }

      // 保存本次音频流大小
      sessionStorage.setItem('audio_br', audio_br)
    },

    // 提示插件
    async showToast(text, time) { // 默认不消失
      // this.toastText = text
      // this.isToastTextShow = true
      this.$vux.toast.show({
        type: 'text',
        text,
        width: '80%',
        time: time || 1000000
      })
      if (!time) {
        return void 0
      }
      await Tools.AsyncTools.sleep(3000)
      return Promise.resolve()
    },

    ...mapActions([
      'setVideoBlur',
      'videoLogReport'
    ])
  }
}

export const IMMixin = {
  computed: {
    ...mapGetters([
      'theme',
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
        const msgsObjs = IM.parseMsgs(msgs).textMsgs
        msgsObjs.forEach(item => {
          if (item.isSystem) {
            // 系统消息
            this.receiveSystemMsgs(item)
          } else {
            // 自定义消息
            this.receiveCustomMsgs(item)
          }
        })
      }
    },
    async receiveSystemMsgs(msgsObj) {
      // 超时配置
      const zxConnectTimeout = await this.systemConfig('zxConnectTimeout')

      // 处理系统消息（视频、在线）
      // const msgsObj = IM.parseMsgsInSystem(msgs).textMsgs[0]
      switch (+msgsObj.code) {
        /* ******************************** 视频 ******************************** */
        // 人数减少（视频）
        case systemMsgStatus.VIDEO_QUEUES_REDUCE:
          const video_num = +this.queueNum - 1
          this.setQueueNum(video_num)
          break

        // 客户端排队成功（视频）
        case systemMsgStatus.VIDEO_QUEUES_SUCCESS:
          // 停止心跳
          // this.stopVideoHeartBeat()

          this.setQueueNum(0)

          const videoQueueSuccMsg = {
            code: systemMsgStatus.VIDEO_REQUEST_CS_ENTENCE,
            csId: this.$route.query.csId,
            csName: this.$route.query.csName,
            accessId: msgsObj.accessId,
            queueStartTime: msgsObj.queueStartTime,
            queueEndTime: msgsObj.queueEndTime
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
            delay: zxConnectTimeout.get()
          }).then(() => {
            // 取消排队接口
            this.videoQueueCancelAPI(3)
            // 排队失败返回
            this.queueFailedReturn()
            // 发送排队失败通知
            this.afterQueueFailed({ sendFailed: false })
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
          csInfo_video.csNick = msgsObj.csNick
          csInfo_video.likesCount = msgsObj.likesCount
          csInfo_video.csCode = msgsObj.csCode
          // 视频坐席基本信息
          this.setCsInfo(csInfo_video)
          // 设置房间ID
          this.setRoomId(csInfo_video.csCode)
          // 设置会话ID
          this.setSessionId(msgsObj.sessionId)

          this.$router.replace({ path: `/room/chat?openId=${this.userInfo.openId}&origin=${this.userInfo.origin}` })

          this.afterQueueSuccess({
            mode: roomStatus.videoChat,
            msgsObj
          })

          // 设置排队状态，以便显示转接成功提示
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
            this.afterQueueFailed({ sendFailed: false })
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
          this.$router.replace({path: `/room/chat?openId=${this.userInfo.openId}&origin=${this.userInfo.origin}`})
          // 设置欢迎语
          const welcomeText_onLine = {
            welcomeText: msgsObj.desc
          }
          this.setCsInfo(welcomeText_onLine)

          // 发送排队成功的消息给坐席
          const onlineQueueSuccMsg = {
            code: systemMsgStatus.ONLINE_REQUEST_CS_ENTANCE,
            csId: msgsObj.csId,
            csName: msgsObj.csName || '',
            csNick: msgsObj.csNick || '',
            queueStartTime: msgsObj.queueStartTime,
            queueEndTime: msgsObj.queueEndTime
          }
          const onlineConfig = await this.configSendSystemMsg(onlineQueueSuccMsg)
          await IM.sendSystemMsg(onlineConfig)

          this.reqTransAnotherTimeout(zxConnectTimeout.get()).then(state => {
            if (state === '480') {
              // 坐席端已经转接成功，直接接通坐席即可
              return undefined
            }
            // 客服转接定时器，分配坐席成功回调
            const ONLINE_CS_REQ_TRANS_FAIL_msg = {
              code: systemMsgStatus.ONLINE_CS_REQ_TRANS_FAIL,
              csId: onlineQueueSuccMsg.csId
            }
            this.reqTransTimeout({
              msg: ONLINE_CS_REQ_TRANS_FAIL_msg,
              toast: this.$vux.toast,
              delay: zxConnectTimeout.get()
            }).then(() => {
              this.afterQueueFailed({ sendFailed: true })
            })
          }, (err) => {
            // 失败回调
            console.log(err)
            debugger
            this.afterQueueFailed({ sendFailed: false })
          })
          break

        // 座席端会话、坐席基本信息传递（在线）
        case systemMsgStatus.ONLINE_TRANS_BASE_INFO:
          // action 排队完成，进入会话
          this.afterQueueSuccess({
            mode: roomStatus.menChat,
            msgsObj
          })
          break

        // 结束会话（在线）
        case systemMsgStatus.ONLINE_SERVER_FINISH:
          if (this.roomMode !== roomStatus.menChat) {
            return
          }
          // const csId = this.csInfo.csId
          // const csName = this.csInfo.csName
          this.setServerTime('00:00')
          this.$vux.toast.text('当前人工服务已结束', 'default')
          // 清空本地localstorage
          Tools.CacheTools.removeCacheData(`${this.userInfo.origin}_curServInfo`)
          // assess
          !this.hasAssess && this.setAssessView({
            show: true,
            task: {
              csInfo: Object.assign({}, this.csInfo),
              sessionId: this.sessionId,
              chatGuid: this.chatGuid,
              mode: this.roomMode
            }
          })
          // await Tools.AsyncTools.sleep(3000)
          this.afterServerFinish(sessionStatus.onLine)
          break

        // 坐席端创建会话失败（在线）
        case systemMsgStatus.ONLINE_CS_INIT_SESSIONID_FAIL:
          // 转接失败
          this.reqTransTimeout({
            msg: null,
            toast: this.$vux.toast
          }).then(() => {
            this.afterQueueFailed({ sendFailed: false })
          })
          break
      }
    },
    async receiveCustomMsgs(msgsObj) {
      if (this.roomMode === roomStatus.AIChat) {
        return
      }
      msgsObj.timestamp = new Date().getTime()
      if (msgsObj.msgStatus === msgStatus.msg) {
        if (msgsObj.msgType === msgTypes.msg_img) { // 图片消息
          this.addPreviewImg({ msgsObj })
        }
        else if (msgsObj.msgType === msgTypes.msg_normal) { // 消息封装链接
          msgsObj.content = Tools.strWithLink(msgsObj.content, this.theme['button'])
        }
        else if (msgsObj.msgType === msgTypes.msg_timeout) { // 超时消息
          const dialog = {
            time: Tools.DateTools.formatDate('yyyy-MM-dd hh:mm:ss'),
            msgStatus: msgStatus.dialog,
            msgType: dialogTypes.dialog_disconnect,
            dialogInfo: {
              disconnectTime: 5
            }
          }
          return this.sendMsgs([dialog])
        }
        else if (msgsObj.msgType === msgTypes.msg_video_blur) { // 客服暂离消息
          const state = msgsObj.content === 'true'
          return this.setVideoBlur(state)
        }
        else if (msgsObj.msgType === msgTypes.msg_video_muted) { // 客服静音消息
          const state = msgsObj.content === 'true'
          return this.setVideoMuted(state)
        }
        else if (msgsObj.msgType === msgTypes.msg_video_hang_up) { // 视频挂断
          // this.handleHangUpVideo()
          this.$vux.toast.show({
            type: 'text',
            text: '本次服务已结束~',
            time: 3000
          })
          if (this.quitRTCResponse) {
            // iOS下 mixin 作用域里面的 this，是 mainRoom，需要直接调用 quitRTCResponse 方法
            return this.quitRTCResponse()
          }
          // 安卓下 this 是 chat，用 emit
          return this.$emit('quitRTCResponse')
        }
        else if (msgsObj.msgType === msgTypes.msg_video_quality) { // 视频卡顿
          // const state = msgsObj.content === 'unsmooth'
          // if (state && this.$vux.toast.isVisible()) {
          //   return undefined
          // }
          return msgsObj.content === 'unsmooth'
            ? this.$vux.toast.show({
              type: 'text',
              text: '您的网络上行速度较差',
              width: '80%',
              time: 1000000
            })
            : this.$vux.toast.hide()
          // if (this.isUnsmoothTextShow !== undefined) {
          //   return this.isUnsmoothTextShow = state
          // } else {
          //   return this.$emit('videoQuality', state)
          // }
        }
        else if (msgsObj.msgType === msgTypes.msg_video_cs_initRTC) { // 视频坐席已经初始化好了RTC
          // 开始监听 bps
          // this.isBpsListen = true
          return undefined
        }
      }
      this.sendMsgs([msgsObj])
      // this.lastMsgTimestamp = msgsObj.time
      this.saveCurMsgs({ origin: this.userInfo.origin, msg: msgsObj })
    },
    queueFailedReturn() {
      const enterVideoStatus = window.sessionStorage.getItem('enterVideoStatus')
      if (enterVideoStatus === 'iOS-Safari') {
        this.$emit('cancelVideoLineUp')
      } else {
        if (this.$route.query.goindex === 'true') {
          this.$router.push('/')
        } else {
          this.$router.back(-1)
        }
      }
    },
    async videoQueueCancelAPI(accessFlag) {
      const query = this.$route.query || 'WE'
      const res = await videoQueueCancel(this.userInfo.userId, query.csId, this.accessId, accessFlag)
      return res.result.code === ERR_OK
    },
    ...mapMutations({
      setQueueMode: 'SET_QUEUE_MODE',
      setCsInfo: 'SET_CS_INFO',
      setRoomId: 'SET_ROOM_ID',
      setSessionId: 'SET_SESSION_ID',
      setQueueNum: 'SET_QUEUE_NUM',
      setServerTime: 'SET_SERVER_TIME',
      setAssessView: 'SET_ASSESS_VIEW',
      setFullScreen: 'SET_FULL_SCREEN',
      setVideoFilter: 'SET_VIDEO_FILTER'
    }),
    ...mapActions([
      'systemConfig',
      'saveCurMsgs',
      'sendMsgs',
      'configSendSystemMsg',
      'afterQueueSuccess',
      'afterServerFinish',
      'reqTransAnotherTimeout',
      'reqTransTimeout',
      'afterQueueFailed',
      'setVideoBlur',
      'setVideoMuted',
      'addPreviewImg'
    ])
  }
}

export const sendMsgsMixin = {
  computed: {
    ...mapGetters([
      'theme',
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
            nickName: this.userInfo.nickName || this.userInfo.userName,
            content: question,
            isSelfSend: true,
            time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
            timestamp,
            status: 'pending',
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal,
            chatType: this.sendType
          }
          this.sendMsgs([ques])
        }

        // 获取机器人返回
        const res = await sendMsgToBot(question, this.sessionId, this.userInfo.userId, this.userInfo.userName, this.userInfo.origin)
        if (res.result.code === ERR_OK) {
          this.setMsgStatus(timestamp, 'succ')
          // 此处将用户的输入保存至vuex
          const data = res.data.answer.data
          data.botName = this.botInfo.botName
          data.time = Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
          const answer = Tools.MsgsFilterTools.botAnswerfilter(data)
          const answers = this.stripImgInBotMsg(answer)
          answers.forEach(item => {
            (item.msgType === msgTypes.msg_img) && this.addPreviewImg({ msgsObj: item })
          })
          await this.sendMsgs(answers)
          // 更新缓存
          this.saveCurMsgs({ origin: this.userInfo.origin, msg: answers })
          resolve()
          console.log('============================= 我现在来请求 sendMsgToBot 辣 =============================')
        } else {
          alert('小华开小差去了，暂时不能回答您的问题')
          this.setMsgStatus(timestamp, 'failed')
        }
      })
    },
    stripImgInBotMsg(answer) {
      if (answer.msgType !== msgTypes.msg_normal) {
        // 非普通文本
        return [answer]
      }
      const imgL = answer.content.match(/<?img.*?>/g)
      let imgMsgs = []
      let textMsg = []
      if (imgL) {
        // 存在图片，单独处理成单个图片消息
        // eslint-disable-next-line
        const srcRegx = /((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:\/~\+#]*[\w\-\@?^=%&amp;\/~\+#])?/i
        // img2msgFn :: String -> Object
        const img2msgFn = (img, idx) => {
          const url = img.match(srcRegx)[0]
          return Object.assign({}, answer, {
            content: '图片消息',
            timestamp: answer.timestamp + idx,
            msgType: msgTypes.msg_img,
            imgData: { big: url, small: url }
          })
        }
        imgMsgs = imgL.map(img2msgFn)
      }
      let text = answer.content.replace(/<(?!a|\/a).*?>/g, '')
      text = Tools.strWithLink(text, this.theme['button'])
      // 文本消息过滤掉图片之后仍然存在文本，则配置文本消息
      text && textMsg.push(Object.assign({}, answer, { content: text }))
      // 组合文本消息和图片消息
      return [...textMsg, ...imgMsgs]
    },
    sendC2CMsgs(text, timestamp) {
      if (!timestamp) {
        // 没有时间戳，说明为第一次发送（若有，则为重发）
        timestamp = new Date().getTime()
        this.afterSendC2CTextMsgs(timestamp, text)
      } else {
        // 重置消息状态
        this.setMsgStatus(timestamp, 'pending')
      }

      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csNick || this.csInfo.csName,
          msg: text,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
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
      } else {
        // 重置消息状态
        this.setMsgStatus(timestamp, 'pending')
      }

      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csNick || this.csInfo.csName,
          msg: `${this.userInfo.nickName || this.userInfo.userName}给你送了一个礼物`,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_gift,
          chatType: this.sendType,
          giftInfo,
          MsgLifeTime: 0
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
      } else {
        // 重置消息状态
        this.setMsgStatus(timestamp, 'pending')
      }

      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csNick || this.csInfo.csName,
          msg: `我${this.userInfo.nickName || this.userInfo.userName}给你点赞`,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_liked,
          chatType: this.sendType,
          MsgLifeTime: 0
        }, () => {
          this.setMsgStatus(timestamp, 'succ')
        }, () => {
          this.setMsgStatus(timestamp, 'failed')
        }
      )
    },
    sendImgMsg(img, timestamp) {
      if (!timestamp) {
        // 第一次发送
        const _URL = window.URL || window.webkitURL
        const imgSrc = _URL.createObjectURL(img)
        // 配置图片本地显示
        timestamp = new Date().getTime()
        const imgData = {
          big: imgSrc,
          small: imgSrc
        }
        this.afterSendC2CImgMsgs(timestamp, imgData, img)
      } else {
        // 重发
        // 重置消息状态
        this.setMsgStatus(timestamp, 'pending')
      }

      return new Promise(async(resolve) => {
        resolve()
        // IM 封装上传/发送图片
        const info = {
          msg: '图片消息',
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
          avatar: this.userInfo.userId,
          toUserName: this.csInfo.csNick || this.csInfo.csName,
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          identifier: this.userInfo.userId,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_img,
          chatType: this.sendType,
          timestamp
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
      } else {
        // 重置消息状态
        this.setMsgStatus(timestamp, 'pending')
      }

      this.roomMode !== roomStatus.AIChat && IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csNick || this.csInfo.csName,
          msg: `小华表情`,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
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
    sendCustomDirective({ msg, msgStatus, msgType, MsgLifeTime }) {
      IM.sendNormalMsg(
        this.userInfo.userId,
        this.csInfo.csId,
        // '123456789',
        {
          sessionId: this.sessionId,
          chatGuid: this.chatGuid,
          toUserName: this.csInfo.csNick || this.csInfo.csName,
          msg,
          time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
          nickName: this.userInfo.nickName || this.userInfo.userName,
          avatar: this.userInfo.userId,
          identifier: this.userInfo.userId,
          msgStatus,
          msgType,
          MsgLifeTime,
          chatType: this.sendType
        }, () => {
          console.log('客户端发送自定义自定义指令成功')
        }, err => {
          console.log('客户端发送自定义自定义指令失败，err', err)
        }
      )
    },
    afterSendC2CTextMsgs(timestamp, text) {
      const msg = {
        nickName: this.userInfo.nickName,
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
      this.sendMsgs([msg])
    },
    afterSendC2CGiftMsgs(timestamp, giftInfo) {
      const msg = {
        nickName: this.userInfo.nickName,
        avatar: this.userInfo.userId,
        content: `${this.userInfo.nickName}给你送了一个礼物`,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_gift,
        chatType: this.sendType,
        giftInfo
      }
      this.sendMsgs([msg])
    },
    afterSendC2CLikeMsgs(timestamp) {
      const msg = {
        nickName: this.userInfo.nickName,
        avatar: this.userInfo.userId,
        content: `我${this.userInfo.nickName}给你点赞`,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_liked,
        chatType: this.sendType
      }
      this.sendMsgs([msg])
    },
    afterSendC2CImgMsgs(timestamp, imgData, file_Obj) {
      // const fileObj = Tools.CopyTools.objWithTypeDeepClone(file_Obj)
      const fileObj = new File([file_Obj], file_Obj.name, { type: file_Obj.type })
      const msg = {
        nickName: this.userInfo.nickName,
        avatar: this.userInfo.userId,
        isSelfSend: true,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp,
        status: 'pending',
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_img,
        chatType: this.sendType,
        fileObj,
        imgData
      }
      this.sendMsgs([msg])
    },
    afterSendXiaoHuaExpress(timestamp, url) {
      const msg = {
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        timestamp: timestamp,
        status: 'pending',
        nickName: this.userInfo.nickName,
        avatar: this.userInfo.userId,
        isSelfSend: true,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_XH_express,
        chatType: this.sendType,
        imgData: {
          big: `/video/static/img/express/${url}.gif`,
          small: `/video/static/img/express/${url}.gif`
        }
      }
      this.sendMsgs([msg])
    },
    setMsgStatus(timestamp, status, ...msg) {
      const newMsgsList = this.msgs.map(item => {
        if (item.timestamp && (item.timestamp === timestamp)) {
          const currMsg = Tools.CopyTools.objDeepClone(item)
          // 缓存最后一条消息时间
          // status === 'succ' && (this.lastMsgTimestamp = currMsg.time)
          // 修改对应消息的状态
          currMsg.status = status

          if (status === 'succ' && currMsg.msgType === msgTypes.msg_img) {
            const imgMsg = msg[0]
            // 若为图片消息，则对应添加图片的真实地址
            currMsg.imgData = imgMsg.imgData
            // 添加进图片相册
            this.addPreviewImg({ msgsObj: imgMsg })
          }

          // 存缓存消息
          this.saveCurMsgs({ origin: this.userInfo.origin, msg: currMsg })
          // 更新服务状态时间戳
          Tools.CacheTools.updateCacheData({
            key: `${this.userInfo.origin}_curServInfo`,
            timestamp: new Date().getTime()
          })

          return currMsg
        } else {
          return item
        }
      })
      this.setMsgs(newMsgsList)
    },
    ...mapMutations({
      setMsgs: 'SET_MSGS'
    }),
    ...mapActions([
      'sendMsgs',
      'saveCurMsgs',
      'addPreviewImg'
    ])
  }
}

export const getMsgsMixin = {
  computed: {
    ...mapGetters([
      'userInfo',
      'sessionList'
    ])
  },
  data() {
    return {
      historyMsgs: [],
      pulldownResult: '加载历史消息成功',
      MsgsLoader: null,
      cacheMsgsPage: 1,
      cacheMsgsOver: false
    }
  },
  methods: {
    /* 获取当天会话列表 */
    async requestSessionList(userId) {
      const res = await getSessionList(userId)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 会话列表 辣 =============================')
        this.setSessionList(res.data.sessionList.length ? res.data.sessionList : [])
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
    /* 消息加时间装饰 */
    timeTipsFormat(list) {
      let timeCache = list[0].time
      return list.length
        ? list.reduce((val, item) => {
          // 格式化timestamp
          const temp = `history_${Tools.randomMin2Max(1000)(9999)}`
          if (item.timestamp) {
            item.timestamp += `_${temp}`
          } else {
            item.timestamp = temp
          }
          // 加入时间tip
          if (Tools.DateTools.isTimeDiffLongEnough(timeCache, item.time)) {
            val.push({
              content: item.time,
              time: item.time,
              msgStatus: msgStatus.tip,
              msgType: tipTypes.tip_time
            })
            timeCache = item.time
          }
          return val.concat(item)
        }, [])
        : []
      // list.length && list.forEach((item, i) => {
      //   if (item.timestamp) {
      //     item.timestamp += `_history_${Tools.randomMin2Max(1000)(9999)}`
      //   } else {
      //     item.timestamp = `history_${Tools.randomMin2Max(1000)(9999)}`
      //   }
      //   if (Tools.DateTools.isTimeDiffLongEnough(timeCache, item.time) || i === 0) {
      //     map.push({
      //       content: item.time,
      //       time: item.time,
      //       msgStatus: msgStatus.tip,
      //       msgType: tipTypes.tip_time
      //     })
      //     timeCache = item.time
      //   }
      //   map.push(item)
      // })
      // return map
    },
    /* 拉取消息（漫游消息，历史消息） */
    async requestMsgsMixin() {
      let newMsgs = []
      if (this.sessionList === null) {
        // 从缓存中拉取消息
        if (this.cacheMsgsOver) return
        newMsgs = await this.getRoamMsgs({ origin: this.$route.query.origin || 'WE', page: this.cacheMsgsPage++ })
      } else {
        // 根据sessionList拉取消息
        // 初始化
        !this.MsgsLoader && this.initMsgLoader()
        // 拉取消息
        newMsgs = await this.MsgsLoader.getMsgs()
      }

      if (newMsgs && newMsgs.length) {
        const list = this.timeTipsFormat(newMsgs)
        this.historyMsgs = [...list, ...this.historyMsgs]
        // list.concat(this.historyMsgs)
        // 过滤出所有的图片消息，添加到previewImg队头
        const imgList = this.getAllImg(list)
        this.previewImgList = [...imgList, ...this.previewImgList]
        // imgList.concat(this.previewImgList)
      } else {
        // 没有更多数据
        this.pulldownResult = '别拉了，没有更多消息了！！！'
        this.cacheMsgsOver = true
      }
      return newMsgs
    },
    getAllImg(list) {
      return list.reduce((val, item) => {
        if (item.msgType === msgTypes.msg_img) {
          const data = item.imgData
          val.push({
            src: data.big,
            msrc: data.small,
            w: data.w,
            h: data.h,
            id: item.timestamp || `${new Date().getTime()}_${Tools.randomMin2Max(1000, 9999)}`
          })
        }
        return val
      }, [])
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
    },
    ...mapMutations({
      setSessionList: 'SET_SESSION_LIST'
    }),
    /* Action */
    ...mapActions([
      'getRoamMsgs'
    ])
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
      'sessionRamId',
      'chatGuid',
      'sendType'
    ])
  },
  methods: {
    async enterOnLineLineUp() {
      this.$router.replace({path: `/room/chat?openId=${this.userInfo.openId}&origin=${this.userInfo.origin}&csId=wait_for_distribution`})
      // // 排队成功，直接通知坐席
      // this.setChatGuid(new Date().getTime())
      // const msg = {
      //   code: systemMsgStatus.ONLINE_REQUEST_CS_ENTANCE,
      //   chatGuid: this.chatGuid,
      //   csId: 'webchat2',
      //   csName: 'webchat2',
      //   csNick: '我才是csNick',
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
      !this.sessionId && await this.initSession()
      this.setChatGuid(new Date().getTime())
      const option = {
        chatGuid: `${this.chatGuid}`,
        customerGuid: `${this.userInfo.userId}`,
        customerImg: '',
        customerNick: this.userInfo.nickName || this.userInfo.userName,
        identity: this.userInfo.userGrade,
        robotSessionId: this.sessionRamId,
        origin: this.userInfo.origin || 'WE',
        callType: 'ZX',
        type: '2'
      }
      const res = await onLineQueue(option)
      const data = res.data.data
      if (res.data.result_code === '200' || res.data.result_code === '450') {
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
            csNick: data.userNick || '',
            isTeam: data.team,
            startTime: data.queueStartTime,
            endTime: data.queueEndTime,
            welcomeText: data.content || ''
          }
        }
        // }
      } else if (res.data.result_code === '451') {
        this.beforeQueue({
          mode: roomStatus.menChat,
          content: `尊敬的${+this.userInfo.userGrade <= 3 ? this.userInfo.userGradeName : ''}客户，正在为您转接人工客服，请稍后。`
        })
        // 服务中
        return {
          code: '0',
          data: {
            isConnect: true,
            csId: data.csId || '',
            csName: data.csName || '',
            csNick: data.csName || '',
            welcomeText: data.content || '',
            chatGuid: +data.chatGuid || '',
            sessionId: data.personSessionId || ''
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
        this.sendMsgs([tip])
      }
      return {
        code: '1',
        data: '请留言'
      }
    },
    async handleQueueRes(data) {
      // 超时配置
      const zxConnectTimeout = await this.systemConfig('zxConnectTimeout')

      /**
       * 重连
       */
      if (data.isConnect) {
        const { welcomeText, chatGuid, csId, csNick, personSessionId } = data
        // 设置坐席信息
        this.setCsInfo({ welcomeText })
        // 设置chatGuid
        this.setChatGuid(chatGuid)
        // 发送重连消息
        IM.sendNormalMsg(
          this.userInfo.userId,
          csId,
          {
            sessionId: personSessionId,
            chatGuid,
            toUserName: csNick,
            msg: '客户重连成功',
            time: Tools.DateTools.formatDate('yyyy-MM-dd hh:mm:ss'),
            nickName: this.userInfo.nickName || this.userInfo.userName,
            avatar: this.userInfo.userId,
            identifier: this.userInfo.userId,
            msgStatus: msgStatus.msg,
            msgType: msgTypes.msg_normal,
            chatType: roomStatus.menChat,
            MsgLifeTime: 0
          })
        // action 排队完成，进入会话
        return this.afterQueueSuccess({
          mode: roomStatus.menChat,
          msgsObj: data
        })
      }

      /**
       * 正常排队
       */
      if (!data.isTeam) {
        const csInfo_onLine = {
          welcomeText: data.welcomeText
        }
        // 设置坐席信息
        this.setCsInfo(csInfo_onLine)
        // 排队成功，直接通知坐席
        const msg = {
          code: systemMsgStatus.ONLINE_REQUEST_CS_ENTANCE,
          csId: data.csId,
          csName: data.csName || '',
          csNick: data.csNick || '',
          queueStartTime: data.startTime,
          queueEndTime: data.endTime
        }
        const config = await this.configSendSystemMsg(msg)
        await IM.sendSystemMsg(config)

        this.reqTransAnotherTimeout(zxConnectTimeout.get()).then(state => {
          if (state === '480') {
            // 坐席端已经转接成功，直接接通坐席即可
            return undefined
          }
          // 客服转接定时器
          const ONLINE_CS_REQ_TRANS_FAIL_msg = {
            code: systemMsgStatus.ONLINE_CS_REQ_TRANS_FAIL,
            csId: msg.csId
          }
          this.reqTransTimeout({
            msg: ONLINE_CS_REQ_TRANS_FAIL_msg,
            toast: this.$vux.toast,
            delay: zxConnectTimeout.get()
          }).then(() => {
            this.afterQueueFailed({ sendFailed: true })
          })
        }, (err) => {
          // 失败回调
          console.log(err)
          this.afterQueueFailed({ sendFailed: false })
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
        this.sendMsgs([msg])
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
        origin: this.userInfo.origin || 'WE',
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
          origin: this.userInfo.origin || 'WE',
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
      const id = this.heartBeatTimer
      clearInterval(id)
      if (this.heartBeatReq) {
        this.heartBeatReq = null
        this.heartBeatTimer = 0
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
      this.sendMsgs([msg])
    },
    pushNormalTipMsg(content) {
      const tip = {
        content,
        time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
        msgStatus: msgStatus.tip,
        msgType: tipTypes.tip_normal
      }
      this.sendMsgs([tip])
    },
    ...mapMutations({
      setCsInfo: 'SET_CS_INFO',
      sendMsgs: 'SET_MSGS',
      setQueueMode: 'SET_QUEUE_MODE',
      setQueueNum: 'SET_QUEUE_NUM',
      setChatGuid: 'SET_CHAT_GUID'
    }),
    ...mapActions([
      'systemConfig',
      'beforeQueue',
      'configSendSystemMsg',
      'reqTransAnotherTimeout',
      'reqTransTimeout',
      'afterQueueSuccess',
      'afterQueueFailed'
    ])
  }
}
