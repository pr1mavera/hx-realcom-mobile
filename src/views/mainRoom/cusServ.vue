<template>
  <div class="cus-serv">
    <keep-alive :include="['cs-add']">
      <router-view
        :updateCsItem="deleteCsItem"
        :myCs="myCs"
        @removeCs="removeCs"
        @goToLineUp="showConfirm"
        @clickToLineUp = "showConfirm"
        @showShare="showShare"
        @resetMyCs="resetMyCs"
        @addCs="addCs"
      ></router-view>
    </keep-alive>
    <div v-transfer-dom>
      <x-dialog v-model="IOS_12_3GuideShow" class="iOS-12-3-guide">
        <div class="wrapper" id="iOS-guide-hook">
          <swiper v-model="iOSGuideIndex" class="swiper-wrapper" height="35rem" dots-position="center">
            <swiper-item class="item">
              <div class="first-guide">
                <p class="text" v-html="iOSGuideText"></p>
                <button class="btn-next" @click="iOSGuideIndex = 1">下一步</button>
                <img class="img" src="/video/static/img/iOS_12_3/1.png">
              </div>
            </swiper-item>
            <swiper-item class="item" v-for="(item, i) in iOSGuideImg" :key="i">
              <img class="guide-img" :src="item.url">
              <p class="guide-text">{{item.title}}</p>
            </swiper-item>
          </swiper>
        </div>
        <div class="iOS-guide-close extend-click" @click="IOS_12_3GuideShow = false">
          <svg class="icon" aria-hidden="true">
            <use xlink:href="#icon-chahao"></use>
          </svg>
        </div>
      </x-dialog>
    </div>
    <!--<div v-transfer-dom>  -->
      <!--<confirm v-model='alertTip'>-->
        <!--<p style="text-align:center;">{{tipCon}}</p>-->
      <!--</confirm>-->
    <!--</div>-->
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapActions } from 'vuex'
import Tools from '@/common/js/tools'
import { XDialog, Swiper, SwiperItem, TransferDomDirective as TransferDom } from 'vux'
import { ERR_OK, getCsStatus, queryCsInfo, addCs } from '@/server/index.js'
// import { roomStatus } from '@/common/js/status'

