/*
* @Author: primavera <primaveraiiiiing618@gmail.com>
* @Date:   2018-07-18 14:29:00
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-07-18 14:29:00
*/
// import ENV from './env';
const env = process.env.NODE_ENV
const production = {
  publicPath: 'http://192.168.8.108:8080/api/v1',
  webRTCRoomPath: 'http://192.168.8.102:8082/api/v1'
}

const development = {
  publicPath: 'http://192.168.8.102:8080/api/v1',
  webRTCRoomPath: 'http://192.168.8.102:8082/api/v1'
  // webRTCRoomPath: 'http://112.74.229.22:8085/api/v1'
}

const location = env === 'production' ? production : development
export default location
