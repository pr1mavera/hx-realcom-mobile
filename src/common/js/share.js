import wx from 'weixin-jsapi'
import { getShareTicket } from '@/server/index.js'

const shareJs = async function(shareUrl) {
  // const res = await getShareTicket(shareUrl)
  getShareTicket(shareUrl).then((res) => {
    const jssdk = res.data
    console.log(res.data)
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
    // alert('wx ====== ready')
    const thatopts = options
   // wx.hideAllNonBaseMenuItem()
    // wx.showMenuItems({
    //   menuList: ['menuItem:share:appMessage', 'menuItem:share:timeline'] // 要显示的菜单项，所有menu项见附录3
    // })
    wx.showMenuItems({
      menuList: [
        'menuItem:share:appMessage',
        'menuItem:share:timeline'
      ],
      success: function(res) {
        console.log('批量显示菜单')
        // alert('批量显示菜单')
      },
      fail: function(res) {
        console.log('批量显示菜单失败:' + JSON.stringify(res))
        // alert(JSON.stringify(res))
      }
    })
    // 分享给朋友
    // wx.onMenuShareAppMessage({
    //   title: thatopts.title, // 分享标题
    //   desc: thatopts.desc, // 分享描述
    //   link: thatopts.link, // 分享链接
    //   imgUrl: thatopts.imgUrl, // 分享图标
    //   trigger: function(res) {
    //     console.log('onMenuShareAppMessage触发失败:' + JSON.stringify(res))
    //     // alert('trigger', res)
    //   },
    //   success: function() {
    //     console.log('onMenuShareAppMessage分享成功')
    //   },
    //   fail: function(res) {
    //     console.log('onMenuShareAppMessage分享失败:' + JSON.stringify(res))
    //   }
    // })
    // 分享到朋友圈
    wx.onMenuShareTimeline({
      title: thatopts.title, // 分享标题
      desc: thatopts.desc, // 分享描述
      link: thatopts.link, // 分享链接
      imgUrl: thatopts.imgUrl, // 分享图标
      trigger: function(res) {
        console.log('onMenuShareTimeline触发失败:' + JSON.stringify(res))
      },
      success: function() {
        console.log('onMenuShareTimeline分享成功')
      },
      fail: function(res) {
        console.log('onMenuShareTimeline分享失败:' + JSON.stringify(res))
      }
    })
  })
}

export default shareJs
