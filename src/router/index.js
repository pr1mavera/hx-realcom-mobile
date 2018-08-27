import Vue from 'vue'
import Router from 'vue-router'

/** 老版本webpack不支持动态import()，使用require.ensure替代
  const mainM = require('@/views/mainChat')

  // 主聊天界面
  const main = r => require.ensure([], () => r(mainM), 'main')
*/
const main = () => import('@/App')
const room = () => import('@/views/mainRoom')
const chat = () => import('@/views/mainRoom/chat')
const serverDetail = () => import('@/views/mainRoom/serverDetail')
const share = () => import('@/views/share')
const leaveMessage = () => import('@/views/mainRoom/leave-message')

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'main',
      component: main,
      children: [
        {
          path: '/room',
          name: 'room',
          component: room,
          children: [
            {
              path: '/room/chat',
              name: 'chat',
              component: chat
            },
            {
              path: '/room/serverDetail',
              name: 'serverDetail',
              component: serverDetail
            },
            {
              path: '/room/leaveMessage',
              name: 'leaveMessage',
              component: leaveMessage
            }
          ]
        },
        {
          path: '/share',
          name: 'share',
          component: share
        }
      ]
    },
    {
      path: '/',
      redirect: '/mobile/room/chat'
    }
  ],
  base: '/mobile/'
})
