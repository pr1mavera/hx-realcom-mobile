<template>
  <div class="fload-button">
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="callPhone"
      :class="[{'visible-when-input': barStatus, 'item-1': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-dianhuakefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="videoLineUp"
      :class="[{'visible-when-input': barStatus, 'item-2': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-shipinkefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="onLineLineUp"
      :class="[{'visible-when-input': barStatus, 'item-3': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-zhuanshukefu"></use>
      </svg>
    </button>
    <button
      class="item extend-click transition-bezier"
      :disabled="barStatus"
      @click="clickAssess"
      :class="[{'visible-when-input': barStatus, 'item-4': !barStatus}]">
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-pingjiashouye"></use>
      </svg>
    </button>
    <div v-transfer-dom>
      <alert v-model="showAlert" :title="alertContent" :mask-z-index="1000"></alert>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { Alert, TransferDomDirective as TransferDom } from 'vux'
import { mapGetters, mapMutations } from 'vuex'
import { roomStatus } from '@/common/js/status'

export default {
  directives: {
    TransferDom
  },
  components: {
    Alert,
    'Assess': () => import('@/views/mainRoom/components/assess')
  },
  props: {
    barStatus: {
      type: Boolean
    }
  },
  computed: {
    ...mapGetters([
      'roomMode'
    ])
  },
  data() {
    return {
      showAlert: false,
      alertContent: ''
    }
  },
  methods: {
    callPhone() {
      window.location.href = 'tel:95300'
    },
    // 视频客服
    videoLineUp() {
      switch (this.roomMode) {
        case roomStatus.AIChat:
          this.$emit('enterVideoLineUp')
          break
        case roomStatus.videoChat:
          this.alertContent = '当前已经在视频中！！'
          this.showAlert = true
          break
        case roomStatus.menChat:
          this.alertContent = '当前正在人工客服中！！请先退出'
          this.showAlert = true
          break
      }
    },
    // 在线客服
    onLineLineUp() {
      switch (this.roomMode) {
        case roomStatus.AIChat:
          this.$emit('enterOnLineLineUp')
          break
        case roomStatus.videoChat:
          this.alertContent = '当前正在视频客服中！！请先退出'
          this.showAlert = true
          break
        case roomStatus.menChat:
          this.alertContent = '当前已经在人工客服中！！'
          this.showAlert = true
          break
      }
    },
    clickAssess() {
      switch (this.roomMode) {
        case roomStatus.AIChat:
        this.alertContent = '当前未接通任何坐席，暂不能评价'
        this.showAlert = true
          break
        case roomStatus.videoChat:
          this.setAssessView(true)
          break
        case roomStatus.menChat:
          this.setAssessView(true)
          break
      }
    },
    ...mapMutations({
      setAssessView: 'SET_ASSESS_VIEW'
    })
  }
}
</script>

<style lang="less">
@import '~@/common/style/mixin.less';
@import '~@/common/style/theme.less';

.fload-button {
  .item {
    display: block;
    width: 3.4rem;
    height: 3.4rem;
    padding: 0;
    margin-bottom: 2.2rem;
    border: 0;
    // border: 0.2rem solid @theme;
    border-radius: 50%;
    // background-color: @bg-light;
    transition: all cubic-bezier(0.4, 0, 0, 1) .2s;
    &:last-child {
      margin-bottom: 0;
    }
    &.visible-when-input {
      transform: translateY(-3rem);
      opacity: 0;
    }
    &.item-1 {
      transition-delay: .34s;
    }
    &.item-2 {
      transition-delay: .31s;
    }
    &.item-3 {
      transition-delay: .28s;
    }
    &.item-4 {
      transition-delay: .25s;
    }
    .icon {
      width: 100%;
      height: 100%;
      // fill: @theme;
    }
  }
}
</style>
