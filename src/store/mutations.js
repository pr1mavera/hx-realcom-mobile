import * as types from './mutation-types'

const mutations = {
  [types.SET_USER_INFO](state, info) {
    state.userInfo = info
  },
  [types.SET_BOT_INFO](state, info) {
    state.botInfo = info
  },
  [types.SET_CS_INFO](state, info) {
    state.csInfo = info
  },
  [types.SET_ROOM_ID](state, id) {
    state.roomId = id
  },
  [types.SET_SESSION_ID](state, id) {
    state.sessionId = id
  },
  [types.SET_MSGS](state, msgs) {
    state.msgs = msgs
  },
  [types.SET_EXTEND_BAR](state, option) {
    state.extendBarOpen = option
  },
  [types.SET_INPUT_BAR](state, option) {
    state.inputBarOpen = option
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_ROOM_MODE](state, mode) {
    state.roomMode = mode
  },
  [types.SET_QUEUE_MODE](state, mode) {
    state.queueMode = mode
  },
  [types.SET_QUEUE_NUM](state, num) {
    state.queueNum = num
  }
}

export default mutations
