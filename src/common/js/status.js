// const env = process.env.NODE_ENV
// const imgPathMode = {
//   production: '/video/static/img',
//   development: '/static/img'
// }
// export const imgPath = env === 'production' ? imgPathMode.production : imgPathMode.development

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
  robot: 1, // 机器人
  video: 2, // 视频
  onLine: 3, // 在线
  website: 4 // 官网
}

export const systemMsgStatus = {
  queuesReduce: 0, // 人数减少
  queuesSuccess: 1, // 客户端排队成功
  requestCsEntance: 2, // 座席端视频接入请求
  transSessionId: 3 // 座席端创建会话传递
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
  tip_fail: '3',
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
  msg_card: '8' // 名片消息
}

export const dialogTypes = {
  dialog_success: '1', // 转接成功
  dialog_disconnect: '0'// 断开连接
}

export const cardTypes = {
  bot_card: '0' // 刚进入时机器人卡片
}
