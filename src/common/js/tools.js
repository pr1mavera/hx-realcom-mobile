import { msgStatus, msgTypes, sessionStatus } from '@/common/js/status'

const DateTools = {
  formatDate: function(date, format) {
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

  isTimeDiffLongEnough: function(cache, next) {
    const cacheT = new Date(cache.replace(/-/g, '/'))
    const nextT = new Date(next.replace(/-/g, '/'))
    return nextT - cacheT >= 60000
  },

  isCacheValid: function(cacheT, quality) {
    const now = new Date().getTime()
    return (now - cacheT) <= quality
  },

  isWorkTime: function({ startT, endT }) {
    const strb = startT.split(':')
    if (strb.length !== 2) {
      return false
    }

    const stre = endT.split(':')
    if (stre.length !== 2) {
      return false
    }

    let b = new Date()
    let e = new Date()
    let n = new Date()

    b.setHours(strb[0])
    b.setMinutes(strb[1])
    e.setHours(stre[0])
    e.setMinutes(stre[1])

    return n.getTime() - b.getTime() > 0 && n.getTime() - e.getTime() < 0
  }
}

const AsyncTools = {
  debounce: function(func, time) {
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

  sleep: function(time) {
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        resolve()
      }, time)
    })
  },

  sleepByAnimation: function(time) {
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
  isLastStrEmoji: function(str) {
    // 最后两位字符
    const lastTwoCharacter = str.substring(str.length - 2, str.length)
    // 转码
    const transcode = this.utf16toEntities(lastTwoCharacter)
    return /&#(.*);/g.test(transcode)
  },

  // 带emoji字符转编码
  utf16toEntities: function(str) {
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
  objShallowClone: function(obj) {
    let newObj = {}
    for (let key in obj) {
      newObj[key] = obj[key]
    }
    return newObj
  },

  // 深拷贝
  objDeepClone: function(obj) {
    // return JSON.parse(JSON.stringify(obj))
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        var newArr = []
        for (var i = 0; i < obj.length; i++) newArr.push(obj[i])
        return newArr
      } else {
        var newObj = {}
        for (var key in obj) {
          newObj[key] = this.objDeepClone(obj[key])
        }
        return newObj
      }
    } else {
      return obj
    }
  },

  // 深拷贝自定义对象
  objWithTypeDeepClone: function(obj) {
    // return JSON.parse(JSON.stringify(obj))
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        var newArr = []
        for (var i = 0; i < obj.length; i++) newArr.push(obj[i])
        return newArr
      } else {
        var newObj = Object.create(obj)
        for (var key in obj) {
          const self = this
          Object.defineProperty(newObj, key, {
            configurable: true,
            writable: true,
            enumerable: true,
            value: self.objWithTypeDeepClone(obj[key])
          })
        }
        return newObj
      }
    } else {
      return obj
    }
  },

  // 数组拷贝
  arrShallowClone: function(arr) {
    return arr.slice(0)
  }
}

const RectTools = {
  // 获取dom基于offsetParent的位置
  getRect: function(el) {
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
  getRectLimitDoc: function(el) {
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
  // 机器人答案过滤 a 标签
  transA2Button: function(answer) {
    const regA = /<a[^>]*href="(.*?)"[^>]*>(.*?)<\/a>/g
    if (!answer.match(regA)) {
      return answer
    }
    const regHref = /href="(.*?)"/g
    // eslint-disable-next-line
    const regUrl = /((http|ftp|https):\/\/)?[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?/g
    return answer.replace(regHref, `href="javascript:;" onclick="return false;"`)
    // return answer.replace(regHref, `href="javascript:;"`) answer.match(regUrl)[0] store.commit('SET_ASSESS_VIEW', true)
  },

  // 机器人答案链接统一为https
  transHttp2Https: function(url) {
    return url.match(/https/) ? url : url.replace(/http/, 'https')
  },

  // 机器人消息解析器
  botAnswerfilter: function(data) {
    let msg = {
      content: '',
      nickName: data.botName,
      isSelfSend: false,
      time: data.time,
      timestamp: new Date().getTime(),
      msgStatus: msgStatus.msg,
      chatType: sessionStatus.robot
    }
    if (data.info.length === 1) {
      if (data.info[0].question === '如何转人工') {
        // 转人工
        msg.msgType = msgTypes.msg_no_idea
      } else {
        // normal
        // msg.content = this.transA2Button(data.info[0].answer)
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
          // answer: this.transA2Button(data.info[0].answer)
        },
        {
          question: data.info[1].question,
          answer: data.info[1].answer
          // answer: this.transA2Button(data.info[1].answer)
        },
        {
          question: data.info[2].question,
          answer: data.info[2].answer
          // answer: this.transA2Button(data.info[2].answer)
        }
      ]
    }
    return msg
  },

  // IM消息解析
  parseMsg: function(newMsg) {
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

const CacheTools = {
  // 从localStorage取对应字段的缓存
  getCacheData: function({ key, check, quality }) {
    const cache = window.localStorage.getItem(key) || ''
    if (!cache) {
      // 缓存为null
      return false
    }
    if (quality && !DateTools.isCacheValid(cache.parseJSON().timestamp, quality)) {
      // 缓存过期
      return false
    }
    if (cache.parseJSON().check !== check) {
      // 缓存校验不通过
      return false
    }
    return cache.parseJSON().data
  },

  // 存localStorage
  setCacheData: function({ key, check, data }) {
    window.localStorage.setItem(key, JSON.stringify({
      timestamp: new Date().getTime(),
      check,
      data
    }))
  },

  // 跟新当前服务缓存消息
  updateCacheData: function({ key, msgs, timestamp }) {
    let cache = window.localStorage.getItem(key)
    if (!cache) {
      // 当前无对应key值的缓存，
      return
    }
    cache = cache.parseJSON()
    msgs && (cache.data.msgs = msgs)
    timestamp && (cache.timestamp = timestamp)
    window.localStorage.setItem(key, JSON.stringify(cache))
  },

  // 清空本地localstorage
  removeCacheData: function(key) {
    window.localStorage.removeItem(key)
  }
}

let Tools = Object.assign({}, {
  DateTools: Object.create(DateTools),
  AsyncTools: Object.create(AsyncTools),
  CharTools: Object.create(CharTools),
  CopyTools: Object.create(CopyTools),
  RectTools: Object.create(RectTools),
  MsgsFilterTools: Object.create(MsgsFilterTools),
  CacheTools: Object.create(CacheTools),
  curry: function(fn) {
    function _c(restNum, argsList) {
      return restNum === 0 ? fn.apply(null, argsList) : function(...x) {
        return _c(restNum - x.length, argsList.concat(x))
      }
    }
    return _c(fn.length, [])
  },
  rand: function(min, max) {
    return Math.floor(Math.random() * (max - min) + min)
  }
})

export default Tools
