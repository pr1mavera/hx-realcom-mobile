<template>
  <main class="service-brief">
    <div class="avatar-box">
      <img>
      <p>{{ name }}</p>
    </div>
  </main>
</template>

<script>
  export default {
    // name: "service-list.vue"
    data() {
      return {
        name: '可可'
      }
    }
  }
</script>

<style scoped lang="less">
.service-brief {
  width: 3.2rem;
  /*background: url("");*/
  border-radius: 5px;
}
</style>
