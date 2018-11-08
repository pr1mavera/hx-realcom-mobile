import * as types from './mutation-types'
import Tools from '@/common/js/tools'
// import { isTimeDiffLongEnough, formatDate } from '@/common/js/dateConfig.js'
import { sessionStatus, toggleBarStatus, roomStatus, queueStatus, msgStatus, tipTypes } from '@/common/js/status'
import { ERR_OK, createSession } from '@/server/index.js'

export const closeBarBuffer = function({ commit }, { mutationType, delay }) {
  return (async function() {
    commit(mutationType, false)
    await Tools.AsyncTools.sleep(delay)
  })()
}

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

export const enterToLineUp = function({ commit, state }, content) {
  commit(types.SET_QUEUE_MODE, queueStatus.queuing)
  const tip = [{
    content,
    time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    msgStatus: msgStatus.tip,
    msgType: tipTypes.tip_normal
  }]
  commit(types.SET_MSGS, state.msgs.concat(tip))
}

export const deleteTipMsg = function({ commit, state }) {
  for (let i = state.msgs.length - 1; i >= 0; i--) {
    if (state.msgs[i].msgStatus === msgStatus.tip && state.msgs[i].msgType === tipTypes.tip_line_up) {
      const list = Tools.CopyTools.objShallowClone(state.msgs)
      list.splice(i, 1)
      commit(types.SET_MSGS, list)
      break
    }
  }
}

export const queueFinishEnterRoom = function({ commit, state }, mode) {
  commit(types.SET_QUEUE_MODE, queueStatus.queueOver)
  if (mode === sessionStatus.video) {
    commit(types.SET_ROOM_MODE, roomStatus.videoChat)
    const tip = [{
      content: '视频客服转接成功，祝您沟通愉快！',
      time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      msgStatus: msgStatus.tip,
      msgType: tipTypes.tip_success
    }]
    commit(types.SET_MSGS, state.msgs.concat(tip))
  } else if (mode === sessionStatus.onLine) {
    commit(types.SET_ROOM_MODE, roomStatus.menChat)
    const tip = [{
      content: '人工客服转接成功，祝您沟通愉快！',
      time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
      msgStatus: msgStatus.tip,
      msgType: tipTypes.tip_success
    }]
    commit(types.SET_MSGS, state.msgs.concat(tip))
  }
}

export const resetVuexOption = function({ commit, state }, mode) {
  commit(types.SET_CS_INFO, {})
  commit(types.SET_QUEUE_NUM, 0)
  commit(types.SET_QUEUE_MODE, queueStatus.noneQueue)
  commit(types.SET_ASSESS_STATUS, false)
  commit(types.SET_SERVER_TIME, '')
  commit(types.SET_ROOM_MODE, roomStatus.AIChat)
  initSession({ commit, state })
  const tip = [{
    content: '服务结束，期待与您的下次对话！',
    time: Tools.DateTools.formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss'),
    msgStatus: msgStatus.tip,
    msgType: tipTypes.tip_normal
  }]
  commit(types.SET_MSGS, state.msgs.concat(tip))
  if (mode === sessionStatus.video) {
    commit(types.SET_ROOM_ID, '')
  }
  // else if (mode === sessionStatus.onLine) {
  //
  // }
}

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
      await commit(types.SET_MSGS, state.msgs.concat([tip]))
    }
  }
  msg.timestamp = new Date().getTime()
  await commit(types.SET_MSGS, state.msgs.concat([msg]))
}
