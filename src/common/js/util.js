import { msgStatus, msgTypes } from '@/common/js/status'

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

export function botAnswerfilter(data) {
  let msg
  if (data.info.length === 1) {
    if (data.info[0].question === '如何转人工') {
      // 转人工
      msg = {
        nickName: data.botName,
        content: '',
        isSelfSend: false,
        time: data.time,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_no_idea
      }
    } else {
      // normal
      msg = {
        nickName: data.botName,
        content: data.info[0].answer,
        isSelfSend: false,
        time: data.time,
        msgStatus: msgStatus.msg,
        msgType: msgTypes.msg_normal
      }
    }
  } else if (data.info.length === 3) {
    // 猜问题
    msg = {
      nickName: data.botName,
      content: '',
      isSelfSend: false,
      time: data.time,
      msgStatus: msgStatus.msg,
      msgType: msgTypes.msg_guess,
      msgExtend: [
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
  }
  return msg
}
