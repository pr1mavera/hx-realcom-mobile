<template>
  <div class="cs-add">
    <div class="cs-label-wrapper">
      <transition @enter="switchLabelFrame">
        <div class="cs-label-container" id="csLabelContainer" v-if="curLabelInfo">
          <div
            class="cs-label"
            ref="csLabel"
            @touchstart.stop.prevent="startSlide($event)"
            @touchmove.stop.prevent="slideMove($event)"
            @touchend.stop.prevent="endSlide($event)"
            :style="setRotate"> <!-- 限制边框范围及显示阴影 -->
            <div class="container">
              <div class="header">
                <img width=100% class="header-img" src="/static/img/chat/csAddBg.png">
                <div class="header-msg">
                  <div class="avatar">
                    <img width=100% height=100% src="/static/img/avatar.png">
                  </div>
                  <div class="nickname">{{curLabelInfo.nickname}}</div>
                </div>
              </div>
              <div class="video-btn">
                <button class="button">视频咨询</button>
              </div>
              <div class="cs-info">
                <ul>
                  <li class="cs-info-list">
                    <span class="title">服务总量</span>
                    <span class="text">
                      <label>{{curLabelInfo.serviceTime}}次</label>
                    </span>
                  </li>
                  <li class="cs-info-list">
                    <span class="title">收到礼物</span>
                    <span class="text">
                      <label>{{curLabelInfo.gift}}次</label>
                    </span>
                  </li>
                  <li class="cs-info-list">
                    <span class="title">客服标签</span>
                    <span class="text">
                      <label>甜美可爱</label>
                      <label>善解人意</label>
                      <label>活泼可爱</label>
                    </span>
                  </li>
                </ul>
              </div>
              <div class="footer-btn">设定喜欢的客服标签</div>
            </div>
          </div>
        </div>
      </transition>
    </div>
    <div class="slide-tip">
      <div class="tip tip-left">
        <span class="label">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-zuohua"></use>
          </svg>
        </span>
        <span class="text">左滑切换</span>
      </div>
      <div class="tip tip-right">
        <span class="text">右滑添加</span>
        <span class="label">
          <svg class="icon extend-click" aria-hidden="true">
            <use xlink:href="#icon-zuohua"></use>
          </svg>
        </span>
      </div>
    </div>
    <div class="slide-btn">
      <div class="btn btn-left">切 换</div>
      <div class="btn btn-right" @click="addCS">添加为专属客服</div>
    </div>
    <div class="fload-tip">
      <div class="tip tip-left" id="fload-tip-left" :class="{'show-fload-tip-left': angle <= -targAngle}">
        <svg class="icon extend-click" aria-hidden="true">
          <use xlink:href="#icon-huanyipi"></use>
        </svg>
      </div>
      <div class="tip tip-right" id="fload-tip-right" :class="{'show-fload-tip-right': angle >= targAngle}">
        <svg class="icon extend-click" aria-hidden="true">
          <use xlink:href="#icon-zhuanshukefu"></use>
        </svg>
        <badge text="1"></badge>
      </div>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { sleep } from '@/common/js/util'
import { Badge } from 'vux'
import anime from 'animejs'
import { addCs, queryCsInfo } from '@/server/index.js'

