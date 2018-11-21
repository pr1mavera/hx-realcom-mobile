/*
* @Author: primavera <primaveraiiiiing618@gmail.com>
* @Date:   2018-07-18 14:29:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-07-18 14:29:00
*/
// import ENV from './env';
const env = process.env.NODE_ENV
const production = {
  // int
  // videoPath: '/video-servertest/api/v1',
  // webRTCRoomPath: '/room-servertest/api/v1',
  // chatPath: '/chat-servertest/api/v1',
  // onlinePath: '/onlinePath'
  // uat
  userPath: '/user-server/api/v1', // 用户服务,整合video-server,chat-server
  webRTCRoomPath: '/room-server/api/v1', // 房间服务
  onlinePath: '/onlinePath', // 在线服务,
  TMPath: '/tm-server/api/v1' // 腾讯消息服务
}

const development = {
  // int
  videoPath: 'http://video-servertest.ihxlife.com:8083/api/v1',
  // videoPath: 'http://192.168.8.108:7001/api/v1',
  webRTCRoomPath: 'http://room-servertest.ihxlife.com:8085/api/v1',
  // webRTCRoomPath: 'http://192.168.8.102:7001/api/v1',
  chatPath: 'http://chat-servertest.ihxlife.com/api/v1',
  // chatPath: 'http://192.168.8.108:7001/api/v1',
  onlinePath: 'http://114.251.3.100:1500'
  // uat
 //  userPath: 'https://112.74.159.153:8081/api/v1',
 //  webRTCRoomPath: 'https://112.74.159.153:8082/api/v1',
 //  TMPath: 'https://112.74.159.153:8083/api/v1',
 // // chatPath: 'https://112.74.159.153:8081/api/v1',
 //  onlinePath: 'http://10.0.15.185:1400'
}

const location = env === 'production' ? production : development
export default location
