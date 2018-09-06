import http from './request'

// 错误状态码
export const ERR_OK = '0'

// 获取微信签名
export const wxConfig = url => http.get('public', `/wxConfig?url=${url}`)

/**
 ************************************ RTCRoom ************************************
 */

/**
 * [getLoginInfo 获取用户登录信息]
 */
export const getLoginInfo = data => http.post('RTCRoom', '/getLoginInfo', data)

/**
 * [pushUserMsg 推送系统消息]
 */
export const pushUserMsg = msgBody => http.post('RTCRoom', '/pushMsg', msgBody)

/**
 * [syncGroupC2CMsg 拉取漫游消息]
 */
export const syncGroupC2CMsg = data => http.post('RTCRoom', '/syncGroupC2CMsg', data)

/**
 ************************************ public ************************************
 */

export const getImgUrl = imgUrl => http.url('public', `/video/image/get?imgUrl=${imgUrl}`)

/**
 * [getUserInfoByOpenID 获取用户基本信息]
 */
export const getUserInfoByOpenID = openID => http.get('public', `/video/user?openId=${openID}`)

/**
 * [getBotInfo 获取机器人基本信息]
 */
export const getBotInfo = () => http.get('public', `/robot/query`)

/**
 * [createBotSession 创建雨机器人的会话]
 */
export const createBotSession = data => http.post('public', `/robot/session/create`, data)
