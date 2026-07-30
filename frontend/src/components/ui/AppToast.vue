<script setup lang="ts">
import { ref } from 'vue'

const message = ref('')
const visible = ref(false)
let timer: number | null = null

function showToast(msg: string, duration = 2500) {
  message.value = msg
  visible.value = true

  if (timer) clearTimeout(timer)
  timer = window.setTimeout(() => {
    visible.value = false
  }, duration)
}

defineExpose({ showToast })
</script>

<template>
  <Transition name="toast-fade">
    <div v-if="visible" class="toast">
      {{ message }}
    </div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 100;
  max-width: 380px;
  padding: 14px 18px;
  border-radius: 16px;
  background: var(--text);
  color: white;
  box-shadow: var(--shadow-lg);
  font-weight: 600;
  font-size: 0.95rem;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