export default {
  components: {
    Badge
  },
  data() {
    return {
      /**
       * scale_r:       // 卡片旋转半径
       * touch_start_x: // 用户touch的起始位置
       * angle:         // 卡片旋转角度
       * opacityNum:    // 卡片透明度
       * targAngle:     // 卡片旋转触发切换或者添加的角度
       * endAngle:      // 卡片旋转结束后的终止位置
       * @type {Number}
       */
      scale_r: 700,
      touch_start_x: 0,
      angle: 0,
      opacityNum: 1,
      targAngle: 10,
      endAngle: 40,
      curLabelInfo: null,
      cslist: [
        {
          cs_id: 123456,
          nickname: '丽丽',
          serviceTime: 12,
          gift: 123
        },
        {
          cs_id: 123456,
          nickname: '田老师红烧肉',
          serviceTime: 52372,
          gift: 2561
        }
      ],
      m_cslist: [], // 已添加的专属客服
      floadTipLeftAnimeCache: null,
      floadTipRightAnimeCache: null
    }
  },
  computed: {
    setRotate() {
      return `transform: rotateZ(${this.angle}deg); opacity: ${this.opacityNum};`
    }
  },
  mounted() {
    this.getCsList()
    this.$nextTick(() => {
      this.curLabelInfo = this.cslist[0]
    })
  },
  methods: {
    startSlide(event) {
      const e = event.targetTouches[0]
      // const label = this.$refs.csLabel
      this.touch_start_x = e.clientX
      console.log(`x: ${this.touch_start_x}`)
    },
    slideMove(event) {
      // debugger
      const e = event.targetTouches[0]
      const move = e.clientX - this.touch_start_x
      this.angle = (Math.asin(move / this.scale_r) * 180) / Math.PI
      if (Math.abs(this.angle) >= this.targAngle) {
        this.opacityNum = 1 - (this.angle - this.targAngle) / (this.endAngle - this.targAngle)
      }
      console.log(`angle: ${this.angle}`)
    },
    async endSlide(event) {
      // const e = event.targetTouches[0]
      if (Math.abs(this.angle) <= this.targAngle) {
        // 复原
        this.angle = 0
      } else {
        if (this.angle > 0) {
          // 添加
          this.angle = this.endAngle
          // this.resetAngle()
          // 模拟请求服务，添加专属客服
          await sleep(1000)
          this.resetAngle()
          console.log('addCS')
          await sleep(10)
          this.addCS()
        } else {
          // 切换
          this.angle = -this.endAngle
          // this.resetAngle()
          await sleep(1000)
          this.resetAngle()
          console.log('switchCS')
          await sleep(10)
          this.switchCS()
        }
      }
    },
    // 将当前客服添加为专属客服
    async addCS() {
      const userId = '123'
      const cuSerId = '123'

      this.m_cslist.push(this.curLabelInfo)
      // this.cslist.splice(0, 1)
      this.curLabelInfo = this.cslist[0]

      const res = await addCs(userId, cuSerId)
      if (res) {
        console.log(JSON.stringify(res))
      }
    },
    switchCS() {
      const temp = this.cslist[0]
      this.cslist.splice(0, 1)
      this.cslist.push(temp)
      this.curLabelInfo = this.cslist[0]
    },
    resetAngle() {
      this.curLabelInfo = null
      this.angle = 0
      this.opacityNum = 1
    },
    switchLabelFrame() {
      const extendBarframes = anime.timeline()
      extendBarframes.add({
        targets: '#csLabelContainer',
        scaleX: [0, 1],
        scaleY: [0, 1],
        duration: 200,
        easing: 'easeOutBack'
      }).add({
        targets: '#csLabelContainer .header',
        translateY: [-100, 0],
        opacity: [0, 1],
        duration: 150,
        offset: 150,
        easing: 'easeInOutExpo'
      }).add({
        targets: '#csLabelContainer .video-btn',
        scaleX: [0, 1],
        scaleY: [0, 1],
        translateY: [40, 0],
        opacity: [0, 1],
        duration: 150,
        offset: 200,
        easing: 'easeInOutExpo'
      }).add({
        targets: '#csLabelContainer .cs-info-list',
        translateY: [20, 0],
        opacity: [0, 1],
        delay: function(el, i) { return i * 30 },
        duration: 100,
        offset: 250,
        easing: 'easeInOutExpo'
      }).add({
        targets: '#csLabelContainer .footer-btn',
        translateY: [20, 0],
        opacity: [0, 1],
        duration: 100,
        offset: 350,
        easing: 'easeInOutExpo'
      })
    },
    // 分页获取客服列表
    async getCsList() {
      const page = 1
      const pageSize = -1
      const userId = '123'
      const listType = '2'
      const res = await queryCsInfo(page, pageSize, userId, listType)
      if (res) {
        console.log('所有客服列表' + JSON.stringify(res))
        // const totalPage = res.data.totalCount
        // (if totalPage === -1) {不计算}else{}
        this.cslist = res.data.csList
      }
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';

.cs-add {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: @bg-light-shadow;
  .cs-label-wrapper{
    width: 100%;
    height: 44rem;
    padding: 2.5rem;
    box-sizing: border-box;
    .cs-label-container {
      width: 100%;
      height: auto;
      .cs-label {
        width: 100%;
        border-radius: 1rem;
        background-color: @bg-light;
        box-shadow: 0 0.5rem 1.2rem 0 rgba(0, 0, 0, .05);
        overflow: hidden;
        transform-origin: 50% calc(~'50% + 700px');
        // &.labelTransitionTiming {
        //   transition: all .3s cubic-bezier(0.1, 0.4, 0.35, 1.48);
        // }
        transition: transform .3s cubic-bezier(0.1, 0.4, 0.35, 1.48);
        .container {
          .header {
            position: relative;
            width: 100%;
            height: 17.5rem;
            text-align: center;
            // background-image: url('~/static/img/chat/csAddBg.png');
            // background-size: 100%;
            .header-img {
              position: absolute;
              top: 0;
              left: 0;
              z-index: 1;
              object-fit: cover;
            }
            .header-msg {
              position: absolute;
              top: 0;
              bottom: 0;
              left: 0;
              right: 0;
              margin: auto;
              width: 10.2rem;
              height: 12.6rem;
              z-index: 10;
              .avatar {
                width: 10.2rem;
                height: 10.2rem;
                border-radius: 50%;
                overflow: hidden;
                img {
                  object-fit: cover;
                }
              }
              .nickname {
                font-size: 1.4rem;
                padding-top: 1rem;
                color: @text-lighter;
              }
            }
          }
          .video-btn {
            width: 100%;
            text-align: center;
            .button {
              background-color: #fff;
              margin: 2rem 0 0 0;
              padding: 0;
              width: 6.5rem;
              height: 2rem;
              border: 1px solid rgba(255, 149, 156, .5);
              border-radius: 1rem;
              color: rgba(255, 149, 156, 1);
              font-size: 1.2rem;
            }
          }
          .cs-info {
            width: 100%;
            padding: 4rem 2rem 2rem 4rem;
            color: @text-light;
            font-size: 1.2rem;
            box-sizing: border-box;
            ul {
              width: 100%;
              .cs-info-list {
                width: 100%;
                margin-bottom: .8rem;
                display: flex;
                justify-content:space-between;
                .title {
                  width: 5rem;
                  font-weight: 700;
                }
                .text {
                  width: calc(~'100% - 6.4rem');
                  display: flex;
                  flex-wrap: nowrap;
                  label {
                    flex: 33.3%;
                  }
                }
              }
            }
          }
          .footer-btn {
            width: 100%;
            padding: 0 0 1.8rem 4rem;
            box-sizing: border-box;
            color: rgba(255, 149, 156, 1);
            font-size: 1.2rem;
          }
        }
      }
    }
  }
  .slide-tip {
    width: 100%;
    height: 4rem;
    padding: 0 7rem;
    box-sizing: border-box;
    color: #D6D7DC;
    display: flex;
    justify-content: space-between;
    margin-bottom: 1.4rem;
    .tip {
      flex: 50%;
      display: flex;
      align-items: center;
      .label {
        display: inline-block;
        width: 4rem;
        height: 4rem;
        .icon {
          width: 4rem;
          height: 4rem;
          fill: #000;
        }
      }
      .text {
        display: inline-block;
        font-size: 1.2rem;
        line-height: 1.2rem;
        font-weight: 400;
      }
      &.tip-left {
        justify-content: flex-start;
        .text {
          padding-left: 1.4rem;
        }
      }
      &.tip-right {
        justify-content: flex-end;
        .text {
          padding-right: 1.4rem;
        }
        .icon {
          transform: rotateY(180deg);
        }
      }
    }
  }
  .slide-btn {
    width: 100%;
    height: 4rem;
    padding: 0 6.2rem;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    .btn {
      border-radius: 2rem;
      font-size: 1.4rem;
      line-height: 4rem;
      cursor: pointer;
      &.btn-left {
        padding: 0 3rem;
        background-color: #fff;
        color: @text-normal;
        box-shadow: 0 0.5rem 1.2rem 0 rgba(0, 0, 0, .05);
      }
      &.btn-right {
        padding: 0 2rem;
        background: linear-gradient(to right, #FF8C6A, #FF80A0);
        color: @text-lighter;
      }
    }
  }
  .fload-tip {
    position: absolute;
    top: 2rem;
    width: 100%;
    height: 3rem;
    z-index: 200;
    .tip {
      position: absolute;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      box-sizing: border-box;
      box-shadow: 0 0.5rem 1.2rem 0 rgba(0, 0, 0, .05);
      transition: all .5s cubic-bezier(0.2, 0, 0.4, 1);
      .icon {
        width: 3rem;
        height: 3rem;
      }
      &.tip-left {
        left: 2rem;
        border: solid .1rem #fff;
        background-color: rgb(247, 224, 234);
        transform: translateX(-50rem);
        opacity: 0;
        &.show-fload-tip-left {
          transform: translateX(0);
          opacity: 1;
        }
        .icon {
          padding: 0.3rem;
          width: 2.2rem;
          height: 2.2rem;
          fill: #fff;
        }
      }
      &.tip-right {
        right: 2rem;
        transform: translateX(50rem);
        opacity: 0;
        &.show-fload-tip-right {
          transform: translateX(0);
          opacity: 1;
        }
        .vux-badge {
          position: absolute;
          right: -0.3rem;
          bottom: -0.3rem;
          vertical-align: bottom;
          // line-height: 16px;
        }
      }
    }
  }
}
</style>
