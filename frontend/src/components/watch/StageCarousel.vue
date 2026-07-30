<script setup lang="ts">
import type { PlantStage } from '@/stores/plants'

defineProps<{
  stages: PlantStage[]
  currentIndex: number
  unlockedIndex: number
}>()

const emit = defineEmits<{
  (e: 'select-stage', index: number): void
}>()
</script>

<template>
  <div class="stage-carousel">
    <div class="carousel-header">
      <span class="carousel-title">Этапы развития растения</span>
      <span class="carousel-subtitle">Пройдите текущий этап для разблокировки следующего</span>
    </div>

    <div class="carousel-track">
      <button
        v-for="(stage, idx) in stages"
        :key="stage.id"
        class="stage-btn"
        :class="{
          active: idx === currentIndex,
          locked: idx > unlockedIndex,
          completed: idx < unlockedIndex
        }"
        :disabled="idx > unlockedIndex"
        @click="emit('select-stage', idx)"
      >
        <div class="num-row">
          <span class="stage-num">
            <template v-if="idx > unlockedIndex">🔒</template>
            <template v-else-if="idx < unlockedIndex">✓ {{ idx + 1 }}</template>
            <template v-else>{{ idx + 1 }}</template>
          </span>
        </div>
        <span class="stage-title-sm">{{ stage.title }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.stage-carousel {
  margin-top: 20px;
}

.carousel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.carousel-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text);
}

.carousel-subtitle {
  font-size: 0.8rem;
  color: var(--muted);
}

.carousel-track {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 8px;
}

.stage-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border-radius: 16px;
  background: var(--surface-soft);
  color: var(--muted);
  font-weight: 700;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.stage-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: white;
}

.stage-btn.active {
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 14px rgba(47, 107, 79, 0.25);
}

.stage-btn.completed {
  background: #e4efe7;
  color: var(--accent);
  border-color: #c5dfce;
}

.stage-btn.locked {
  opacity: 0.55;
  background: #f0f2ee;
  color: #9aa59d;
  cursor: not-allowed;
}

.num-row {
  display: flex;
  align-items: center;
  justify-content: center;
}

.stage-num {
  font-size: 1.05rem;
}

.stage-title-sm {
  font-size: 0.72rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
  font-weight: 600;
  margin-top: 2px;
}
</style>
