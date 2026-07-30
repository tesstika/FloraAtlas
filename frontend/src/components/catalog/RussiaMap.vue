<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Panzoom from '@panzoom/panzoom'
import type { Plant } from '@/stores/plants'

defineProps<{
  plants: Plant[]
}>()

const emit = defineEmits<{
  (e: 'select-plant', plant: Plant): void
}>()

const mapContainer = ref<HTMLElement | null>(null)

onMounted(() => {
  if (mapContainer.value) {
    Panzoom(mapContainer.value, {
      maxScale: 3,
      minScale: 0.8,
      contain: 'outside'
    })
  }
})
</script>

<template>
  <div class="map-wrapper panel">
    <div class="map-header">
      <span class="map-title">📍 География распространения</span>
      <span class="map-hint">Кликните на маркер для выбора</span>
    </div>

    <div class="map-viewport">
      <div ref="mapContainer" class="map-canvas">
        <svg
          viewBox="0 0 800 500"
          class="svg-map"
          xmlns="http://www.w3.org/2000/svg"
        >
          <!-- Stylized World / Eurasia Vector Land Contours -->
          <path
            d="M 100,120 Q 200,80 350,100 T 600,90 T 750,140 Q 720,280 600,320 Q 480,400 350,380 Q 200,350 120,260 Z"
            fill="rgba(47, 107, 79, 0.12)"
            stroke="#c4d5c9"
            stroke-width="2"
          />
          <path
            d="M 180,240 Q 280,220 400,250 Q 520,240 680,210 T 720,330 Q 550,380 400,340 Z"
            fill="rgba(47, 107, 79, 0.16)"
            stroke="#a3c4af"
            stroke-width="1.5"
          />
          <!-- Decorative latitude grid lines -->
          <line x1="50" y1="150" x2="750" y2="150" stroke="#e0e8e2" stroke-dasharray="4 4" />
          <line x1="50" y1="280" x2="750" y2="280" stroke="#e0e8e2" stroke-dasharray="4 4" />
        </svg>

        <button
          v-for="plant in plants"
          :key="plant.id"
          class="marker-pin"
          :style="{ left: plant.map_x_percent + '%', top: plant.map_y_percent + '%' }"
          @click="emit('select-plant', plant)"
        >
          <span class="marker-icon">{{ plant.icon }}</span>
          <span class="marker-tooltip">{{ plant.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 380px;
  overflow: hidden;
}

.map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.map-title {
  font-weight: 700;
  color: var(--text);
  font-size: 0.95rem;
}

.map-hint {
  font-size: 0.8rem;
  color: var(--muted);
}

.map-viewport {
  position: relative;
  flex: 1;
  min-height: 320px;
  background: var(--surface-soft);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.map-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.svg-map {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.marker-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background: var(--accent);
  color: white;
  font-size: 1.2rem;
  box-shadow: 0 8px 18px rgba(22, 40, 30, 0.28);
  transition: transform 0.2s ease, background 0.2s ease;
  z-index: 10;
}

.marker-pin:hover {
  transform: translate(-50%, -50%) scale(1.15);
  background: var(--accent-hover);
  z-index: 15;
}

.marker-tooltip {
  position: absolute;
  top: 42px;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  padding: 4px 10px;
  border-radius: 999px;
  background: white;
  color: var(--text);
  border: 1px solid var(--line);
  font-size: 0.8rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(22, 40, 30, 0.12);
  pointer-events: none;
}
</style>
