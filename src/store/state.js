// eslint-disable-next-line
import { roomStatus, queueStatus } from '@/common/js/status'

const state = {
  id: null,
  fullScreen: false, // 视频客服开启时，videoRoom的全屏或缩小状态
  roomMode: roomStatus.AIChat,
  queueMode: queueStatus.noneQueue
}

export default state
