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
  queueOver: 3, // 排队结束
  canselQueue: 4 // 取消排队
}

export const sessionStatus = {
  robot: '1', // 机器人
  video: '2', // 视频
  onLine: '3', // 在线
  website: '4' // 官网
}

export const systemMsgStatus = {
  // 0 - 19 视频
  video_queuesReduce: 0, // 人数减少
  video_queuesSuccess: 1, // 客户端排队成功
  video_requestCsEntance: 2, // 座席端视频接入请求
  video_transBaseInfo: 3, // 座席端创建会话传递
  // 20 - ~ 在线
  onLine_queuesReduce: 20, // 在线排队位置
  onLine_queuesSuccess: 21, // 客户端排队成功
  onLine_requestCsEntance: 22, // 座席端人工坐席接入请求
  onLine_transBaseInfo: 23, // 转接成功后人工坐席推送创建会话以及基本信息
  onLine_serverFinish: 24, // 坐席端结束会话（在线）
  onLine_userNoResponse: 25 // 客户端主动结束会话（在线）
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
  msg_hand_up: '24' // 结束会话（在线）
}

export const dialogTypes = {
  dialog_disconnect: '0', // 断开连接
  dialog_success: '1' // 转接成功
}

export const cardTypes = {
  bot_card: '0' // 刚进入时机器人卡片
}
