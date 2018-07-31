/* eslint-disable */

import http from './request'

// 获取微信签名
export const wxConfig = url => http.get(`/wxConfig?url=${url}`)
