<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import { useObservationStore } from '@/stores/observation'
import { useAuthStore } from '@/stores/auth'
import type { Plant } from '@/stores/plants'

const props = defineProps<{
  show: boolean
  plants: Plant[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const router = useRouter()
const observationStore = useObservationStore()
const authStore = useAuthStore()

const mapContainerRef = ref<HTMLElement | null>(null)
let leafletMap: L.Map | null = null
const markerMap = new Map<number, L.Marker>()

const selectedPlant = ref<Plant | null>(null)
const activeBiomeFilter = ref<string>('Все')
const timeMode = ref<'virtual' | 'real'>('virtual')
const isStarting = ref(false)

const biomes = [
  { id: 'Все', label: 'Все биомы', icon: '🌍' },
  { id: 'Северные', label: 'Северная зона', icon: '❄️' },
  { id: 'Умеренные', label: 'Умеренные леса', icon: '🌲' },
  { id: 'Саванна', label: 'Саванна', icon: '🌳' },
  { id: 'Тропики', label: 'Тропики', icon: '🌴' }
]

function getPlantCoords(plant: Plant): [number, number] {
  const nameLower = plant.name.toLowerCase()
  const regionLower = (plant.region_name || '').toLowerCase()

  if (nameLower.includes('ель') || nameLower.includes('spruce') || regionLower.includes('сибирь') || regionLower.includes('тайга')) {
    return [60.0, 85.0]
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

  if (regionLower.includes('северная америка')) return [45.0, -100.0]
  if (regionLower.includes('южная америка') || regionLower.includes('амазон')) return [-12.0, -60.0]
  if (regionLower.includes('европа') || regionLower.includes('альп')) return [50.0, 15.0]
  if (regionLower.includes('саванн') || regionLower.includes('африка')) return [-5.0, 25.0]
  if (regionLower.includes('тропик')) return [3.0, 102.0]
  if (regionLower.includes('австрал') || regionLower.includes('океан')) return [-25.0, 134.0]

  // Fallback: unique coordinates based on plant.id to avoid marker overlapping
  const pId = plant.id || 1
  const lat = 15 + ((pId * 19) % 50) - 25
  const lng = ((pId * 37) % 280) - 140
  return [lat, lng]
}

function renderMarkers() {
  if (!leafletMap) return

  markerMap.forEach(m => m.remove())
  markerMap.clear()

  props.plants.forEach(plant => {
    const [lat, lng] = getPlantCoords(plant)

    const matchesFilter = activeBiomeFilter.value === 'Все' ||
      plant.region_name.toLowerCase().includes(activeBiomeFilter.value.toLowerCase()) ||
      (activeBiomeFilter.value === 'Северные' && (plant.region_name.toLowerCase().includes('северн') || plant.region_name.toLowerCase().includes('сибирь'))) ||
      (activeBiomeFilter.value === 'Умеренные' && (plant.region_name.toLowerCase().includes('умерен') || plant.region_name.toLowerCase().includes('америк') || plant.region_name.toLowerCase().includes('европ')))

    const customIcon = L.divIcon({
      className: 'custom-leaflet-div-icon',
      html: `
        <div class="leaflet-plant-marker ${matchesFilter ? '' : 'dimmed'} ${selectedPlant.value?.id === plant.id ? 'active' : ''}">
          <span class="pin-icon">${plant.icon}</span>
          <span class="pin-label">${plant.name}</span>
        </div>
      `,
      iconSize: [44, 52],
      iconAnchor: [22, 44]
    })

    const marker = L.marker([lat, lng], { icon: customIcon }).addTo(leafletMap!)

    marker.on('click', () => {
      selectedPlant.value = plant
      leafletMap?.flyTo([lat, lng], 5, { duration: 1.2 })
      renderMarkers()
    })

    markerMap.set(plant.id, marker)
  })
}

function initLeafletMap() {
  if (!mapContainerRef.value) return

  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }

  leafletMap = L.map(mapContainerRef.value, {
    center: [25, 10],
    zoom: 3,
    minZoom: 2,
    maxZoom: 8,
    zoomControl: false,
    attributionControl: false
  })

  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 8,
    attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service'
  }).addTo(leafletMap)

  renderMarkers()
}

function setBiomeFilter(filterId: string) {
  activeBiomeFilter.value = filterId
  renderMarkers()

  if (!leafletMap) return

  if (filterId === 'Все') {
    leafletMap.flyTo([25, 10], 3, { duration: 1.2 })
  } else if (filterId === 'Северные') {
    leafletMap.flyTo([62, 85], 4, { duration: 1.2 })
  } else if (filterId === 'Умеренные') {
    leafletMap.flyTo([40, -105], 4, { duration: 1.2 })
  } else if (filterId === 'Саванна') {
    leafletMap.flyTo([-15, 30], 4, { duration: 1.2 })
  } else if (filterId === 'Тропики') {
    leafletMap.flyTo([8, 40], 4, { duration: 1.2 })
  }
}

