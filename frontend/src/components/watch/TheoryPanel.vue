<script setup lang="ts">
import type { PlantStage } from '@/stores/plants'

defineProps<{
  stage: PlantStage
  stageOrder: number
  totalStages: number
}>()
</script>

<template>
  <div class="theory-panel">
    <div class="header">
      <p class="eyebrow">Текущий этап {{ stageOrder }} / {{ totalStages }}</p>
      <h2>{{ stage.title }}</h2>
    </div>

    <p class="theory-text">
      {{ stage.theory_text }}
    </p>

    <div v-if="stage.event_notice" class="event-notice">
      <span class="notice-icon">⚡</span>
      <span class="notice-text">{{ stage.event_notice }}</span>
    </div>
  </div>
</template>

<style scoped>
.eyebrow {
  margin: 0 0 4px;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h2 {
  margin: 0 0 14px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.theory-text {
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.55;
  margin: 0 0 20px;
}

.event-notice {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 16px;
  background: #fff8e8;
  border: 1px solid #ead7a8;
  color: var(--warning);
  font-size: 0.92rem;
  font-weight: 600;
}

.notice-icon {
  font-size: 1.2rem;
  line-height: 1;
}
</style>
