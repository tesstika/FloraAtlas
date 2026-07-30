<script setup lang="ts">
import type { Plant } from '@/stores/plants'

defineProps<{
  plants: Plant[]
}>()

const emit = defineEmits<{
  (e: 'open-atlas'): void
  (e: 'select-plant', plant: Plant): void
}>()
</script>

<template>
  <div class="minimap-card panel" @click="emit('open-atlas')">
    <div class="minimap-header">
      <div class="title-row">
        <span class="icon">🗺️</span>
        <span class="title">Географический Атлас</span>
      </div>
      <span class="badge">Интерактивный 3D-вид</span>
    </div>

    <div class="minimap-viewport">
      <!-- Stylized Mini-Map Vector Graphic -->
      <svg
        viewBox="0 0 800 500"
        class="mini-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M 100,120 Q 200,80 350,100 T 600,90 T 750,140 Q 720,280 600,320 Q 480,400 350,380 Q 200,350 120,260 Z"
          fill="rgba(47, 107, 79, 0.15)"
          stroke="#b8d5c4"
          stroke-width="2"
        />
        <path
          d="M 180,240 Q 280,220 400,250 Q 520,240 680,210 T 720,330 Q 550,380 400,340 Z"
          fill="rgba(47, 107, 79, 0.2)"
          stroke="#9bc2a9"
          stroke-width="1.5"
        />
      </svg>

      <!-- Mini-map Pins -->
      <div
        v-for="plant in plants"
        :key="plant.id"
        class="mini-pin"
        :style="{ left: plant.map_x_percent + '%', top: plant.map_y_percent + '%' }"
      >
        <span>{{ plant.icon }}</span>
      </div>

      <!-- Prominent Call-To-Action Overlay Button -->
      <div class="minimap-cta-overlay">
        <button class="btn open-atlas-btn">
          <span>Открыть интерактивный атлас</span>
          <span class="icon-arrow">↗</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.minimap-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.25 ease, box-shadow 0.25s ease;
}

.minimap-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.minimap-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 1rem;
}

.badge {
  font-size: 0.78rem;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--accent-weak);
  color: var(--accent);
  font-weight: 600;
}

.minimap-viewport {
  position: relative;
  flex: 1;
  min-height: 340px;
  background: var(--surface-soft);
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.mini-svg {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-pin {
  position: absolute;
  transform: translate(-50%, -50%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: white;
  display: grid;
  place-items: center;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(22, 40, 30, 0.25);
  pointer-events: none;
}

.minimap-cta-overlay {
  position: absolute;
  inset: 0;
  background: rgba(22, 40, 30, 0.25);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  transition: background 0.2s ease;
}

.minimap-card:hover .minimap-cta-overlay {
  background: rgba(22, 40, 30, 0.35);
}

.open-atlas-btn {
  background: var(--accent);
  color: white;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  padding: 12px 22px;
  font-size: 1.02rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.open-atlas-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.04);
}

.icon-arrow {
  font-size: 1.2rem;
}
</style>
