// 用户基本信息
export const userInfo = state => state.userInfo
// 机器人基本信息
export const botInfo = state => state.botInfo
// 当前客服基本信息
export const csInfo = state => state.csInfo
// 房间Id（群Id）
export const roomId = state => state.roomId
// 会话房间ID（包括机器人，人工客服，视频客服）
export const sessionId = state => state.sessionId
// 聊天信息队列
export const msgs = state => state.msgs
// 拓展输入打开状态
export const extendBarOpen = state => state.extendBarOpen
// 软键盘打开状态
export const inputBarOpen = state => state.inputBarOpen
// videoBar全屏状态
export const fullScreen = state => state.fullScreen
// 当前会话模式（机器人，人工客服，视频客服）
export const roomMode = state => state.roomMode
// 当前排队状态
export const queueMode = state => state.queueMode
// 排队人数
export const queueNum = state => state.queueNum
