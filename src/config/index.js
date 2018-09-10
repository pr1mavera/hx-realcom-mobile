/*
* @Author: primavera <primaveraiiiiing618@gmail.com>
* @Date:   2018-07-18 14:29:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-07-18 14:29:00
*/
// import ENV from './env';
const env = process.env.NODE_ENV
const production = {
  publicPath: '/api'
}

const development = {
  publicPath: 'http://192.168.8.111:7001/api/v1',
  webRTCRoomPath: 'https://vnap-webrtctest.ihxlife.com/room'
}

const location = env === 'production' ? production : development
export default location
