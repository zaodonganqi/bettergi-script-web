<template>
  <div class="custom-loading-container" :class="{ 'fullscreen': fullscreen }">
    <div class="loading-content">
      <div class="loading-spinner">
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
        <div class="spinner-circle"></div>
      </div>
      <div v-if="text" class="loading-text">{{ text }}</div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: ''
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.custom-loading-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.custom-loading-container.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  z-index: 99999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--bg-container);
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.5s ease-out;
}

.loading-spinner {
  position: relative;
  width: 60px;
  height: 60px;
  margin-bottom: 16px;
}

.spinner-circle {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 4px solid transparent;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
}

.spinner-circle:nth-child(2) {
  animation-delay: 0.1s;
  border-top-color: var(--color-info);
}

.spinner-circle:nth-child(3) {
  animation-delay: 0.2s;
  border-top-color: var(--color-success-text);
}

.spinner-circle:nth-child(4) {
  animation-delay: 0.3s;
  border-top-color: var(--color-error-text);
}

.loading-text {
  font-size: 16px;
  color: var(--text-base);
  animation: fadeIn 0.5s ease-out 0.3s both;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>