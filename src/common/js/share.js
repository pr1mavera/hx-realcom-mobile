import wx from 'weixin-jsapi'
import { getShareTicket } from '@/server/index.js'

const shareJs = async function(shareUrl) {
  // const res = await getShareTicket(shareUrl)
  getShareTicket(shareUrl).then((res) => {
    const jssdk = res.data
    wx.config({
      debug: false,
      appId: jssdk.appId,
      timestamp: parseInt(jssdk.timestamp),
      nonceStr: jssdk.nonceStr,
      signature: jssdk.signature,
      jsApiList: [
        'hideAllNonBaseMenuItem',
        'showMenuItems',
        'onMenuShareTimeline',
        'onMenuShareAppMessage'
      ]
    })
  })
  // if (res.result.code === ERR_OK) {
  //   const jssdk = res.data
  //   wx.config({
  //     debug: false,
  //     appId: jssdk.appId,
  //     timestamp: parseInt(jssdk.timestamp),
  //     nonceStr: jssdk.nonceStr,
  //     signature: jssdk.signature,
  //     jsApiList: [
  //       'hideAllNonBaseMenuItem',
  //       'showMenuItems',
  //       'onMenuShareTimeline',
  //       'onMenuShareAppMessage'
  //     ]
  //   })
  //   console.log('我特娘的配置完微信数据啦！！')
  // } else {
  //   console.log('getShareTicket error')
  // }
  const options = {
    title: '田老师红烧肉盖饭',
    desc: '田老师红烧肉盖饭',
    link: shareUrl,
    imgUrl: 'https://q.qlogo.cn/g?b=qq&nk=1581730156&s=100&t=1542878629954'
  }
  // options = Object.assign({}, defaults, options)
  wx.ready(function() {
    alert('wx ====== ready')
    const thatopts = options
    wx.hideAllNonBaseMenuItem()
    // wx.showMenuItems({
    //   menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
    // })
    wx.showMenuItems({
      menuList: [
        'menuItem:readMode', // 闃呰妯″紡
        'menuItem:share:timeline', // 鍒嗕韩鍒版湅鍙嬪湀
        'menuItem:copyUrl' // 澶嶅埗閾炬帴
      ],
      success: function(res) {
        alert('批量显示菜单')
      },
      fail: function(res) {
        alert(JSON.stringify(res))
      }
    })
    wx.onMenuShareTimeline({
      title: thatopts.title, // 分享标题
      desc: thatopts.desc, // 分享描述
      link: thatopts.link, // 分享链接
      imgUrl: thatopts.imgUrl, // 分享图标
      trigger: function(res) {
        alert('trigger', res)
      },
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
      trigger: function(res) {
        alert('trigger', res)
      },
      success: function() {
        alert('成功')
      },
      cancel: function() {
        alert('失败')
      }
    })
  })
}

export default shareJs
