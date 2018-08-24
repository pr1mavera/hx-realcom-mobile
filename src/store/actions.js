import * as types from './mutation-types'
// import { debounce } from '@/common/js/util'
import { toggleBarStatus, roomStatus, queueStatus } from '@/common/js/status'

// eslint-disable-next-line
export const closeBarBuffer = function({ commit }, { mutationType, delay }) {
// export const closeBarBuffer = function({ commit }) {
  return new Promise((resolve) => {
    commit(mutationType, false)
    setTimeout(() => {
      resolve()
    }, delay)
    // debounce((resolve) => {
    //   resolve()
    // }, delay)()
  })
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
          commit(types.SET_INPUT_BAR, true)
          return new Promise((resolve) => {
            resolve()
          })
        })
        // return dispatch('closeBarBuffer').then(() => {
        //   commit(types.SET_INPUT_BAR, true)
        // })
      } else {
        commit(types.SET_INPUT_BAR, true)
        return new Promise((resolve) => {
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
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_QUEUE_MODE, queueStatus.queuing)
}

export const readyToVideoChat = function({ commit, state }) {
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_QUEUE_MODE, queueStatus.queueOver)
  commit(types.SET_ROOM_MODE, roomStatus.videoChat)
}
