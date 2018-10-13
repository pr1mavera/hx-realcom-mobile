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
 ************************************ video ************************************
 */

/**
 * [getImgUrl 获取照片流请求统一路径]
 */
export const getImgUrl = imgUrl => http.url('video', `/video/image/get?imgUrl=${imgUrl}`)

/**
 * [getUserInfoByOpenID 获取用户基本信息]
 */
export const getUserInfoByOpenID = openID => http.get('video', `/video/user?openId=${openID}`)

/**
 * [getBotInfo 获取机器人基本信息]
 */
export const getBotInfo = () => http.get('video', `/robot/query`)

/**
 * [sendMsgToBot 发送消息给机器人]
 */
export const sendMsgToBot = data => http.post('video', `/robot/question/send`, data)

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

// 礼物查询信息
export const viewGifts = async(page, pageSize, csId) => http.get('video', `/video/user/gifts/query?page=${page}&pageSize=${pageSize}&csId=${csId}`)

// 标签信息查询
export const viewLabels = async(page, pageSize, csId) => http.get('video', `/video/user/labels?page=${page}&pageSize=${pageSize}&csId=${csId}`)

/**
 ************************************ chat ************************************
 */

/**
 * [createSession 创建会话]
 */
export const createSession = (userId, userName, userPhone, chatType) => http.post('chat', `/chat/session/create`, { userId, userName, userPhone, chatType })

/**
 * [getHistoryMsgs 拉取历史消息]
 */
 export const getHistoryMsgs = (userId, page, pageSize) => http.get('chat', `/chat/history?page=${page}&pageSize=${pageSize}&userId=${userId}`)
 // export const getHistoryMsgs = (userId) => http.get('chat', `/chat/history?userId=${userId}`)

// 评价信息保存
export const saveAssess = async(data) => http.post('video', `/video/user/evaluate`, data)

