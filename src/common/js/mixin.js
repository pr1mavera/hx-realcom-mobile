import { mapGetters, mapMutations, mapActions } from 'vuex'
// import { roomStatus, queueStatus } from '@/common/js/status'

export const videoBarMixin = {
  computed: {
    ...mapGetters([
      'fullScreen',
      'roomMode',
      'queueMode'
    ])
  },
  methods: {
    ...mapMutations([

    ]),
    ...mapActions([

    ])
  }
}
