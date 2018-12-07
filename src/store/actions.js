import * as types from './mutation-types'
import Tools from '@/common/js/tools'
import IM from '@/server/im'
// import { isTimeDiffLongEnough, formatDate } from '@/common/js/dateConfig.js'
import { sessionStatus, toggleBarStatus, roomStatus, queueStatus, msgStatus, msgTypes, dialogTypes, tipTypes, systemMsgStatus } from '@/common/js/status'
import { ERR_OK, createSession, getCsAvatar, transTimeoutRedistribution } from '@/server/index.js'

// 键盘弹出延迟（弃用）
export const closeBarBuffer = async function({ commit }, { mutationType, delay }) {
  commit(mutationType, false)
  await Tools.AsyncTools.sleep(delay)
}

// 修改键盘和拓展层的弹出状态，统一接口
export const toggleBar = async function({ dispatch, commit, state }, type) {
  switch (type) {
    case toggleBarStatus.allFold:
      commit(types.SET_EXTEND_BAR, false)
      commit(types.SET_INPUT_BAR, false)
      return 0
    case toggleBarStatus.inputBar:
      if (state.extendBarOpen) {
        // await dispatch('closeBarBuffer', {
        //   mutationType: types.SET_EXTEND_BAR,
        //   delay: 1000
        // })
        commit(types.SET_EXTEND_BAR, false)
      }
      commit(types.SET_INPUT_BAR, true)
      return 0
    case toggleBarStatus.extendBar:
      // 如果当前键盘状态为弹出，则关闭键盘除了修改状态外还需要其他操作，所以判断单独在外面做
      // 这里只修改extendBar的打开状态
      commit(types.SET_EXTEND_BAR, true)
      return 0
  }
}

// 进入排队(人工，视频)时的tips
export const beforeQueue = function({ commit, state }, { mode, content }) {
  commit(types.SET_QUEUE_MODE, {
    mode,
    status: queueStatus.queuing
  })
  const tip = [{
    content,
    time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    msgStatus: msgStatus.tip,
    msgType: tipTypes.tip_normal
  }]
  commit(types.SET_MSGS, state.msgs.concat(tip))
}

// 人工（视频）排队完成，接通客服后，修改对应的房间模式
export const afterQueueSuccess = function({ commit, state }, { mode, msgsObj }) {
  // 排队状态
  commit(types.SET_QUEUE_MODE, {
    mode,
    status: queueStatus.queueOver
  })
  if (mode === roomStatus.videoChat) {
    // 房间状态
    commit(types.SET_ROOM_MODE, roomStatus.videoChat)
    const tip = {
      content: `视频客服${state.csInfo.csName}转接成功，祝您沟通愉快！`,
      time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      msgStatus: msgStatus.tip,
      msgType: tipTypes.tip_success
    }
    commit(types.SET_MSGS, state.msgs.concat(tip))
  } else if (mode === roomStatus.menChat) {
    // 清空转接定时器
    state.userInfo.transTimeout && clearTimeout(state.userInfo.transTimeout)
    // 设置坐席信息
    const csInfo_onLine = Tools.CopyTools.objDeepClone(state.csInfo)
    csInfo_onLine.csId = msgsObj.csId
    csInfo_onLine.csAvatar = getCsAvatar(msgsObj.csId)
    csInfo_onLine.csName = msgsObj.csName
    commit(types.SET_CS_INFO, csInfo_onLine)
    // action 删除msgs中排队状态的tips
    deleteTipMsg({ commit, state })
    // 设置会话ID
    commit(types.SET_SESSION_ID, msgsObj.sessionId)
    // 房间状态
    commit(types.SET_ROOM_MODE, roomStatus.menChat)
    const tip = {
      content: `人工客服${state.csInfo.csName}转接成功，祝您沟通愉快！`,
      time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      msgStatus: msgStatus.tip,
      msgType: tipTypes.tip_success
    }
    commit(types.SET_MSGS, state.msgs.concat(tip))
    // 发送欢迎语
    const msg = {
      nickName: state.csInfo.csName,
      avatar: state.csInfo.csId,
      content: state.csInfo.welcomeText,
      isSelfSend: false,
      time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      timestamp: new Date().getTime(),
      msgStatus: msgStatus.msg,
      msgType: msgTypes.msg_normal,
      chatType: state.sendType
    }
    commit(types.SET_MSGS, state.msgs.concat(msg))
    // action 初始化用户最后响应时间
    updateLastAction({ commit, state })
    // 存本地localstorage
    Tools.CacheTools.setCacheData({
      key: 'curServInfo',
      check: state.userInfo.openId,
      data: Object.assign({}, {
        csInfo: csInfo_onLine,
        sessionId: state.sessionId,
        chatGuid: state.chatGuid,
        roomMode: roomStatus.menChat,
        msgs: state.msgs
      })
    })
  }
}