export default {
  name: 'cus-serv',
  directives: {
    TransferDom
  },
  components: {
    Swiper,
    SwiperItem,
    XDialog
  },
  computed: {
    ...mapGetters([
      'userInfo'
    ])
  },
  data() {
    return {
      myCs: [], // 我的专属客服
      csSelected: {},
      deleteCsItem: null,
      // iOS 12.3 引导是否显示
      IOS_12_3GuideShow: false,
      // 引导当前页数
      iOSGuideIndex: 0,
      // 引导页首页文案
      iOSGuideText: '尊贵的VIP客户，<br>&emsp;&emsp;您好~现检测到您的系统版本为iOS12.3及以上，为了不影响您的视频体验，请点击“下一步”按钮完成设置项再进行视频拨打，以免发生视频过程中的异常情况，谢谢配合~',
      // 引导页轮播
      iOSGuideImg: [
        {
          url: '/video/static/img/iOS_12_3/2.png',
          title: `打开“设置”，点击“Safari浏览器”`
        },
        {
          url: '/video/static/img/iOS_12_3/3.png',
          title: `点击“高级”选项`
        },
        {
          url: '/video/static/img/iOS_12_3/4.png',
          title: `点击“Experimental Features”选项`
        },
        {
          url: '/video/static/img/iOS_12_3/5.png',
          title: `关闭“WebRTC Unified Plan”选项`
        }
      ]
    }
  },
  // created() {

  // },
  async activated() {
    this.$vux.loading.show({ text: '请稍后' })
    await this.getCsList()
    this.nextUrl()
    this.$vux.loading.hide()
  },
  mounted() {
    // this.nextUrl()
    // this.IOS_12_3GuideShow = true
    this.$nextTick(() => {
      document.getElementById('iOS-guide-hook').addEventListener('touchmove', event => {
        const e = event || window.event
        e.preventDefault()
      }, true)
    })
  },
  methods: {
    showConfirm(cs) {
      this.csSelected = cs
      const self = this
      this.$vux.confirm.show({
        title: '您即将转入视频客服',
        onConfirm() {
          self.goToLineUp()
        }
      })
    },
    resetMyCs(list) {
      this.myCs = list
    },
    // 删除
    removeCs(i) {
      this.myCs = this.myCs.reduce((val = [], item, index) => {
        if (index === i) {
          // this.$refs.csComponents.updateCsList(item)
          this.deleteCsItem = item
          return val
        } else {
          return val.concat(item)
        }
      }, [])
      // this.myCs = this.myCs.filter((item, index) => index !== i)

      this.myCs.length === 0 && this.$router.replace('/room/cusServ/add')
    },
    showShare(csId, csName) {
      this.$emit('showShare', csId, csName)
    },

    // 判断是否显示iOS12.3的引导内容，每次进入页面后第一次点击视频咨询时显示引导，显示状态保存至sessionStorage
    isIOS_12_3GuideShow({ device, version, sysConfiOSGuide }) {
      return sysConfiOSGuide.value && // 系统配置是否提示
             device === 'iPhone' && // 当前为iOS环境
             +version >= 12.3 && // iOS版本为12.3以上
             !JSON.parse(sessionStorage.getItem('iOSGuideShowed')) // 未提示过
    },

    // 进入视频客服
    async goToLineUp() {
      const device = sessionStorage.getItem('device')
      const version = sessionStorage.getItem('device_version')

      const [ videoVersion, sysConfiOSGuide ] = await Promise.all([
        this.systemConfig('ios-ver'),
        this.systemConfig('isIosGuideShow')
      ])
      // const videoVersion = await this.systemConfig('ios-ver')
      if (device === 'iPhone' && +version <= +videoVersion.get()) {
        // 当前系统版本过低
        return this.$vux.alert.show({
          title: `抱歉，您当前系统版本过低，暂不支持视频服务`
        })
      }

      // iOS12.3 需显示引导页
      if (this.isIOS_12_3GuideShow({ device, version, sysConfiOSGuide })) {
      // if (true) {
        this.IOS_12_3GuideShow = true
        sessionStorage.setItem('iOSGuideShowed', true)
        return void 0
      }

      // 判断当前是否为工作时间（白名单用户，忽略工作时间）
      const SP_workT = this.userInfo.workTimeInfo.SP
      if (
        !this.userInfo.isWhiteList && // 非白名单用户
        !Tools.DateTools.isWorkTime(SP_workT) // 不在工作时间
      ) {
        this.$vux.alert.show({
          title: `抱歉，当前为非工作时间，视频客服工作时间为周一至周日${SP_workT.startTime}-${SP_workT.endTime}，请在工作时间内来询，感谢您的关注！`
        })
        return
      }

      const res = await getCsStatus(this.csSelected.id)
      const status = Number(res.data.status || this.csSelected.status)
      // 只有就绪和忙碌可以排队
      switch (true) {
        case status === 1 || status === 7:
          this.$vux.alert.show({
            title: '啊呀，客服暂时还没准备好呢~'
          })
          break
        case status === 3 || status === 5:
          this.$emit('requestVideoServer', {
            csId: this.csSelected.id,
            csName: this.csSelected.nickName,
            csNick: this.csSelected.nickName
          })
          // this.$router.push({path: `/room/line-up?csId=${this.csSelected.id}&csName=${this.csSelected.nickName}`})
          // this.beforeQueue({
          //   mode: roomStatus.videoChat,
          //   content: `尊敬的${+this.userInfo.userGrade <= 3 ? this.userInfo.userGradeName : ''}客户，正在为您转接视频客服，请稍后。`
          // })
          break
        case status === 4:
          this.$vux.alert.show({
            title: '啊呀，客服正在休息呐~'
          })
          break
        case status === 2 || status === -1:
          this.$vux.alert.show({
            title: '啊呀，客服暂时不在呢~'
          })
          break
      }
    },

    // 查询专属客服 change by wnagxj
    async getCsList() {
      const page = 1
      const pageSize = -1
      const userId = this.userInfo.userId // 获取用户的ID
      const listType = '1' // 请求我的专属客服
      const res = await queryCsInfo(page, pageSize, userId, listType)

      if (res.result.code === ERR_OK) {
        // 更新当前的专属客服列表
        this.resetMyCs(res.data.csList)
      } else {
        console.log('error in queryCsInfo' + JSON.stringify(res.result))
      }
    },

    // 判断路由 change by wnagxj
    nextUrl() {
      // debugger
      if (this.$route.query.csType === 'online') { // 进入在线客服的个人中心
        this.$router.push({
          path: '/room/cusServ/serverDetail',
          query: {
            cusSerId: this.$route.query.cusSerId,
            csType: 'online'
          }
        })
        return
      }
      if (this.myCs.length === 0) {
        this.$router.replace('/room/cusServ/add')
      } else {
        this.$router.replace('/room/cusServ/list')
      }
    },

    // 添加为专属客服
    async addCs(csInfo) {
      if (this.myCs.length >= 3) {
        this.$vux.toast.text('最多只能添加三名专属客服呢', 'default')
        return
      }
      const res = await addCs(csInfo)
      if (res.result.code === ERR_OK) {
        // console.log(JSON.stringify(res))
        this.getCsList() // 更新专属客服列表（重新查询）待优化
        this.$vux.toast.text('您已成功添加专属客服', 'default')
      } else {
        console.log('error about add the cS' + JSON.stringify(res.result))
      }
    },
    ...mapActions([
      'systemConfig'
    ])
  }
}
</script>

