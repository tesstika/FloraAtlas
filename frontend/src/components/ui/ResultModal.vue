<script setup lang="ts">
defineProps<{
  show: boolean
  title: string
  text: string
  isSuccess?: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()
</script>

<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div v-if="show" class="modal-backdrop" @click.self="emit('close')">
        <div class="modal-card">
          <div class="modal-header">
            <span class="modal-icon">{{ isSuccess ? '🎉' : '⚠️' }}</span>
            <h3>{{ title }}</h3>
          </div>
          <p class="modal-body">{{ text }}</p>
          <div class="actions">
            <button class="btn" @click="emit('close')">Понятно</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 90;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(31, 42, 36, 0.45);
  backdrop-filter: blur(4px);
}

.modal-card {
  width: min(520px, 100%);
  padding: 28px;
  border-radius: 24px;
  background: white;
  box-shadow: var(--shadow-lg);
}

.modal-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.modal-icon {
  font-size: 2rem;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.4rem;
  letter-spacing: -0.02em;
}

.modal-body {
  color: var(--muted);
  margin: 0 0 24px;
  font-size: 1.05rem;
  line-height: 1.5;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>