// 排队失败
export const afterQueueFailed = function({ commit, state }) {
  commit(types.SET_QUEUE_MODE, {
    mode: roomStatus.AIChat,
    status: queueStatus.noneQueue
  })
  commit(types.SET_QUEUE_NUM, 0)
  const tip = {
    content: '转接失败',
    time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    msgStatus: msgStatus.tip,
    msgType: tipTypes.tip_fail
  }
  commit(types.SET_MSGS, state.msgs.concat([tip]))
}

// 配置排队成功后给坐席推送接入信息
export const configSendSystemMsg = function({ state }, msgsObj) {
  return {
    userId: msgsObj.csId,
    msgBody: {
      data: {
        code: msgsObj.code,
        chatGuid: state.chatGuid,
        csId: msgsObj.csId,
        csName: msgsObj.csName || msgsObj.csId,
        userId: state.userInfo.userId,
        userAvatar: state.userInfo.avatar,
        userName: state.userInfo.userName,
        nickName: state.userInfo.nickName,
        userPhone: state.userInfo.userPhone,
        openId: state.userInfo.userId,
        origin: 'WE',
        robotSessionId: state.sessionId,
        accessId: msgsObj.accessId || '',
        queueStartTime: msgsObj.startTime,
        queueEndTime: msgsObj.endTime
      },
      desc: '',
      ext: ''
    }
  }
}

// 人工客服排队完成后，删除消息队列里的排队状态tips
export const deleteTipMsg = function({ commit, state }) {
  for (let i = state.msgs.length - 1; i >= 0; i--) {
    if (state.msgs[i].msgStatus === msgStatus.tip && state.msgs[i].msgType === tipTypes.tip_line_up) {
      const list = Tools.CopyTools.objDeepClone(state.msgs)
      list.splice(i, 1)
      commit(types.SET_MSGS, list)
      break
    }
  }
}

// 人工（视频）服务结束后，更新 vuex 数据
export const afterServerFinish = function({ commit, state }, mode) {
  commit(types.SET_CS_INFO, {})
  commit(types.SET_QUEUE_NUM, 0)
  commit(types.SET_QUEUE_MODE, {
    mode: roomStatus.AIChat,
    status: queueStatus.noneQueue
  })
  commit(types.SET_ASSESS_STATUS, false)
  commit(types.SET_SERVER_TIME, '')
  commit(types.SET_ROOM_MODE, roomStatus.AIChat)
  initSession({ commit, state })
  const tip = [{
    content: '本次服务已结束，如需继续咨询，请重新联系客服',
    time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    msgStatus: msgStatus.tip,
    msgType: tipTypes.tip_normal
  }]
  commit(types.SET_MSGS, state.msgs.concat(tip))
  if (mode === sessionStatus.video) {
    commit(types.SET_ROOM_ID, '')
  } else
  if (mode === sessionStatus.onLine) {
    // 清空定时器
    clearTimeout(state.userInfo.actionTimeout)
    const userInfo = Tools.CopyTools.objShallowClone(state.userInfo)
    userInfo.actionTimeout = null
    commit(types.SET_USER_INFO, userInfo)
  }
}

// 创建会话
export const initSession = async function({ commit, state }) {
  // 创建机器人会话
  const res = await createSession(state.userInfo.userId, state.userInfo.userName, state.userInfo.userPhone, sessionStatus.robot)
  if (res.result.code === ERR_OK) {
    console.log('============================= 会话创建成功 辣 =============================')
    commit(types.SET_SESSION_ID, res.data.id)
    return 0
  } else {
    console.log('============================= 会话创建失败 辣 =============================')
  }
}

