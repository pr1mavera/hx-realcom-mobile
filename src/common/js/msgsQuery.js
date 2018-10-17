import { sessionStatus, msgStatus, msgTypes } from '@/common/js/status'
import { ERR_OK, getBotRoamMsgs, requestHistoryMsgs } from '@/server/index.js'
import { getIMRoamMsgs } from '@/server/im'
import { botAnswerfilter } from '@/common/js/util'

/**
 * [Message 消息]
 */
class Message {
  constructor(options) {
    this.nickName = options.nickName
    this.content = options.content
    this.isSelfSend = options.isSelfSend
    this.time = options.time
    this.msgStatus = options.msgStatus
    this.msgType = options.msgType
    this.msgExtend = options.msgExtend || []
    this.imgData = options.imgData || {}
    this.proxyInfo = options.proxyInfo || {}
  }
}

// class APISource {
//   constructor(chatType) {
//     this.chatType = chatType
//   }
//   getRequestFunc(...options) {
//     switch (this.chatType) {
//       case sessionStatus.robot:
//         // 机器人
//         return getBotRoamMsgs()
//       case sessionStatus.video:
//         // 视频
//         return getIMRoamMsgs
//       case sessionStatus.onLine:
//         break
//       case sessionStatus.website:
//         break
//     }
//   }
// }

/**
 * [Session 会话]
 */
class Session {
  constructor(options) {
    this.sessionId = options.sessionId
    this.csId = options.csId
    this.chatType = options.chatType
    this.chatCount = options.chatCount
    this.Creator = new Creator()
  }
  isFinalPage(page) {
    // 当前会话已经拉取到最后一页
    return this.chatCount - page.curPage * page.pageSize <= 0
  }
  async getRoamMsgs(userId, Pagination) {
    let count = this.chatCount < Pagination.pageSize ? this.chatCount : Pagination.pageSize
    let res = {}
    switch (this.chatType) {
      case sessionStatus.robot:
        // 机器人
        res = await getBotRoamMsgs(this.sessionId, Pagination.curPage, count)
        break
      case sessionStatus.video:
        // 视频
        res = await getIMRoamMsgs(this.csId, Pagination.curTime, count)
        break
      case sessionStatus.onLine:
        // 在线
        break
      case sessionStatus.website:
        // 官网
        break
    }
    if (res.result.code === ERR_OK) {
      console.log('============================= 我现在来请求 漫游消息 辣 =============================')
      const list = res.data.msgList
      let map = []
      if (list.length) {
        list.forEach(item => {
          map.unshift(this.Creator.createMessage(userId, item))
        })
      }
      return map
    } else {
      console.log('error in getRoamMsgs')
    }
  }
}

/**
 * [SessionList 会话队列]
 */
class SessionList {
  constructor(sessions) {
    this.sessions = sessions || []
    this.curIndex = this.sessions.length - 1
    this.isRoamMsgsOver = false
    // this.isRoamMsgsOver = true
  }
  getCurSession() {
    return this.sessions[this.curIndex]
  }
  nextSession() {
    this.curIndex -= 1
  }
}

/**
 * [Pagination 分页]
 */
class Pagination {
  constructor(pageSize) {
    this.curPage = 1
    this.curTime = ''
    this.pageSize = pageSize
  }
  resetPage() {
    this.curPage = 1
    this.curTime = ''
  }
}

/**
 * [History 历史消息]
 */
class History {
  constructor() {
    this.isHistoryOver = false
    this.Creator = new Creator()
  }
  async getHistoryMsgs(userId, page) {
    const res = await requestHistoryMsgs(userId, page.curPage, page.pageSize)
    if (res.result.code === ERR_OK) {
      console.log('============================= 我现在来请求 历史消息 辣 =============================')
      const list = res.data.msgList
      let map = []
      if (list.length) {
        list.forEach(item => {
          map.unshift(this.Creator.createMessage(userId, item))
        })
      } else {
        this.isHistoryOver = true
      }
      return map
    } else {
      console.log('error in requestHistoryMsgs')
    }
  }
}

/**
 * [MsgsQuery 消息请求类]
 */
class MsgsQuery {
  constructor(userInfo, sessionList) {
    this.userInfo = userInfo
    this.clientHeight = 0
    this.page = new Pagination(5)
    this.sessionList = sessionList
    this.history = new History()
  }
  recordMsgsClientHeight() {}
  async getMsgs() {
    if (this.noMoreMsgs()) {
      // 当前已无消息
      return
    }
    let list = []
    if (this.sessionList.isRoamMsgsOver) {
      // 拉取历史消息
      list = await this.history.getHistoryMsgs(this.userInfo.userId, this.page)
      console.log('this.page.curPage ================== ' + this.page.curPage)
      if (list.length) {
        this.page.curPage += 1
      }
    } else {
      // 拉取漫游消息
      const curSession = this.sessionList.getCurSession()
      list = await curSession.getRoamMsgs(this.userInfo.userId, this.page)
      debugger
      if (curSession.isFinalPage(this.page)) {
        this.sessionList.nextSession()
        this.page.resetPage()
      } else {
        this.page.curPage += 1
      }
    }
    return list
  }
  noMoreMsgs() {
    return this.sessionList.isRoamMsgsOver && this.history.isHistoryOver
  }
}

/**
 * [Creator 工厂类]
 */
class Creator {
  createMessage(userId, msgObj) {
    let options = {}
    if (msgObj.chatType === sessionStatus.robot) {
      // 机器人
      const isSelfSend = msgObj.sendUserId === userId
      if (isSelfSend) {
        // 我发送的机器人的
        options = {
          nickName: msgObj.sendUserName,
          content: msgObj.msgContent,
          isSelfSend: true,
          time: msgObj.msgTime,
          msgStatus: msgStatus.msg,
          msgType: msgTypes.msg_normal
        }
      } else {
        // 机器人发给我的
        const data = JSON.parse(msgObj.msgContent).data
        data.botName = msgObj.sendUserName
        data.time = msgObj.msgTime
        options = botAnswerfilter(data)
      }
    } else if (msgObj.chatType === sessionStatus.video) {
      // IM
      const obj = JSON.parse(msgObj.msgContent)[0].MsgContent
      options = {
        nickName: obj.Desc.nickName,
        content: obj.Data,
        isSelfSend: obj.Desc.sendUserId === userId,
        time: obj.Desc.time,
        msgStatus: obj.Desc.msgStatus,
        msgType: obj.Desc.msgType
      }
      // 添加图片
      if (options.msgType === msgTypes.msg_img) {
        options.imgData = obj.Ext.imgData
      }
      // 添加名片
      if (options.msgType === msgTypes.msg_card) {
        options.proxyInfo = obj.Ext.proxyInfo
      }
    }
    return new Message(options)
  }
  createSession(sessionObj) {
    return new Session({
      sessionId: sessionObj.sessionId,
      csId: sessionObj.csId,
      chatType: sessionObj.chatType,
      chatCount: sessionObj.chatCount
    })
  }
  createSessionList(sessions) {
    return new SessionList(sessions)
  }
  createPagination(pageSize) {
    return new Pagination(pageSize)
  }
  createHistory() {
    return new History()
  }
  createMsgsQuery(userInfo, sessionList) {
    return new MsgsQuery(userInfo, sessionList)
  }
}

export default new Creator()
