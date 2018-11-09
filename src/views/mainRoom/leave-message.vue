<template>
  <div class="container">
    <div class="header">
      <img class="avatar" src="/static/img/leaveMsg/leaveMsgAvatar@2x.png"
           srcset="/static/img/leaveMsg/leaveMsgAvatar.png 1x,
                /static/img/leaveMsg/leaveMsgAvatar@2x.png 2x,
                /static/img/leaveMsg/leaveMsgAvatar@3x.png 3x">
      <p>客服暂时不在线，偷偷告诉他</p>
    </div>
    <section>
      <p class="tips">请在下方留言</p>
      <textarea class="msgBoard" v-model.trim="leaveWordDescription" placeholder="例如：追加保费的注意事项是什么？"></textarea>
    </section>
    <group>
      <x-input title="手机号码" v-model.trim="callNumber" name="mobile" placeholder="请输入手机号码" keyboard="number" :max="11"
              type="tel" is-type="china-mobile" style="font-size: 1.4rem"></x-input>
    </group>
    <x-button :gradients="['#FF8C6A', '#FF80A0']" style="width: 15rem;margin: 3rem auto 0;" @click.native="submitMsg">提 交</x-button>
    <leave-msg-suc v-if="submitMsgSuc"></leave-msg-suc>
  </div>
</template>

<script type="text/ecmascript-6">
  import { XInput, Cell, Group, XButton } from 'vux'
  import { leaveMsg } from '@/server/index.js'
  export default {
    // name: "leave-message.vue"
    components: {
      XInput,
      Cell,
      Group,
      XButton,
      'leaveMsgSuc': () => import('@/views/mainRoom/components/leave-msg-suc')
    },
    data() {
      return {
        leaveWordDescription: '', // 留言描述
        callNumber: '', // 手机号码
        submitMsgSuc: false
      }
    },
    methods: {
      // 保存留言
      async submitMsg() {
        // 便于测试现未对输入信息进行校验
        // this.submitMsgSuc = true
        debugger
        if (this.leaveWordDescription !== '' && this.callNumber !== '') {
          const now = new Date()
          const year = JSON.stringify(now.getFullYear())
          const month = now.getMonth() + 1 >= 10 ? JSON.stringify(now.getMonth()) : '0' + JSON.stringify(now.getMonth())
          const day = now.getDate() >= 10 ? JSON.stringify(now.getDate()) : '0' + JSON.stringify(now.getDate())
          const hour = now.getHours() >= 10 ? JSON.stringify(now.getHours()) : '0' + JSON.stringify(now.getHours())
          const min = now.getMinutes() >= 10 ? JSON.stringify(now.getMinutes()) : '0' + JSON.stringify(now.getMinutes())
          const seconds = now.getSeconds() >= 10 ? JSON.stringify(now.getSeconds()) : '0' + JSON.stringify(now.getSeconds())

          const data = {
            'callNumber': this.callNumber,
            'leaveWordDescription': this.leaveWordDescription,
            // 'leaveWordDate': '2018-11-08 15:58:38',
            'leaveWordDate': year + '-' + month + '-' + day + ' ' + hour + ':' + min + ':' + seconds,
            'origin': '01', // 1.官微2.凤凰营销（简称为营销）3.官网4.中介公众号（简称为中介）5.龙行银保（简称为银保）
            'leaveWordSource': '04', // 01-在线平台 02-服务箱（小华e家）03- 呼入04 - 虚拟
            'openId': this.$route.query.openId
          }
          debugger
          const res = await leaveMsg(data)
          debugger
          if (res) {
            this.submitMsgSuc = true // 留言保存成功
            console.log(JSON.stringify(res))
          }
        } else if (this.leaveWordDescription === '') {
          this.$vux.alert.show({
            title: '咦~请您描述您的问题~~'
          })
        } else {
          this.$vux.alert.show({
            title: '咦~您还没有填写手机号呢~~'
          })
        }
      }
    }
  }
</script>

<style scoped lang="less">
  @import '~@/common/style/theme.less';
  .container {
    height: unset;
    min-height: 100vh;
    background: @bg-normal;
    .header {
      width: 100%;
      height: 18rem;
      text-align: center;
      background: url("/static/img/leaveMsg/leaveMsgBg.png");
      background-size: cover;
      .avatar {
        margin: 3rem auto 1.2rem;
      }
      p {
        color: #ffffff;
        font-size: 1.2rem;
      }
    }
    section {
      padding: 2rem 1.2rem;
      margin-top: -.7rem;
      margin-bottom: -1rem;
      background: #ffffff;
      border-top-left-radius: 1rem;
      border-top-right-radius: 1rem;
      .tips {
        color: @text-normal;
        font-size: 1.4rem;
      }
      .msgBoard {
        width: 35.1rem;
        height: 14.8rem;
        color: #646464;
        font-size: 1.4rem;
        line-height: 1.25;
        margin-top: 1.5rem;
        padding: .8rem .6rem;
        text-align: justify;
        border-radius: 0;
        border: 1px solid #D6D7DC;
        box-sizing: border-box;
      }
    }
  }
</style>
