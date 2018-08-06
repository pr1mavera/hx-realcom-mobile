// eslint-disable-next-line
import { roomMode, queueMode } from '@/common/js/config'

const state = {
  id: null,
  fullScreen: false, // 视频客服开启时，videoRoom的全屏或缩小状态
  roomMode: roomMode.AIChat,
  queueMode: null
}

export default state
