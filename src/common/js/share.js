import wx from 'weixin-js-sdk'

const shareJs = function(options) {
  const defaults = {
    title: '分享的标题',
    desc: '分享的描述',
    link: location.href, // 分享页面地址,不能为空
    imgUrl: 'https://tup.iheima.com/sport.png', // 分享是封面图片，不能为空
    success: function() {}, // 分享成功触发
    cancel: function() {} // 分享取消触发，需要时可以调用
  }
  options = Object.assign({}, defaults, options)
  wx.ready(function() {
    alert('showMenuItems')
    const thatopts = options
    wx.showMenuItems({
      menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
    })
    document.querySelector('#onMenuShare').onclick = function() {
      wx.onMenuShareTimeline({
        title: thatopts.title, // 分享标题
        desc: thatopts.desc, // 分享描述
        link: thatopts.link, // 分享链接
        imgUrl: thatopts.imgUrl, // 分享图标
        success: function() {
          alert('成功')
        },
        cancel: function() {
          alert('失败')
        }
      })
      wx.onMenuShareAppMessage({
        title: thatopts.title, // 分享标题
        desc: thatopts.desc, // 分享描述
        link: thatopts.link, // 分享链接
        imgUrl: thatopts.imgUrl, // 分享图标
        success: function() {
          alert('成功')
        },
        cancel: function() {
          alert('失败')
        }
      })
    }
  })
}

export default shareJs