function zoomIn() {
  leafletMap?.zoomIn()
}

function zoomOut() {
  leafletMap?.zoomOut()
}

function resetZoom() {
  activeBiomeFilter.value = 'Все'
  renderMarkers()
  leafletMap?.flyTo([25, 10], 3, { duration: 1.2 })
}

watch(() => props.show, (newVal) => {
  if (newVal) {
    nextTick(() => {
      initLeafletMap()
      setTimeout(() => {
        if (leafletMap) {
          leafletMap.invalidateSize()
          renderMarkers()
        }
      }, 150)
      setTimeout(() => {
        if (leafletMap) {
          leafletMap.invalidateSize()
        }
      }, 350)
    })
  } else {
    selectedPlant.value = null
    if (leafletMap) {
      leafletMap.remove()
      leafletMap = null
    }
  }
})

watch(() => props.plants, () => {
  renderMarkers()
}, { deep: true })

async function handleStartObservation() {
  if (!selectedPlant.value) return

  if (!authStore.isAuthenticated) {
    emit('close')
    router.push({ name: 'auth', query: { redirect: `/catalog/${selectedPlant.value.id}` } })
    return
  }

  isStarting.value = true
  try {
    const obs = await observationStore.startNewObservation(selectedPlant.value.id, timeMode.value)
    emit('close')
    router.push(`/watch/${obs.id}`)
  } finally {
    isStarting.value = false
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.show) {
    emit('close')
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown)
  if (leafletMap) {
    leafletMap.remove()
    leafletMap = null
  }
})
</script>

<template>
  <Teleport to="body">
    <Transition name="atlas-fade">
      <div v-if="show" class="atlas-modal-overlay">
        <!-- Top Navigation Bar -->
        <header class="atlas-header">
          <div class="atlas-title">
            <span class="atlas-badge">🗺️ Топографический Атлас</span>
            <h2>Физическая карта рельефа и флоры</h2>
          </div>

          <!-- Biome Filter Bar -->
          <div class="biome-filters">
            <button
              v-for="b in biomes"
              :key="b.id"
              class="biome-btn"
              :class="{ active: activeBiomeFilter === b.id }"
              @click="setBiomeFilter(b.id)"
            >
              <span>{{ b.icon }}</span> {{ b.label }}
            </button>
          </div>

          <!-- Close Modal Button -->
          <button class="close-atlas-btn" title="Закрыть атлас (Esc)" @click="emit('close')">
            ✕
          </button>
        </header>

        <!-- Leaflet Map Viewport -->
        <div class="atlas-viewport">
          <div ref="mapContainerRef" class="leaflet-container-view"></div>
        </div>

        <!-- Zoom Controls Overlay -->
        <div class="zoom-controls">
          <button title="Приблизить (+)" @click="zoomIn">+</button>
          <button title="Отдалить (-)" @click="zoomOut">-</button>
          <button title="Сбросить вид" class="reset-btn" @click="resetZoom">↺</button>
        </div>

        <!-- Side Drawer Info Panel -->
        <Transition name="drawer-slide">
          <aside v-if="selectedPlant" class="plant-drawer">
            <button class="close-drawer-btn" title="Закрыть панель" @click="selectedPlant = null">
              ✕
            </button>

            <div class="drawer-header">
              <div class="drawer-icon">{{ selectedPlant.icon }}</div>
              <div>
                <span class="drawer-eyebrow">Карточка из атласа</span>
                <h3>{{ selectedPlant.name }}</h3>
              </div>
            </div>

            <p class="drawer-desc">{{ selectedPlant.description }}</p>

            <div class="drawer-tags">
              <span class="tag">📍 {{ selectedPlant.region_name }}</span>
              <span class="tag">🌱 {{ selectedPlant.stages_count }} этапов роста</span>
            </div>

            <div class="mode-select">
              <label>Режим прохождения:</label>
              <div class="segment">
                <button
                  :class="{ active: timeMode === 'virtual' }"
                  @click="timeMode = 'virtual'"
                >
                  Виртуальное
                </button>
                <button
                  :class="{ active: timeMode === 'real' }"
                  @click="timeMode = 'real'"
                >
                  Реальное
                </button>
              </div>
            </div>

            <div class="drawer-actions">
              <button class="btn" :disabled="isStarting" @click="handleStartObservation">
                Начать наблюдение →
              </button>
            </div>
          </aside>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.atlas-modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  flex-direction: column;
  background: #111a14;
  color: white;
}

