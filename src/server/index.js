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
export const createSession = (userId, userName, userPhone) => http.post('public', `/robot/session/create`, { userId, userName, userPhone })

/**
 * [sendMsgToBot 发送消息给机器人]
 */
export const sendMsgToBot = data => http.post('public', `/robot/question/send`, data)

// 获取客服信息
export const queryCsInfo = async(page, pageSize, userId, listType) => http.get('public', `/video/user/cs/query?page=${page}&pageSize=${pageSize}&userId=${userId}&listType=${listType}`)

// 专属客服添加
export const addCs = async(userId, csId) => http.post('public', `/video/user/cs/create`, {userId, csId})

// 专属客服删除
export const removeCs = async(userId, csId) => http.post('public', `/video/user/cs/delete`, {userId, csId})

// 客服信息获取（获取客服的个人资料）
export const getCsInfo = async(csId) => http.get('public', `/video/user/cs?csId=${csId}`)

// 礼物查询信息
export const viewGifts = async({page, pageSize}, csId) => http.get('public', `/video/user/gifts?page=${page}&page=${pageSize}&csId=${csId}`)

// 标签信息查询
export const viewLabels = async(page, pageSize, csId) => http.get('public', `/video/user/ labels?page=${page}&pageSize=${pageSize}&csId=${csId}`)
