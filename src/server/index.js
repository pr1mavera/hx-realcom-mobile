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
export const getLoginInfo = userId => http.get('RTCRoom', `/im/account/login?userId=${userId}`)

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

/**
 * [getImgUrl 获取照片流请求统一路径]
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
 * [createSession 创建会话]
 */
export const createSession = data => http.post('public', `/robot/session/create`, data)

/**
 * [sendMsgToBot 发送消息给机器人]
 */
export const sendMsgToBot = data => http.post('public', `/robot/question/send`, data)

// 获取客服信息
export const queryCsIn = async(openId) => http.get('public', `/video/user/cs/query`, {openId})

// 专属客服添加
// router.post('/api/v1/video/user/cs/create',controller.custinfoquery.createSpecialCustInfo);
export const addCs = async(userId, csId) => http.post('public', `/video/user/cs/create`, {userId, csId})

// 专属客服删除
// router.del('/api/v1/video/user/cs/delete',controller.custinfoquery.deleteSpecialCustInfo);
export const removeCs = async(userId, csId) => http.delete('public', `/video/user/cs/delete`, {userId, csId})
