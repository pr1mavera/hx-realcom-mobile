import wx from 'weixin-jsapi'
import { getShareTicket } from '@/server/index.js'

const shareJs = async function(shareUrl) {
  // const res = await getShareTicket(shareUrl)
  getShareTicket(shareUrl).then((res) => {
    const jssdk = res.data
    console.log(res.data)
    wx.config({
      debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印
      appId: jssdk.appId, // 必填，公众号的唯一标识
      timestamp: parseInt(jssdk.timestamp),
      nonceStr: jssdk.nonceStr, // 必填，生成签名的时间戳
      signature: jssdk.signature, // 必填，签名
      jsApiList: [
        'hideAllNonBaseMenuItem', // 隐藏所有非基本菜单项
        'showMenuItems', // 批量显示菜单项
        'onMenuShareTimeline', // 分享到朋友圈
        'onMenuShareAppMessage', // 监听“分享给朋友”，按钮点击、自定义分享内容及分享结果接口
        'hideMenuItems', // 批量隐藏菜单
        'showMenuItems', // 批量显示菜单
        'hideOptionMenu', // 隐藏右上角菜单
        'showOptionMenu' // 显示右上角的菜单
      ]
    })

    // 调用微信API
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
    /*
    * @change by Wang xinjie
    * */
    // wx.showMenuItems({
    //   menuList: [
    //     'menuItem:share:appMessage',
    //     'menuItem:share:timeline'
    //   ],
    //   success: function(res) {
    //     console.log('批量显示菜单')
    //     // alert('批量显示菜单')
    //   },
    //   fail: function(res) {
    //     console.log('批量显示菜单失败:' + JSON.stringify(res))
    //     // alert(JSON.stringify(res))
    //   }
    // })
    /*
     * @change by Wang xinjie
     * */
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

    /*
     * @change by Wang xinjie
     * */
    wx.showMenuItems({
      menuList: [
        'menuItem:openWithSafari' // 要显示的菜单项:在safari浏览器中打开
      ]
    })

    wx.error(function(res) {
      console.log('there are some error about share js' + res + '======')
    })
    /*
     * @change by Wang xinjie
     * */
  })
}

export default shareJs
