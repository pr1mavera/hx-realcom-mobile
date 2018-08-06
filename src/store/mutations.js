import * as types from './mutation-types'

const mutations = {
  [types.SET_ID](state, id) {
    state.id = id
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
