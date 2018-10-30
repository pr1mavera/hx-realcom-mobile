import { msgStatus, msgTypes, sessionStatus } from '@/common/js/status'

export function debounce(func, time) {
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
}

export function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve()
    }, time)
  })
}

export function sleepByAnimation(time) {
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

// 字符串删除最后一个字符
export function subLastString(str) {
  // 当前应该删除的字符所占的位数（因为含有emoji）
  const len = isLastStrEmoji(str) ? 2 : 1
  // 截去需要删除的字符
  const newStr = str.substring(0, str.length - len)
  // 返回删除后的字符
  return newStr
}

// 正则判断一个字符的结尾是否是emoji
export function isLastStrEmoji(str) {
  // 最后两位字符
  const lastTwoCharacter = str.substring(str.length - 2, str.length)
  // 转码
  const transcode = utf16toEntities(lastTwoCharacter)
  return /&#(.*);/g.test(transcode)
}

// 带emoji字符转编码
export function utf16toEntities(str) {
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

// 浅拷贝
export function shallowCopy(obj) {
  let newObj = {}
  for (let key in obj) {
    newObj[key] = obj[key]
  }
  return newObj
}

export function getRect(el) {
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
}

export function botAnswerfilter(data) {
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
}
