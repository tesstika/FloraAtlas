<script setup lang="ts">
import type { Plant } from '@/stores/plants'

defineProps<{
  plant: Plant
}>()

const emit = defineEmits<{
  (e: 'select-plant', plant: Plant): void
}>()
</script>

<template>
  <article class="plant-card panel">
    <div class="card-content">
      <div class="plant-icon">{{ plant.icon }}</div>
      <h3 class="plant-name">{{ plant.name }}</h3>
      <p class="plant-desc">{{ plant.description }}</p>
      <div class="tag-row">
        <span class="tag">{{ plant.stages_count }} этапов</span>
        <span class="tag">📍 {{ plant.region_name }}</span>
      </div>
    </div>
    <div class="card-actions">
      <button class="btn secondary" @click="emit('select-plant', plant)">
        Открыть карточку
      </button>
    </div>
  </article>
</template>

<style scoped>
.plant-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100%;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.plant-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.plant-icon {
  width: 60px;
  height: 60px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: var(--surface-soft);
  font-size: 2.2rem;
  margin-bottom: 14px;
}

.plant-name {
  margin: 0 0 6px;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
}

.plant-desc {
  margin: 0;
  color: var(--muted);
  font-size: 0.92rem;
  line-height: 1.45;
}

.card-actions {
  margin-top: 20px;
}

.card-actions .btn {
  width: 100%;
}
</style>
