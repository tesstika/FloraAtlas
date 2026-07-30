<script setup lang="ts">
defineProps<{
  health: number
}>()
</script>

<template>
  <div class="health-container">
    <div class="health-row">
      <span class="label">Здоровье растения</span>
      <strong class="value" :class="{ danger: health < 40 }">{{ health }}%</strong>
    </div>
    <div class="progress-track">
      <div
        class="progress-fill"
        :class="{ danger: health < 40, warning: health >= 40 && health < 70 }"
        :style="{ width: health + '%' }"
      ></div>
    </div>
  </div>
</template>

<style scoped>
.health-container {
  margin-bottom: 20px;
}

.health-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 0.92rem;
}

.label {
  color: var(--muted);
  font-weight: 600;
}

.value {
  color: var(--accent);
  font-weight: 700;
}

.value.danger {
  color: var(--danger);
}

.progress-track {
  height: 12px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--surface-soft);
  border: 1px solid var(--line);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--accent);
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1), background 0.4s ease;
}

.progress-fill.warning {
  background: var(--warning);
}

.progress-fill.danger {
  background: var(--danger);
}
</style>
