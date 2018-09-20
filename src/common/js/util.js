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

export async function sleep(time) {
  return new Promise((resolve, reject) => {
    setTimeout(function() {
      resolve()
    }, time)
    // debounce(() => {
    //   resolve()
    // }, time)()
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
