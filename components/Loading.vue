<template>
  <div class="loading-page">
    <div class="loader text-center">
      <i class="fas fa-spinner fa-fw fa-spin"></i>
    </div>
    <h2 class="text-center mb-5">{{status}}...</h2>
  </div>
</template>

<script>
export default {
  props: {
    status: String
  }
};
</script>

<style lang="scss" scoped>
.loading-page {
  height: 60vh;
}

.loader {
  font-size: 8rem;
  margin: 120px auto;
}
</style>
