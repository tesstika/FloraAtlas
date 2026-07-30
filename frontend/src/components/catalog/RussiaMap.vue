<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import L from 'leaflet'
import type { Plant } from '@/stores/plants'

const props = defineProps<{
  plants: Plant[]
}>()

const emit = defineEmits<{
  (e: 'open-atlas'): void
  (e: 'select-plant', plant: Plant): void
}>()

const miniMapContainerRef = ref<HTMLElement | null>(null)

// Non-reactive variables to prevent Vue 3 Proxy breaking Leaflet internals
let miniLeafletMap: L.Map | null = null
const miniMarkers: L.Marker[] = []

function getBaseCoords(plant: Plant): [number, number] {
  const nameLower = plant.name.toLowerCase()
  const regionLower = (plant.region_name || '').toLowerCase()

  if (nameLower.includes('ель') || nameLower.includes('spruce') || regionLower.includes('сибирь') || regionLower.includes('тайга')) {
    return [59.0, 82.0]
  }
  if (nameLower.includes('баобаб') || nameLower.includes('baobab') || regionLower.includes('мадагаскар')) {
    return [-18.9, 46.8]
  }
  if (nameLower.includes('секвойя') || nameLower.includes('sequoia') || regionLower.includes('калифорн')) {
    return [37.7, -119.5]
  }
  if (nameLower.includes('кофе') || nameLower.includes('coffee') || regionLower.includes('эфиоп')) {
    return [9.0, 40.5]
  }

  if (regionLower.includes('северная америка')) return [42.0, -102.0]
  if (regionLower.includes('южная америка') || regionLower.includes('амазон')) return [-10.0, -58.0]
  if (regionLower.includes('европа') || regionLower.includes('альп')) return [50.0, 14.0]
  if (regionLower.includes('саванн') || regionLower.includes('африка')) return [-8.0, 26.0]
  if (regionLower.includes('тропик')) return [4.0, 102.0]
  if (regionLower.includes('австрал') || regionLower.includes('океан')) return [-25.0, 134.0]

  const pId = plant.id || 1
  const lat = 20 + ((pId * 17) % 40) - 20
  const lng = ((pId * 31) % 260) - 130
  return [lat, lng]
}

function renderMiniMarkers() {
  if (!miniLeafletMap) return

  miniMarkers.forEach(m => m.remove())
  miniMarkers.length = 0

  props.plants.forEach(plant => {
    const [lat, lng] = getBaseCoords(plant)

    const miniIcon = L.divIcon({
      className: 'custom-mini-div-icon',
      html: `
        <div class="mini-pin-pulse-container">
          <span class="mini-pulse"></span>
          <span class="mini-emoji">${plant.icon}</span>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    })

    const marker = L.marker([lat, lng], { icon: miniIcon }).addTo(miniLeafletMap!)
    miniMarkers.push(marker)
  })
}

function initMiniMap() {
  if (!miniMapContainerRef.value || miniLeafletMap) return

  miniLeafletMap = L.map(miniMapContainerRef.value, {
    center: [20, 10],
    zoom: 1.5,
    minZoom: 1,
    maxZoom: 3,
    zoomControl: false,
    dragging: false,
    touchZoom: false,
    doubleClickZoom: false,
    scrollWheelZoom: false,
    boxZoom: false,
    keyboard: false,
    attributionControl: false
  })

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 3,
    attribution: 'Esri World Physical'
  }).addTo(miniLeafletMap)

  renderMiniMarkers()

  nextTick(() => {
    miniLeafletMap?.invalidateSize()
  })

  setTimeout(() => {
    miniLeafletMap?.invalidateSize()
  }, 150)

  setTimeout(() => {
    miniLeafletMap?.invalidateSize()
  }, 400)
}

watch(() => props.plants, () => {
  renderMiniMarkers()
}, { deep: true })

onMounted(() => {
  nextTick(() => {
    initMiniMap()
  })
})

onUnmounted(() => {
  if (miniLeafletMap) {
    miniLeafletMap.remove()
    miniLeafletMap = null
  }
})
</script>

<template>
  <div class="minimap-preview-card panel" @click="emit('open-atlas')">
    <div class="minimap-header">
      <div class="title-row">
        <span class="icon">🗺️</span>
        <span class="title">Интерактивный Атлас</span>
      </div>
      <span class="badge">Топографический 3D-вид</span>
    </div>

    <div class="minimap-viewport">
      <!-- Non-interactive Leaflet Map Tile Canvas -->
      <div class="mini-map-canvas-wrap">
        <div ref="miniMapContainerRef" class="mini-leaflet-canvas"></div>
      </div>

      <!-- Gradient Glassmorphism Overlay -->
      <div class="minimap-overlay">
        <button class="btn open-atlas-btn">
          <span>Открыть интерактивный атлас</span>
          <span class="icon-arrow">↗</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import 'leaflet/dist/leaflet.css';

.minimap-preview-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 420px;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
}

.minimap-preview-card:hover {
  transform: translateY(-3px);
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
  width: 100%;
  height: 100%;
  min-height: 340px;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--line);
  background: #19261f url('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/2/1/2') center/cover no-repeat;
}

.mini-map-canvas-wrap {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 340px;
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.minimap-preview-card:hover .mini-map-canvas-wrap {
  transform: scale(1.06);
}

.mini-leaflet-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 340px;
}

.minimap-overlay {
  position: absolute;
  inset: 0;
  z-index: 100;
  background: linear-gradient(to top, rgba(15, 26, 20, 0.72) 0%, rgba(15, 26, 20, 0.32) 55%, rgba(15, 26, 20, 0.15) 100%);
  backdrop-filter: blur(1px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  transition: background 0.3s ease;
}

.minimap-preview-card:hover .minimap-overlay {
  background: linear-gradient(to top, rgba(15, 26, 20, 0.8) 0%, rgba(15, 26, 20, 0.4) 55%, rgba(15, 26, 20, 0.25) 100%);
}

.open-atlas-btn {
  background: var(--accent);
  color: white;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  padding: 13px 24px;
  font-size: 1.02rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(8px);
}

.open-atlas-btn:hover {
  background: var(--accent-hover);
  transform: scale(1.05);
}

.icon-arrow {
  font-size: 1.2rem;
}
</style>

<style>
/* Unscoped Mini Pin Icon Styles */
.custom-mini-div-icon {
  background: transparent !important;
  border: none !important;
}

.mini-pin-pulse-container {
  position: relative;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
}

.mini-pulse {
  position: absolute;
  inset: -2px;
  border-radius: 50%;
  background: rgba(114, 207, 157, 0.45);
  animation: mini-ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

.mini-emoji {
  position: relative;
  z-index: 2;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #2f6b4f;
  border: 2px solid #72cf9d;
  display: grid;
  place-items: center;
  font-size: 0.85rem;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
}

@keyframes mini-ping {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  70%, 100% {
    transform: scale(1.8);
    opacity: 0;
  }
}
</style>
