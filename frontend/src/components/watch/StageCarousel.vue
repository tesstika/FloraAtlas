<script setup lang="ts">
import type { PlantStage } from '@/stores/plants'

defineProps<{
  stages: PlantStage[]
  currentIndex: number
}>()

const emit = defineEmits<{
  (e: 'select-stage', index: number): void
}>()
</script>

<template>
  <div class="stage-carousel">
    <div class="carousel-track">
      <button
        v-for="(stage, idx) in stages"
        :key="stage.id"
        class="stage-btn"
        :class="{ active: idx === currentIndex }"
        @click="emit('select-stage', idx)"
      >
        <span class="stage-num">{{ idx + 1 }}</span>
        <span class="stage-title-sm">{{ stage.title }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.stage-carousel {
  margin-top: 20px;
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
}

.stage-btn:hover {
  border-color: var(--accent);
  background: white;
}

.stage-btn.active {
  background: var(--accent);
  color: white;
  box-shadow: 0 4px 14px rgba(47, 107, 79, 0.25);
}

.stage-num {
  font-size: 1.1rem;
}

.stage-title-sm {
  font-size: 0.72rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 90px;
  font-weight: 500;
  margin-top: 2px;
}
</style>
