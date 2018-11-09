/*
* @Author: primavera <primaveraiiiiing618@gmail.com>
* @Date:   2018-07-18 14:29:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-07-18 14:29:00
*/
// import ENV from './env';
const env = process.env.NODE_ENV
const production = {
  videoPath: '/video-servertest/api/v1',
  webRTCRoomPath: '/room-servertest/api/v1',
  chatPath: '/chat-servertest/api/v1',
  onLine: '/onlinePath'
}

const development = {
  videoPath: 'http://video-servertest.ihxlife.com:8083/api/v1',
  // videoPath: 'http://192.168.8.108:7001/api/v1',
  webRTCRoomPath: 'http://room-servertest.ihxlife.com:8085/api/v1',
  // webRTCRoomPath: 'http://192.168.8.102:7001/api/v1',
  chatPath: 'http://chat-servertest.ihxlife.com/api/v1',
  onLine: 'http://114.251.3.100:1500'
  // videoPath: 'http://192.168.8.102:8080/api/v1',
  // webRTCRoomPath: 'http://192.168.8.102:8082/api/v1',
  // chatPath: 'http://192.168.8.102:8083/api/v1',
  // onLine: 'http://114.251.3.100:1500/webchat/queue/v1'
}

const location = env === 'production' ? production : development
export default location
