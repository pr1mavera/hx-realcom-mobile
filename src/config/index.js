/*
* @Author: primavera <primaveraiiiiing618@gmail.com>
* @Date:   2018-07-18 14:29:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-07-18 14:29:00
*/
// import ENV from './env';
const env = process.env.NODE_ENV
const production = {
  // userPath: 'https://claim.ihxlife.com:8080/api/v1', // 用户服务,整合video-server,chat-server,online
  // webRTCRoomPath: 'https://claim.ihxlife.com:8081/api/v1', // 房间服务
  // TMPath: 'https://claim.ihxlife.com:8082/api/v1' // 腾讯消息服务

  userPath: '/user-server/api/v1', // 用户服务,整合video-server,chat-server,online
  webRTCRoomPath: '/room-server/api/v1', // 房间服务
  TMPath: '/tm-server/api/v1' // 腾讯消息服务
}

const development = {
  userPath: 'http://112.74.159.234:8083/api/v1', // 用户服务,整合video-server,chat-server,online
  webRTCRoomPath: 'http://112.74.229.22:8085/api/v1', // 房间服务
  TMPath: 'http://112.74.159.234:8084/api/v1' // 腾讯消息服务
}

const location = env === 'production' ? production : development
export default location
