/* eslint-disable */

import http from './request'

// 错误状态码
export const ERR_OK = 0

// 获取微信签名
export const wxConfig = url => http.get(`/wxConfig?url=${url}`)
