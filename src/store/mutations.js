import * as types from './mutation-types'

const mutations = {
  [types.SET_USER_INFO](state, info) {
    state.userInfo = info
  },
  [types.SET_ROOM_ID](state, id) {
    state.roomId = id
  },
  [types.SET_MSGS](state, msgs) {
    state.msgs = msgs
  },
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  [types.SET_ROOM_MODE](state, mode) {
    state.roomMode = mode
  },
  [types.SET_QUEUE_MODE](state, mode) {
    state.queueMode = mode
  }
}

export default mutations
