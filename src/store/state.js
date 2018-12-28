import { roomStatus, queueStatus } from '@/common/js/status'
import Tools from '@/common/js/tools'

const state = {
  userInfo: {},
  botInfo: {},
  csInfo: {
    // csId: '123456789',
    // csAvatar: 'http://video-servertest.ihxlife.com:8083/api/v1/video/image/csHeader?id=123456789',
    // csName: '贾少游',
    // likesCount: 12,
    // csCode: '123456789'
  },
  roomId: null,
  sessionId: null,
  sessionRamId: Tools.getRamSessionId(),
  sessionList: null,
  chatGuid: null,
  msgs: [],
  extendBarOpen: false,
  inputBarOpen: false,
  fullScreen: true, // 视频客服开启时，videoRoom的全屏或缩小状态
  roomMode: roomStatus.AIChat,
  // roomMode: roomStatus.videoChat,
  queueMode: {
    mode: roomStatus.AIChat,
    status: queueStatus.noneQueue
  },
  queueNum: 0,
  hasAssess: false,
  isAssessView: false,
  serverTime: '',
  videoFilter: false
}

export default state
