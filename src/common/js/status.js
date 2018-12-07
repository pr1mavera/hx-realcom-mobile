export const CACHE_QUALITY_TIME = 1000 * 60 * 60 * 24 // 本地缓存过期时间（24小时）

export const toggleBarStatus = {
  allFold: 0,
  inputBar: 1, // 软键盘
  extendBar: 2 // 拓展层
}

export const roomStatus = { // 房间聊天状态
  AIChat: 0, // 机器人
  menChat: 1, // 人工
  videoChat: 2 // 视频
}

export const queueStatus = { // 排队状态
  noneQueue: 0, // 未排队
  queuing: 1, // 排队中
  queueSuccess: 2, // 排队成功
  queueOver: 3 // 排队结束
}

export const sessionStatus = {
  robot: '1', // 机器人
  video: '2', // 视频
  onLine: '3', // 在线
  website: '4' // 官网
}

export const systemMsgStatus = {
  // 0 - 19 视频
  VIDEO_QUEUES_REDUCE: 0, // 人数减少
  VIDEO_QUEUES_SUCCESS: 1, // 客户端排队成功
  VIDEO_REQUEST_CS_ENTENCE: 2, // 座席端视频接入请求
  VIDEO_TRANS_BASE_INFO: 3, // 座席端创建会话传递
  VIDEO_CS_INIT_SESSIONID_FAIL: 4, // 坐席端创建会话失败（视频）(坐席 -> 用户)
  VIDEO_CS_REQ_TRANS_FAIL: 5, // 坐席端转接超时（视频）
  // 20 - ~ 在线
  ONLINE_QUEUES_REDUCE: 20, // 在线排队位置(system -> 用户)
  ONLINE_QUEUES_SUCCESS: 21, // 客户端排队成功(system -> 用户)
  ONLINE_REQUEST_CS_ENTANCE: 22, // 座席端人工坐席接入请求(用户 -> 坐席)
  ONLINE_TRANS_BASE_INFO: 23, // 转接成功后人工坐席推送创建会话以及基本信息(坐席 -> 用户)
  ONLINE_SERVER_FINISH: 24, // 坐席端结束会话（在线）(坐席 -> 用户)
  ONLINE_USER_ACTION_ENDING_SESSION: 25, // 客户端主动结束会话（在线）(用户 -> 坐席)
  ONLINE_CS_INIT_SESSIONID_FAIL: 26, // 坐席端创建会话失败（在线）(坐席 -> 用户)
  ONLINE_CS_REQ_TRANS_FAIL: 27 // 坐席端转接超时（在线）(用户 -> 坐席)
}

export const msgStatus = {
  tip: '0',
  msg: '1',
  dialog: '2',
  card: '3'
}

export const tipTypes = {
  tip_time: '0', // 会话时间标签
  tip_normal: '1', // 纯文本标签
  tip_success: '2', // 转接成功
  tip_fail: '3', // 转接失败
  tip_line_up: '4' // 排队人数以及取消排队标签
}

export const msgTypes = {
  msg_normal: '0', // 基础文本会话
  msg_hot: '1', // 热点问题(机器人)
  msg_guess: '2', // 猜问题(机器人)
  msg_leave: '3', // 请留言(机器人)
  msg_no_idea: '4', // 直接转人工(机器人)
  msg_img: '5', // 发送图片
  msg_gift: '6', // 礼物消息
  msg_liked: '7', // 点赞消息
  msg_card: '8', // 名片消息
  msg_assess: '9', // 评价消息
  msg_XH_express: '10', // 小华表情消息
  msg_bot_thanks: '11', // 小华感谢消息
  msg_hand_up: '24' // 结束会话（在线）
}

export const dialogTypes = {
  dialog_disconnect: '0', // 断开连接
  dialog_success: '1' // 转接成功
}

export const cardTypes = {
  bot_card: '0' // 刚进入时机器人卡片
}
