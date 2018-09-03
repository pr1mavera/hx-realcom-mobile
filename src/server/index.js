/* eslint-disable */

import http from './request'

// 错误状态码
export const ERR_OK = 0

// 获取微信签名
export const wxConfig = url => http.get('public', `/wxConfig?url=${url}`)

// WebRTCRoom
// 获取用户登录信息
export const getLoginInfo = data => http.post('RTCRoom', '/getLoginInfo', data)
// 推送系统消息
export const pushUserMsg = msgBody => http.post('RTCRoom', '/pushMsg', msgBody)
// 拉取漫游消息
export const syncGroupC2CMsg = data => http.post('RTCRoom', '/syncGroupC2CMsg', data)
