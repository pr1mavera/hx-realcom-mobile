let wx = {}
exports.wx = wx

wx.hideMenu = function() {
  // eslint-disable-next-line
  WeixinJSBridge.call('hideOptionMenu')
}
if (typeof WeixinJSBridge === 'undefined') {
  if (document.addEventListener) {
    document.addEventListener('WeixinJSBridgeReady', wx.hideMenu, false)
  } else if (document.attachEvent) {
    document.attachEvent('WeixinJSBridgeReady', wx.hideMenu)
    document.attachEvent('onWeixinJSBridgeReady', wx.hideMenu)
  }
} else {
  wx.hideMenu()
}
