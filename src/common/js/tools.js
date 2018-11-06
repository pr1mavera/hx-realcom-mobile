import { msgStatus, msgTypes, sessionStatus } from '@/common/js/status'

const DateTools = {
  formatDate: (date, format) => {
    if (format === undefined) {
      format = date
      date = new Date()
    }
    var map = {
      'M': date.getMonth() + 1, // 月份
      'd': date.getDate(), // 日
      'h': date.getHours(), // 小时
      'm': date.getMinutes(), // 分
      's': date.getSeconds(), // 秒
      'q': Math.floor((date.getMonth() + 3) / 3), // 季度
      'S': date.getMilliseconds() // 毫秒
    }
    format = format.replace(/([yMdhmsqS])+/g, function(all, t) {
      var v = map[t]
      if (v !== undefined) {
        if (all.length > 1) {
          v = '0' + v
          v = v.substr(v.length - 2)
        }
        return v
      } else if (t === 'y') {
        return (date.getFullYear() + '').substr(4 - all.length)
      }
      return all
    })
    return format
  },

  isTimeDiffLongEnough: (cache, next) => {
    const cacheT = new Date(cache.replace(/-/g, '/'))
    const nextT = new Date(next.replace(/-/g, '/'))
    return nextT - cacheT >= 60000
  }
}

const AsyncTools = {
  debounce: (func, time) => {
    let timer

    return function(...args) {
      if (timer) {
        clearTimeout(timer)
      }
      timer = setTimeout(() => {
        func.apply(this, args)
        clearTimeout(timer)
      }, time)
    }
  },

  sleep: (time) => {
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve()
      }, time)
    })
  },

  sleepByAnimation: (time) => {
    return new Promise((resolve, reject) => {
      var start = null
      const step = function(timestamp) {
        if (!start) start = timestamp
        const progress = timestamp - start
        if (progress < time) {
          window.requestAnimationFrame(step)
        } else {
          resolve()
        }
      }
      window.requestAnimationFrame(step)
    })
  }
}

const CharTools = {
  // 正则判断一个字符的结尾是否是emoji
  isLastStrEmoji: (str) => {
    // 最后两位字符
    const lastTwoCharacter = str.substring(str.length - 2, str.length)
    // 转码
    const transcode = this.utf16toEntities(lastTwoCharacter)
    return /&#(.*);/g.test(transcode)
  },

  // 带emoji字符转编码
  utf16toEntities: (str) => {
    var patt = /[\ud800-\udbff][\udc00-\udfff]/g // 检测utf16字符正则
    str = str.replace(patt, function(char) {
      var H, L, code
      if (char.length === 2) {
        H = char.charCodeAt(0) // 取出高位
        L = char.charCodeAt(1) // 取出低位
        code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00 // 转换算法
        return `&#${code};`
      } else {
        return char
      }
    })
    return str
  }
}

const CopyTools = {
  // 浅拷贝
  objShallowClone: (obj) => {
    let newObj = {}
    for (let key in obj) {
      newObj[key] = obj[key]
    }
    return newObj
  },

  // 深拷贝
  objDeepClone: (obj) => {
    let _obj = JSON.stringify(obj)
    return JSON.parse(_obj)
  },

  // 数组拷贝
  arrShallowClone: (arr) => {
    return arr.slice(0)
  }
}

const RectTools = {
  // 获取dom基于offsetParent的位置
  getRect: (el) => {
    if (el instanceof window.SVGElement) {
      let rect = el.getBoundingClientRect()
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height
      }
    } else {
      return {
        top: el.offsetTop,
        left: el.offsetLeft,
        width: el.offsetWidth,
        height: el.offsetHeight
      }
    }
  },

  // 获取dom基于屏幕的位置
  getRectLimitDoc: (el) => {
    let actualTop = el.offsetTop
    let actualLeft = el.offsetLeft
    let current = el.offsetParent
    while (current !== null) {
      actualTop += current.offsetTop
      actualLeft += current.offsetLeft
      current = current.offsetParent
    }
    return {
      top: actualTop,
      left: actualLeft,
      width: el.offsetWidth,
      height: el.offsetHeight
    }
  }
}

const MsgsFilterTools = {
  // 机器人消息解析器
  botAnswerfilter: (data) => {
    let msg = {
      content: '',
      nickName: data.botName,
      isSelfSend: false,
      time: data.time,
      msgStatus: msgStatus.msg,
      chatType: sessionStatus.robot
    }
    if (data.info.length === 1) {
      if (data.info[0].question === '如何转人工') {
        // 转人工
        msg.msgType = msgTypes.msg_no_idea
      } else {
        // normal
        msg.content = data.info[0].answer
        msg.msgType = msgTypes.msg_normal
      }
    } else if (data.info.length === 3) {
      // 猜问题
      msg.msgType = msgTypes.msg_guess
      msg.msgExtend = [
        {
          question: data.info[0].question,
          answer: data.info[0].answer
        },
        {
          question: data.info[1].question,
          answer: data.info[1].answer
        },
        {
          question: data.info[2].question,
          answer: data.info[2].answer
        }
      ]
    }
    return msg
  },

  // IM消息解析
  parseMsg: (newMsg) => {
    var msgItem = newMsg.getElems()[0]
    var type = msgItem.getType()
    if (type === 'TIMCustomElem') {
      var content = msgItem.getContent() // 获取元素对象
      var desc = JSON.parse(content.getDesc())
      var msgType = desc.msgType
      var msgStatus = desc.msgStatus
      var time = desc.time
      var nickName = desc.nickName
      var avatar = desc.avatar
      var chatType = desc.chatType
      var ext = JSON.parse(content.getExt())
      if (ext.imgData) {
        var imgData = ext.imgData
      }
      if (ext.proxyInfo) {
        var proxyInfo = ext.proxyInfo
      }
      if (ext.giftInfo) {
        var giftInfo = ext.giftInfo
      }
    }
    return {
      nickName,
      avatar,
      imgData,
      proxyInfo,
      giftInfo,
      content: newMsg.toHtml(),
      isSelfSend: newMsg.getIsSend(),
      isSystem: newMsg.getFromAccount() === '@TIM#SYSTEM' || false,
      msgType,
      msgStatus,
      chatType,
      time
    }
  }
}

let Tools = {}

Tools.DateTools = Object.create(DateTools)
Tools.AsyncTools = Object.create(AsyncTools)
Tools.CharTools = Object.create(CharTools)
Tools.CopyTools = Object.create(CopyTools)
Tools.RectTools = Object.create(RectTools)
Tools.MsgsFilterTools = Object.create(MsgsFilterTools)

export default Tools