<style lang="less">

.iOS-12-3-guide {
  position: relative;
  .weui-dialog {
    background-color: unset;
    width: 100vw;
    max-width: 100vw;
    height: 42rem;
    // transform: translateY(-2rem);
    overflow: unset;
    .wrapper {
      // padding:15px;
      height: 35rem;
      .swiper-wrapper {
        &, .vux-swiper {
          overflow: unset;
        }
        .item {
          width: 100%;
          .first-guide {
            position: relative;
            width: 25rem;
            height: 96%;
            border-radius: 0.8rem;
            margin: 0 auto;
            background-color: #fff;
            box-shadow: 0rem 0.4rem 1.5rem 0.1rem rgba(0, 0, 0, 0.2);
            box-sizing: border-box;
            padding: 3.8rem 3.1rem 0;
            overflow: hidden;
            .text {
              color: #222;
              font-size: 1.4rem;
              line-height: 1.6;
              text-align: left;
              letter-spacing: -0.05rem;
            }
            .btn-next {
              position: absolute;
              left: 2.8rem;
              bottom: 2.8rem;
              display: block;
              color: #000;
              font-size: 1.4rem;
              line-height: 1.4rem;
              width: max-content;
              z-index: 1;
              background-color: #fff;
              border: unset;
              border-radius: 1.5rem;
              box-sizing:content-box;
              padding: 0.8rem 2.4rem;
              white-space: nowrap;
              box-shadow: 0rem 0.4rem 1rem 0.1rem rgba(0, 0, 0, 0.1);
            }
            .img {
              position: absolute;
              right: 0;
              bottom: 0;
              width: 100%;
              height: unset;
              z-index: 0;
            }
          }
          .guide-img {
            height: 100%;
            object-fit: contain;
          }
          .guide-text {
            color: #fff;
            font-size: 1.8rem;
            line-height: 3.8rem;
            font-weight: 300;
          }
        }
        .vux-indicator {
          position: absolute;
          bottom: -6rem;
          --rectX: 0.6rem;
          transform: translateX(calc(~'50% - var(--rectX)'));
          a {
            margin-left: calc(~'var(--rectX) * 2');
            .vux-icon-dot {
              box-sizing: border-box;
              --dot-color: #fff;
              --radius: 0.4rem;
              width: calc(~'var(--radius) * 2');
              height: calc(~'var(--radius) * 2');
              border-radius: var(--radius);
              border: .05rem solid var(--dot-color);
              background-color: unset;
              &.active {
                background-color: var(--dot-color);
              }
            }
          }
        }
      }
    }
    .iOS-guide-close {
      --bound: 1.3rem;
      position: absolute;
      top: -2rem;
      right: 4.4rem;
      width: var(--bound);
      height: var(--bound);
      .icon {
        fill: #fff;
        width: 100%;
        height: 100%;
      }
    }
  }
  .dialog-title {
    line-height: 30px;
    color: #666;
  }
}
</style>