.atlas-header {
  position: relative;
  z-index: 2100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  background: rgba(22, 36, 28, 0.94);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  gap: 16px;
  flex-wrap: wrap;
}

.atlas-badge {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #72cf9d;
  font-weight: 700;
}

.atlas-title h2 {
  margin: 0;
  font-size: 1.25rem;
  letter-spacing: -0.02em;
}

.biome-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.biome-btn {
  padding: 6px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #d1ded6;
  font-size: 0.85rem;
  font-weight: 600;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.biome-btn:hover {
  background: rgba(255, 255, 255, 0.16);
  color: white;
}

.biome-btn.active {
  background: #2f6b4f;
  color: white;
  border-color: #5ab885;
}

.close-atlas-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  font-size: 1.1rem;
  display: grid;
  place-items: center;
}

.close-atlas-btn:hover {
  background: var(--danger);
}

.atlas-viewport {
  position: relative;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #19261f;
  z-index: 10;
}

.leaflet-container-view {
  width: 100%;
  height: 100%;
}

.zoom-controls {
  position: absolute;
  left: 24px;
  bottom: 24px;
  z-index: 2200;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.zoom-controls button {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(22, 36, 28, 0.92);
  color: white;
  font-size: 1.2rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.18);
  backdrop-filter: blur(8px);
}

.zoom-controls button:hover {
  background: #2f6b4f;
}

.zoom-controls .reset-btn {
  font-size: 1rem;
}

.plant-drawer {
  position: absolute;
  right: 24px;
  top: 90px;
  bottom: 24px;
  width: min(380px, calc(100vw - 48px));
  z-index: 3000;
  background: rgba(22, 36, 28, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.close-drawer-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  background: transparent;
  color: #9aa9a0;
  font-size: 1.2rem;
}

.drawer-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.drawer-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.08);
  font-size: 2.4rem;
  display: grid;
  place-items: center;
}

.drawer-eyebrow {
  font-size: 0.78rem;
  color: #72cf9d;
  font-weight: 700;
  text-transform: uppercase;
}

.drawer-header h3 {
  margin: 0;
  font-size: 1.4rem;
}

.drawer-desc {
  color: #cbd8cf;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0 0 16px;
}

.drawer-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.drawer-tags .tag {
  background: rgba(255, 255, 255, 0.08);
  color: #d1ded6;
}

.mode-select label {
  display: block;
  font-size: 0.85rem;
  color: #9aa9a0;
  margin-bottom: 8px;
}

.mode-select .segment {
  background: rgba(255, 255, 255, 0.08);
  padding: 4px;
  border-radius: 999px;
  display: flex;
  gap: 4px;
}

.mode-select .segment button {
  flex: 1;
  padding: 8px;
  border-radius: 999px;
  background: transparent;
  color: #9aa9a0;
  font-weight: 700;
}

.mode-select .segment button.active {
  background: #2f6b4f;
  color: white;
}

.drawer-actions {
  margin-top: auto;
  padding-top: 24px;
}

.drawer-actions .btn {
  width: 100%;
}

.atlas-fade-enter-active,
.atlas-fade-leave-active {
  transition: opacity 0.3s ease;
}

.atlas-fade-enter-from,
.atlas-fade-leave-to {
  opacity: 0;
}

.drawer-slide-enter-active,
.drawer-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.drawer-slide-enter-from,
.drawer-slide-leave-to {
  opacity: 0;
  transform: translateX(40px);
}
</style>

<style>
/* Unscoped Leaflet custom div icon styles */
.custom-leaflet-div-icon {
  background: transparent !important;
  border: none !important;
}

.leaflet-plant-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: transform 0.25s ease, opacity 0.3s ease;
}

.leaflet-plant-marker.dimmed {
  opacity: 0.25;
  pointer-events: none;
}

.leaflet-plant-marker .pin-icon {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #2f6b4f;
  border: 2px solid #72cf9d;
  color: white;
  display: grid;
  place-items: center;
  font-size: 1.35rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
  transition: transform 0.2s ease, background 0.2s ease;
}

.leaflet-plant-marker:hover .pin-icon,
.leaflet-plant-marker.active .pin-icon {
  transform: scale(1.22);
  background: #24543e;
  border-color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.leaflet-plant-marker .pin-label {
  margin-top: 4px;
  padding: 3px 10px;
  border-radius: 999px;
  background: rgba(17, 26, 20, 0.92);
  color: white;
  font-size: 0.78rem;
  font-weight: 700;
  border: 1px solid rgba(255, 255, 255, 0.2);
  white-space: nowrap;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4);
}
</style>
