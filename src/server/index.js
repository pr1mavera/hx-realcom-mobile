import http from './request'

// 错误状态码
export const ERR_OK = '0'

// 获取微信签名
export const wxConfig = url => http.get('video', `/wxConfig?url=${url}`)

/**
 ************************************ RTCRoom ************************************
 */

/**
 * [getLoginInfo 获取用户登录信息]
 */
export const getLoginInfo = userId => http.get('RTCRoom', `/im/account/login?userId=${userId}`)

/**
 * [pushSystemMsg 推送系统消息]
 */
export const pushSystemMsg = data => http.post('RTCRoom', '/im/msg/push', data)

/**
 * [syncGroupC2CMsg 拉取漫游消息]
 */
export const syncGroupC2CMsg = data => http.post('RTCRoom', '/syncGroupC2CMsg', data)

/**
 * [videoQueue 客户端视频排队]
 */
export const videoQueue = (userId, csId, priority) => http.post('RTCRoom', '/video/user/queue', { userId, csId, priority })

/**
 * [videoQueueCancel 客户端视频取消排队]
 */
export const videoQueueCancel = (userId, csId) => http.post('RTCRoom', '/video/user/queue/cancel', { userId, csId })

/**
 * [videoQueueHeartBeat 客户端排队心跳]
 */
export const videoQueueHeartBeat = (roomId, userId) => http.post('RTCRoom', '/comm/room/heartbeat', { roomId, userId, beatType: 0 })

/**
 ************************************ video ************************************
 */

/**
 * [getImgUrl 获取照片流请求统一路径]
 */
export const getImgUrl = imgUrl => http.url('video', `/video/image/get?imgUrl=${imgUrl}`)

// 获取客服生活照servertest.ihxlife.com:8083/api/v1/video/image/csPhoto?id=1
export const csPhoto = id => http.url('video', `/video/image/csPhoto?id=${id}`)

/**
 * [getUserInfoByOpenID 获取用户基本信息]
 */
export const getUserInfoByOpenID = openID => http.get('video', `/video/user?openId=${openID}`)

// 获取客服信息
export const queryCsInfo = async(page, pageSize, userId, listType) => http.get('video', `/video/user/cs/query?page=${page}&pageSize=${pageSize}&userId=${userId}&listType=${listType}`)

// 获取坐席头像
export const getCsAvatar = csId => http.url('video', `/video/image/csHeader?id=${csId}`)

// 专属客服添加
export const addCs = async(data) => http.post('video', `/video/user/cs/create`, data)

// 专属客服删除
export const removeCs = async(data) => http.post('video', `/video/user/cs/delete`, data)

// 客服信息获取（获取客服的个人资料）
export const getCsInfo = async(csId) => http.get('video', `/video/user/cs?csId=${csId}`)

// 礼物查询信息(同标签查询)
export const viewGifts = async(page, pageSize, csId) => http.get('video', `/video/user/gifts/query?page=${page}&pageSize=${pageSize}&csId=${csId}`)

// 标签信息查询(传csId查询到评价当前客服的标签，csId=‘’查询到所有的标签）
export const viewLabels = async(page, pageSize, csId) => http.get('video', `/video/user/labels?page=${page}&pageSize=${pageSize}&csId=${csId}`)
export const viewAllLabels = async(page, pageSize) => http.get('video', `/video/user/labels?page=${page}&pageSize=${pageSize}`)

/**
 ************************************ chat ************************************
 */

/**
 * [createSession 创建会话]
 */
export const createSession = (userId, userName, userPhone, chatType) => http.post('chat', `/chat/session/create`, { userId, userName, userPhone, chatType })

/**
 * [getSessionList 获取会话列表]
 */
 export const getSessionList = userId => http.get('chat', `/user/session?userId=${userId}`)

 /**
  * [getBotInfo 获取机器人基本信息]
  */
 export const getBotInfo = () => http.get('chat', `/robot/query`)

 /**
  * [sendMsgToBot 发送消息给机器人]
  */
 export const sendMsgToBot = (question, sessionId, userId, userName) => http.post('chat', `/robot/question/send`, {question, sessionId, userId, userName})

/**
 * [getBotRoamMsgs 拉取机器人漫游消息]
 */
 export const getBotRoamMsgs = (sessionId, page, pageSize) => http.get('chat', `/chat/robot?page=${page}&pageSize=${pageSize}&sessionId=${sessionId}`)

/**
 * [requestHistoryMsgs 拉取历史消息]
 */
 export const requestHistoryMsgs = (userId, page, pageSize) => http.get('chat', `/chat/history?page=${page}&pageSize=${pageSize}&userId=${userId}`)
 // export const requestHistoryMsgs = (userId) => http.get('chat', `/chat/history?userId=${userId}`)

// 评价信息保存
export const saveAssess = async(data) => http.post('video', `/video/user/evaluate`, data)

/**
 ************************************ onLine ************************************
 */

/**
 * [onLineQueue 客户端在线排队]
 */
export const onLineQueue = data => http.post('onLine', '/queueup', data)

/**
 * [onLineQueueCancel 客户端在线取消排队]
 */
export const onLineQueueCancel = data => http.post('onLine', '/cancelqueue', data)

/**
 * [chatQueueHeartBeat 客户端排队心跳]
 */
export const chatQueueHeartBeat = data => http.post('onLine', '/heartbeat', data)
