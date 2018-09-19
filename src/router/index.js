import Vue from 'vue'
import Router from 'vue-router'

/** 老版本webpack不支持动态import()，使用require.ensure替代
  const mainM = require('@/views/mainChat')

  // 主聊天界面
  const main = r => require.ensure([], () => r(mainM), 'main')
*/
const room = () => import('@/views/mainRoom')
const chat = () => import('@/views/mainRoom/chat')
const serverDetail = () => import('@/views/mainRoom/serverDetail')
const share = () => import('@/views/share')
const leaveMessage = () => import('@/views/mainRoom/leave-message')
const cusServ = () => import('@/views/mainRoom/cusServ')
const csList = () => import('@/views/mainRoom/components/service/cs-list')
const csAdd = () => import('@/views/mainRoom/components/service/cs-add')

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [
    {
      path: '/video/room',
      name: 'room',
      component: room,
      children: [
        {
          path: '/video/room/chat',
          name: 'chat',
          component: chat
        },
        {
          path: '/video/room/serverDetail',
          name: 'serverDetail',
          component: serverDetail
        },
        {
          path: '/video/room/leaveMessage',
          name: 'leaveMessage',
          component: leaveMessage
        },
        {
          path: '/video/room/cusServ',
          name: 'cusServ',
          component: cusServ,
          children: [
            {
              path: '/video/room/cusServ/list',
              name: 'cusServList',
              component: csList
            },
            {
              path: '/video/room/cusServ/add',
              name: 'cusServAdd',
              component: csAdd
            }
          ]
        }
      ]
    },
    {
      path: '/video/share',
      name: 'share',
      component: share
    },
    {
      path: '/',
      redirect: '/video/room/chat'
    }
  ],
  base: '/video/'
})
