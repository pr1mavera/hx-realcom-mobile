import * as types from './mutation-types'
import { sleep } from '@/common/js/util'
import { isTimeDiffLongEnough } from '@/common/js/dateConfig.js'
import { sessionStatus, toggleBarStatus, roomStatus, queueStatus, msgStatus, tipTypes } from '@/common/js/status'
import { ERR_OK, createSession } from '@/server/index.js'

export const closeBarBuffer = function({ commit }, { mutationType, delay }) {
  return (async function() {
    commit(mutationType, false)
    await sleep(delay)
  })()
}

export const toggleBar = function({ dispatch, commit, state }, type) {
  switch (type) {
    case toggleBarStatus.allFold:
      commit(types.SET_EXTEND_BAR, false)
      commit(types.SET_INPUT_BAR, false)
      break
    case toggleBarStatus.inputBar:
      if (state.extendBarOpen) {
        return dispatch('closeBarBuffer', {
          mutationType: types.SET_EXTEND_BAR,
          delay: 1000
        }).then(() => {
          return new Promise((resolve) => {
            commit(types.SET_INPUT_BAR, true)
            resolve()
          })
        })
      } else {
        return new Promise((resolve) => {
          commit(types.SET_INPUT_BAR, true)
          resolve()
        })
      }
    case toggleBarStatus.extendBar:
      // 如果当前键盘状态为弹出，则关闭键盘除了修改状态外还需要其他操作，所以判断单独在外面做
      // 这里只修改extendBar的打开状态
      commit(types.SET_EXTEND_BAR, true)
      break
  }
}

export const enterToLineUp = function({ commit, state }) {
  commit(types.SET_QUEUE_MODE, queueStatus.queuing)
}

export const readyToVideoChat = function({ commit, state }) {
  commit(types.SET_QUEUE_MODE, queueStatus.queueOver)
  commit(types.SET_ROOM_MODE, roomStatus.videoChat)
}

export const quitVideoChat = function({ commit, state }) {
  commit(types.SET_CS_INFO, null)
  commit(types.SET_ROOM_ID, '')
  commit(types.SET_QUEUE_NUM, 0)
  commit(types.SET_QUEUE_MODE, queueStatus.noneQueue)
  commit(types.SET_ROOM_MODE, roomStatus.AIChat)
  initSession({ commit, state })
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

export const sendMsgs = async function({ commit, state }, msgs) {
  if (msgs[0].msgStatus === msgStatus.msg) {
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
    if (lastT && isTimeDiffLongEnough(lastT, msgs[0].time)) {
      const tip = [{
        content: msgs[0].time,
        time: msgs[0].time,
        msgStatus: msgStatus.tip,
        msgType: tipTypes.tip_normal
      }]
      await commit(types.SET_MSGS, state.msgs.concat(tip))
    }
  }
  await commit(types.SET_MSGS, state.msgs.concat(msgs))
}
