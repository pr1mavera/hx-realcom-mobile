import { sessionStatus, msgStatus, msgTypes, tipTypes } from '@/common/js/status'
import { ERR_OK, getBotRoamMsgs, requestHistoryMsgs } from '@/server/index.js'
import IM from '@/server/im'
import { botAnswerfilter } from '@/common/js/util'
import { formatDate, isTimeDiffLongEnough } from '@/common/js/dateConfig.js'

/**
 * [deprecate 装饰器]
 */
function deprecate(...list) {
  return function(target) {
    Object.assign(target.prototype, ...list)
  }
}

const Format = {
  timeTipsFormat(list) {
    let timeCache = list[0].time
    let map = []
    list.forEach((item, i) => {
      if (isTimeDiffLongEnough(timeCache, item.time) || i === 0) {
        map.push({
          content: item.time,
          time: item.time,
          msgStatus: msgStatus.tip,
          msgType: tipTypes.tip_time
        })
        timeCache = item.time
      }
      map.push(item)
    })
    return map
  }
}

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
    const LeftCount = this.chatCount - (Pagination.curPage - 1) * Pagination.pageSize
    let count = LeftCount > Pagination.pageSize ? Pagination.pageSize : LeftCount
    let res = {}
    switch (this.chatType) {
      case sessionStatus.robot:
        // 机器人
        res = await this.getBot(userId, this.sessionId, Pagination.curPage, count)
        break
      case sessionStatus.video:
        // 视频
        res = await this.getVideo(userId, this.csId, Pagination.curTime, count)
        break
      case sessionStatus.onLine:
        // 在线
        break
      case sessionStatus.website:
        // 官网
        break
    }
    return res
  }
  async getBot(userId, sessionId, curPage, pageSize) {
    const res = await getBotRoamMsgs(sessionId, curPage, pageSize)
    if (res.result.code === ERR_OK) {
      console.log('============================= 我现在来请求 机器人 漫游消息 辣 =============================')
      const list = res.data.msgList
      let map = []
      if (list.length) {
        list.forEach(item => {
          map.unshift(this.Creator.createMessage(userId, item))
        })
      }
      return map
    } else {
      console.log('error in getBotRoamMsgs')
    }
  }
  async getVideo(userId, csId, curTime, pageSize) {
    const res = await IM.getIMRoamMsgs(csId, curTime, pageSize)
    if (res && res.MsgList) {
      console.log('============================= 我现在来请求 视频坐席 漫游消息 辣 =============================')
      const map = IM.parseMsgs(res.MsgList).textMsgs
      return map
    } else {
      console.log('error in getIMRoamMsgs')
    }
  }
}

/**
 * [SessionList 会话队列]
 */
class SessionList {
  constructor(sessions) {
    this.sessions = sessions || []
    this.curIndex = 0
    this.isRoamMsgsOver = this.sessions.length === 0
  }
  getCurSession() {
    return this.sessions[this.curIndex]
  }
  nextSession() {
    this.curIndex += 1
    if (!this.getCurSession()) {
      this.isRoamMsgsOver = true
    }
  }
}

/**
 * [Pagination 分页]
 */
class Pagination {
  constructor(pageSize) {
    this.curPage = 1
    this.curTime = formatDate(new Date(), 'yyyy-MM-dd hh:mm:ss')
    this.pageSize = pageSize
  }
  resetPage() {
    this.curPage = 1
  }
  updateCurPage() {
    // 更新分页
    this.curPage += 1
  }
  updateCurTime(newTime) {
    // 更新时间
    this.curTime = newTime
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
          item.msgContent = JSON.parse(item.msgContent)[0].MsgContent
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
@deprecate(Format)
class MsgsLoader {
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
    // console.info('this.page.curPage :' + this.page.curPage)
    // console.info('this.page.curTime :' + this.page.curTime)
    // console.info('this.page.pageSize :' + this.page.pageSize)
    if (this.sessionList.isRoamMsgsOver) {
      // 拉取历史消息
      list = await this.history.getHistoryMsgs(this.userInfo.userId, this.page)
      if (list.length) {
        this.page.updateCurPage()
        this.page.updateCurTime(list[0].time)
      }
    } else {
      // 拉取漫游消息
      const curSession = this.sessionList.getCurSession()
      list = await curSession.getRoamMsgs(this.userInfo.userId, this.page)
      if (curSession.isFinalPage(this.page)) {
        // 消息为当前会话最后一页，更新当前会话、分页
        this.sessionList.nextSession()
        this.page.resetPage()
        this.page.updateCurTime(list[0].time)
      } else {
        this.page.updateCurPage()
        this.page.updateCurTime(list[0].time)
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
      const obj = msgObj.msgContent
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
  createMsgsLoader(userInfo, sessionList) {
    return new MsgsLoader(userInfo, sessionList)
  }
}

export default new Creator()
