import { roomStatus, queueStatus, themeMap } from '@/common/js/status'
import Tools from '@/common/js/tools'

const state = {
  theme: themeMap['normal'],
  sourceUrl: window.location.href,
  userInfo: {},
  botInfo: {},
  csInfo: {
    // csId: 'webchat2',
    // csAvatar: 'http://video-servertest.ihxlife.com:8083/api/v1/video/image/csHeader?id=webchat2',
    // csName: 'webchat2',
    // likesCount: 12,
    // csCode: 'webchat2'
  },
  roomId: null,
  sessionId: null,
  sessionRamId: Tools.getRamSessionId(),
  sessionList: null,
  chatGuid: null,
  msgs: [],
  previewImgList: [],
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
  assessTask: {
    csInfo: {},
    sessionId: '',
    chatGuid: '',
    mode: ''
  },
  serverTime: '',
  videoFilter: {
    blur: false,
    muted: false
  }
}

export default state