// 排队成功转接超时时，调用转接另一坐席接口
export const reqTransAnotherTimeout = function({ commit, state }, delay) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(async() => {
      // 转接至另外坐席
      const res = await transTimeoutRedistribution({
        userId: `${state.userInfo.userId}`,
        origin: 'WE',
        callType: 'ZX',
        sessionId: `${state.chatGuid}`,
        chatResult: '02',
        desc: '坐席转接超时，客户端请求转接其他客服',
        againAllot: true
      })
      if ((res.result.code === ERR_OK) && (res.data.status.result_code === '200')) {
        // 发送排队成功的消息给坐席
        const data = res.data.status.data
        const onlineQueueSuccMsg = {
          code: systemMsgStatus.ONLINE_REQUEST_CS_ENTANCE,
          csId: data.userCode,
          startTime: data.queueStartTime,
          endTime: data.queueEndTime
        }
        const onlineConfig = await configSendSystemMsg({ state }, onlineQueueSuccMsg)
        await IM.sendSystemMsg(onlineConfig)
        resolve()
      } else {
        const err = 'error in transTimeoutRedistribution 转接至另外坐席'
        reject(err)
      }
      // 清空定时器
      timer && clearTimeout(timer)
    }, delay)
    const userInfo = Tools.CopyTools.objShallowClone(state.userInfo)
    userInfo.transTimeout = timer
    commit(types.SET_USER_INFO, userInfo)
  })
}

// 排队成功定时器，一定时间内坐席没转接则提示转接失败
export const reqTransTimeout = function({ commit, state }, { msg, toast, delay = 0 }) {
  return new Promise((resolve) => {
    const timer = setTimeout(async() => {
      // 坐席长时间未转接，推送消息到坐席转接失败
      if (msg) {
        const onlineConfig = await configSendSystemMsg({ state }, msg)
        IM.sendSystemMsg(onlineConfig)
      }
      // 本地提示转接失败
      toast.text('转接失败，请重试', 'default')
      await Tools.AsyncTools.sleep(2000)
      // 回调
      resolve()
      // 清空定时器
      timer && clearTimeout(timer)
    }, delay)
    const userInfo = Tools.CopyTools.objShallowClone(state.userInfo)
    userInfo.transTimeout = timer
    commit(types.SET_USER_INFO, userInfo)
  })
}

// 更新用户最后活动时间（更新定时器）
export const updateLastAction = function({ commit, state }) {
  // 清空原来的定时器
  state.userInfo.actionTimeout && clearTimeout(state.userInfo.actionTimeout)

  // 创建定时器，绑定在 vuex 的 userInfo
  const actionTimeout = setTimeout(async() => {
    // 用户长时间无响应，主动断开连接
    const sysMsgs = {
      code: systemMsgStatus.ONLINE_USER_ACTION_ENDING_SESSION,
      csId: state.csInfo.csId
    }
    const onlineConfig = await configSendSystemMsg({ state }, sysMsgs)
    IM.sendSystemMsg(onlineConfig)

    // 推送超时断开连接提示，至本地消息队列
    const dialog = {
      time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      msgStatus: msgStatus.dialog,
      msgType: dialogTypes.dialog_disconnect,
      dialogInfo: {
        disconnectTime: 5
      }
    }
    commit(types.SET_MSGS, state.msgs.concat(dialog))
  }, 300000)

  const userInfo = Tools.CopyTools.objShallowClone(state.userInfo)
  userInfo.actionTimeout = actionTimeout
  commit(types.SET_USER_INFO, userInfo)
}

// 更新本地消息队列
export const sendMsgs = async function({ commit, state }, msg) {
  if (msg.msgStatus !== msgStatus.tip) {
    let lastT = null
    // 缓存最后一条信息的时间
    for (let i = state.msgs.length - 1; i > 0; i--) {
      if (state.msgs[i].msgStatus === msgStatus.msg) {
         lastT = state.msgs[i].time
         break
      }
      console.log(`------------------------------------- 循环了 ${i} -------------------------------------`)
    }
    // 若间隔时间大于约定时间，则生成时间信息tip
    if (lastT && Tools.DateTools.isTimeDiffLongEnough(lastT, msg.time)) {
      const tip = {
        content: msg.time,
        time: msg.time,
        msgStatus: msgStatus.tip,
        msgType: tipTypes.tip_time
      }
      commit(types.SET_MSGS, state.msgs.concat([tip]))
    }
  }
  if ((state.roomMode === roomStatus.menChat) && msg.isSelfSend) {
    // 更新用户最后活动时间（更新定时器）
    updateLastAction({ commit, state })
  }
  commit(types.SET_MSGS, state.msgs.concat([msg]))
  return 0
}
