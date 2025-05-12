<template>
  <div v-if="loading" class="loading-spinner">
    <div class="spinner"></div>
    <p>加载中...</p>
  </div>
</template>

<script>
export default {
  props: {
    loading: {
      type: Boolean,
      required: true
    }
  }
}
</script>

<style scoped>
.loading-spinner {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #42b983;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>