import * as types from './mutation-types'
import { roomStatus, queueStatus } from '@/common/js/status'

export const enterToLineUp = function({commit, state}) {
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_QUEUE_MODE, queueStatus.queuing)
}

export const readyToVideoChat = function({commit, state}) {
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_QUEUE_MODE, queueStatus.queueOver)
  commit(types.SET_ROOM_MODE, roomStatus.videoChat)
}
