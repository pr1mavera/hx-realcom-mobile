<template>
  <div class="input-bar border-1px-before border-1px-after">
    <!-- <div class="input-bar-item left-item" v-if="status">
      <svg class="icon extend-click" aria-hidden="true">
        <use xlink:href="#icon-wode"></use>
      </svg>
    </div> -->
    <div class="input-bar-item input-box" :class="{'visible-padding-left': !status}">
      <!-- <div class="input-content"
        id="input-content-hook"
        ref="inputContent"
        contenteditable="true"
        type="text"
        @click="chatFocus"
        @focus.prevent="chatFocus(true)"
        @blur.prevent="chatFocus(false)"
        @keyup="chatInput($event, false)"
        @keyup.enter="chatInput($event, true)">
        </br>
      </div> -->
      <div class="input-content"
        autofocus
        placeholder="请输入..."
        id="input-content-hook"
        ref="inputContent"
        type="text"
        @click="chatFocus"
        @keyup="chatInput($event, false)"
        @keyup.enter="chatInput($event, true)"></div>
    </div>
    <div class="input-bar-item right-item">
      <button class="input-bar-item-btn" @click="toggleExtend">
        <svg class="icon extend-click" aria-hidden="true" :class="{'extend-Bar-Open': this.extendBarOpen}">
          <use xlink:href="#icon-jiahao"></use>
        </svg>
      </button>
      <!-- <svg class="icon extend-click" aria-hidden="true" @click="toggleExtend(2)">
        <use xlink:href="#icon-wode"></use>
      </svg>
      <svg class="icon extend-click" aria-hidden="true" @click="toggleExtend(3)">
        <use xlink:href="#icon-wode"></use>
      </svg> -->
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters } from 'vuex'
// import { XTextarea, Group } from 'vux'

export default {
  components: {
    // XTextarea,
    // Group
  },
  props: {
    isFocus: {
      type: Boolean
    }
  },
  computed: {
    ...mapGetters([
      'extendBarOpen'
    ])
  },
  data() {
    return {
      status: false
    }
  },
  methods: {
    toggleExtend() {
      this.$emit('toggleExtend')
    },
    chatFocus() {
      // if (this.isFocus === false) {
      //   this.$emit('targetInputBuffer')
      // }
      this.$emit('targetInputBuffer')
    },
    chatInput(event, isEnter) {
      const e = event || window.event
      const text = e.currentTarget.textContent
      // const l = document.getElementById('input-content-hook')
      this.$emit('chatInputChange', text, isEnter)
    },
    getInputEditState() {
      return this.$refs.inputContent.getAttribute('contentEditable')
    },
    removeInputEditState() {
      this.$refs.inputContent.removeAttribute('contentEditable')
    },
    setInputEditState(tag) {
      this.$refs.inputContent.setAttribute('contentEditable', tag)
    },
    getCursortPosition(element) {
      let caretOffset = 0
      const doc = element.ownerDocument || element.document
      const win = doc.defaultView || doc.parentWindow
      const sel = win.getSelection()
      if (sel.rangeCount > 0) { // 中的区域
        const range = sel.getRangeAt(0)
        const preCaretRange = range.cloneRange() // 克隆一个选中区域
        preCaretRange.selectNodeContents(element) // 设置选中区域的节点内容为当前节点
        preCaretRange.setEnd(range.endContainer, range.endOffset) // 重置选中区域的结束位置
        caretOffset = preCaretRange.toString().length
      }
      return caretOffset
    }
  }
}
</script>

<style lang="less">
@import '~@/common/style/theme.less';
@import '~@/common/style/mixin.less';

.input-bar {
  .border-1px-after(@label-line-normal);
  .border-1px-before(@label-line-normal);
  // position: relative;
  // left: 0;
  // bottom: 0;
  width: 100%;
  height: auto;
  min-height: 4.6rem;
  // padding: 0 0.8rem;
  // box-sizing: border-box;
  background-color: @bg-light;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  &.visible-padding-left {
    padding-left: 0;
  }
  .input-bar-item {
    // box-sizing: border-box;
    align-self: flex-end;
    &.left-item {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 5.6rem;
      height: 4.6rem;
    }
    &.input-box {
      width: 100%;
      height: 100%;
      padding: 0.7rem 0;
      box-sizing: border-box;
      &.visible-padding-left {
        padding-left: 0.8rem;
      }
      .input-content {
        width: 100%;
        line-height: 2.2rem;
        min-height: 3.2rem;
        max-height: 12rem;
        outline: 0;
        word-wrap: break-word;
        word-break: break-all;
        overflow-x: hidden;
        overflow-y: auto;
        // border-radius: 5px;
        padding: 0.5rem;
        // border: 0.05rem solid @label-line-normal;
        font-size: 1.4rem;
        box-sizing: border-box;
        color: @text-normal;
        // background-color: @bg-normal;
        transition: all .5s cubic-bezier(0.11, 0.62, 0.23, 1);
        -webkit-overflow-scrolling: touch;
        -webkit-user-select: text;
        &:empty:before {
          content: attr(placeholder);
          color: @label-line-normal;
          font-size: 1.2rem;
        }
        &:focus {
          content: none;
        }
      }
    }
    &.right-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 4.6rem;
      flex-basis: 4.6rem;
      height: 4.6rem;
      // padding: 0 0.8rem;
      flex-grow: 0;
      flex-shrink: 0;
      .input-bar-item-btn {
        width: 2.4rem;
        height: 2.4rem;
        border: 0;
        padding: 0;
        background-color: unset;
        margin: 0 auto;
        border-radius: 50%;
        .icon {
          margin: 0 auto;
          width: 1.4rem;
          height: 1.4rem;
          transition: all 0.4s ease-in-out;
          // transition-delay: 0.65s;
          &.extend-Bar-Open {
            transform: rotate(135deg);
            // fill: @text-normal;
          }
        }
      }
    }
    .icon {
      display: block;
      width: 2.2rem;
      height: 2.2rem;
      // padding: 0 1.2rem;
      fill: @label-line-normal;
      background-color: transparent;
      border-radius: 50%;
    }
  }

}
</style>
