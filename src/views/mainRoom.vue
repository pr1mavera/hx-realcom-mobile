<template>
  <div class="main-room">
    <keep-alive>
      <router-view class="router-view"></router-view>
    </keep-alive>
    <videoBar class="video-bar"></videoBar>
  </div>
</template>

<script type="text/ecmascript-6">
import { ERR_OK, getUserInfoByOpenID } from '@/server/index.js'
import { mapMutations } from 'vuex'

export default {
  components: {
    'videoBar': () => import('@/views/mainRoom/videoBar')
  },
  data() {
    return {

    }
  },
  mounted() {
    this._setUserBaseProfile('oKXX7wABsIulcFpdlbwUyMKGisjQ')
  },
  methods: {
    async _setUserBaseProfile(openID) {
      const res = await getUserInfoByOpenID(openID)
      if (res.result.code === ERR_OK) {
        console.log('============================= 我现在来请求 UserInfoByOpenID 辣 =============================')
        this.setUserInfo(res.data.userInfo)
      } else {
        console.log('error in getUserInfoByOpenID')
      }
    },
    ...mapMutations({
      setUserInfo: 'SET_USER_INFO'
    })
  }
}
</script>

<style lang="less">
.main-room {
  width: 100%;
  height: 100%;
  .router-view {
    position: relative;
    width: 100%;
    height: 100%;
    z-index: 10;
  }
  .video-bar {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 101;
  }
}
</style>
