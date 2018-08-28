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
      <textarea class="msgBoard" placeholder="例如：追加保费的注意事项是什么？"></textarea>
    </section>
    <group>
      <x-input title="手机号码" name="mobile" placeholder="请输入手机号码" keyboard="number" :max="11"
              type="tel" is-type="china-mobile" style="font-size: 1.4rem"></x-input>
    </group>
    <x-button :gradients="['#FF8C6A', '#FF80A0']" style="width: 15rem;margin: 3rem auto 0;" @click.native="submitMsg">提 交</x-button>
    <leave-msg-suc v-if="submitMsgSuc"></leave-msg-suc>
  </div>
</template>

<script type="text/ecmascript-6">
  import { XInput, Cell, Group, XButton } from 'vux'
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
        submitMsgSuc: false
      }
    },
    methods: {
      submitMsg() {
        // 便于测试现未对输入信息进行校验
        this.submitMsgSuc = true
      }
    }
  }
</script>

<style scoped lang="less">
  @import '../../common/style/theme.less';
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
        font-size: 1.4rem;
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
