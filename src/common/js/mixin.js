import { mapGetters, mapMutations, mapActions } from 'vuex'
import WebRTCRoom from '@/server/webRTCRoom'
import IM from '@/server/im'
import WebRTCAPI from 'WebRTCAPI'
// import { formatDate } from '@/common/js/dateConfig.js'
// import { roomStatus, queueStatus } from '@/common/js/status'
export const webRtcRoomMixin = {
  computed: {
    ...mapGetters([
      'fullScreen',
      'roomMode',
      'queueMode'
    ])
  },
  mounted() {

  },
  data() {
    return {
      RTC: null,
      courseName: null, // 房间名
      courseId: null, // 房间id
      selfName: null,
      selfRole: '主播',
      userID: null, // 用户id
      isRoomCreator: false,
      members: [
        // { name: "李明", id: "2343", reqeust: true, ts: new Date()-30*60*1000},
      ],
      canDraw: false,
      userAuthData: { // 用户鉴权信息
      },
      heartBeatTask: null // 心跳任务定时器
    }
  },
  methods: {
    enterToRoom(WebRTCAPI) {
      const query = this.$route.query
      console.log('Main.mounted: ', JSON.stringify(query))
      if (!query) {
          alert('请先登录!')
      } else if (query.cmd === 'create') {
          this.userID = query.userID
          this.selfRole = '坐席'
          this.canDraw = true
          this.isRoomCreator = true
          this.courseName = query.courseName || '新房间'
          this.selfName = query.creator
      } else if (query.cmd === 'enter') {
          this.userID = query.userID
          if (query.roomCreator === this.userID) { // 相当于老师重新加入房间
              this.selfRole = '坐席'
              this.canDraw = true
              this.isRoomCreator = true
          } else {
              this.selfRole = '客户'
              this.canDraw = false
              this.isRoomCreator = false
          }
          this.selfName = query.userName
          this.roomID = query.roomID
      } else if (query.cmd !== 'create' && query.cmd !== 'enter') {
          alert('发生错误，无法识别身份')
      }
      const self = this
      WebRTCRoom.getLoginInfo(
        self.userID,
        (res) => {
          self.userAuthData = res.data
          self.userID = res.data.userID
          self.userSig = res.data.userSig
          self.accountType = res.data.accountType
          self.sdkAppID = res.data.sdkAppID
          localStorage.setItem('userID', self.userID)
          self.initRTC()
        }
      )
    },
    initRTC() {
      const self = this
      const query = this.$route.query
      this.RTC = new WebRTCAPI({
        'sdkAppId': self.sdkAppID,
        'userId': self.userID,
        'userSig': self.userSig,
        'accountType': self.accountType
      }, () => {
        if (query.cmd === 'create') {
            self.actionCreateRoom(query)
        } else if (query.cmd === 'enter') {
            self.actionEnterRoom(query)
        }
      }, (error) => {
        console.error(error)
      })

      this.RTC.on('onLocalStreamAdd', (info) => {
        const videoElement = document.getElementById('localVideo')
        // const fullScreenBtn = document.getElementById('fullScreenBtn')
        if (info && info.stream) {
          videoElement.srcObject = info.stream
          videoElement.muted = true
        }
      })
      this.RTC.on('onRemoteStreamUpdate', (info) => {
        const videoElement = document.getElementById('remoteVideo')
        // const videoElement = document.getElementById(`v_${info.videoId}`)
        if (videoElement) {
            videoElement.srcObject = null
        }
        if (info && info.stream) {
          videoElement.srcObject = info.stream
        }
        // if (info && info.stream) {
        //   const temp = []
        //   // eslint-disable-next-line
        //   for (let i = 0; i < self.members.length; i++) {
        //     if (self.members[i].openId !== info.openId) {
        //       temp.push(self.members[i])
        //     }
        //   }
        //   const member = {
        //     id: info.videoId,
        //     name: info.openId,
        //     request: false,
        //     role: '主播',
        //     roleText: '连麦',
        //     ts: Date.now(),
        //     stream: info.stream,
        //     openId: info.openId
        //   }
        //   temp.push(member)
        //   self.members = temp
        // } else {
        //   console.info(`${info.openId}进入了房间`)
        // }
      })

      this.RTC.on('onRemoteStreamRemove', (info) => {
        const videoElement = document.getElementById(`v_${info.videoId}`)
        if (videoElement) {
          videoElement.srcObject = null
        }
        const temp = []
        // eslint-disable-next-line
        for (let i = 0; i < self.members.length; i++) {
          if (self.members[i].id !== info.videoId) {
            temp.push(self.members[i])
          }
        }
        self.members = temp
      })

      this.RTC.on('onKickOut', () => {
        console.warn('其他地方登录，被踢下线')
        // self.goHomeRouter()
      })

      this.RTC.on('onWebSocketClose', () => {
        console.warn('websocket断开')
        // self.goHomeRouter()
      })

      this.RTC.on('onRelayTimeout', () => {
        console.warn('服务器超时断开')
        // self.goHomeRouter()
      })
    },
    afterCreateRoom(courseInfo) {
      const self = this
      self.courseId = courseInfo.courseId
      self.courseName = courseInfo.courseName
      // 创建房间
      this.RTC.createRoom({
        // roomid: parseInt(self.courseId, 10),
        roomid: 12345678,
        role: 'miniwhite'
      }, () => {
          console.info('ENTER RTC ROOM OK')
      }, (result) => {
        if (result) {
          console.error('ENTER RTC ROOM failed')
          // self.goHomeRouter()
        }
      })
      // this.initIM()
      // this.renderMemberList()
    },
    actionCreateRoom(query) {
      console.log('-> action create room')
      const self = this

      // 本地存储，刷新的时候还是同一个房间号
      if (localStorage.getItem('course_info')) {
        const courseInfo = JSON.parse(localStorage.getItem('course_info'))
        console.log('localstorage', courseInfo)
        self.afterCreateRoom(courseInfo)
        self.heartBeatTask = WebRTCRoom.startHeartBeat(
          self.userID,
          courseInfo.courseId,
          () => {},
          () => {
            // self.$toast.center('心跳包超时，请重试~')
            console.log('心跳包超时，请重试~')
            // self.goHomeRouter()
          }
        )
      } else {
        WebRTCRoom.createRoom(
          self.userID,
          self.selfName,
          query.courseName,
          (res) => {
            // 发送心跳包
            self.heartBeatTask = WebRTCRoom.startHeartBeat(
              self.userID,
              res.data.roomID,
              () => {},
              () => {
                // self.$toast.center('心跳包超时，请重试~')
                console.log('心跳包超时，请重试~')
                // self.goHomeRouter()
              }
            )
            const info = {
              courseId: res.data.roomID,
              courseName: query.courseName
            }
            // 本地存储，刷新的时候还是同一个房间号
            // localStorage.setItem('course_info', JSON.stringify(info))
            self.afterCreateRoom(info)
          },
          () => {
            // error, 返回
            // self.goHomeRouter()
          }
        )
      }
    },
    actionEnterRoom(query) {
      const self = this
      self.courseId = query.roomID
      self.courseName = query.roomInfo
      self.selfName = query.userName
      WebRTCRoom.enterRoom(
        self.userID,
        query.userName,
        self.courseId,
        (res) => {
          // 发送心跳包
          self.heartBeatTask = WebRTCRoom.startHeartBeat(
            self.userID,
            res.data.roomID,
            () => {},
            () => {
              // self.$toast.center('心跳包超时，请重试~')
              console.log('心跳包超时，请重试~')
              // self.goHomeRouter()
            }
          )

          // 进房间
          self.RTC.createRoom(
            {
              // roomid: parseInt(self.courseId, 10),
              roomid: 12345678,
              role: 'miniwhite'
            },
            () => {},
            (result) => {
              if (result) {
                console.error('webrtc建房失败')
                // self.goHomeRouter()
              }
            }
          )
          // self.initIM()
          // self.renderMemberList()
        },
        () => {
          // error, 返回
          // self.goHomeRouter()
        }
      )
    },
    logout() {
      // 推出登录
      console.log('logout clicked')
      // if (confirm("退出登录吗？")) {
      //     self.goHomeRouter()
      // }
    },
    ...mapMutations([

    ]),
    ...mapActions([

    ])
  },
  beforeDestroy() {
    IM.logout()
  }
}
