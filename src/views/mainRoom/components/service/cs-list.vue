<template>
  <div class="cs-list">
    cs-list
    <my-cs-card></my-cs-card>
  </div>
</template>

<script type="text/ecmascript-6">
export default {

  components: {
    'myCsCard': () => import('@/views/mainRoom/components/service/my-cs-card')
  }

}
</script>

<style lang="less">

</style>
