<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePlantStore, type Plant } from '@/stores/plants'
import PlantCard from '@/components/catalog/PlantCard.vue'
import RussiaMap from '@/components/catalog/RussiaMap.vue'

const router = useRouter()
const plantStore = usePlantStore()

onMounted(() => {
  plantStore.fetchPlants()
})

function handleSelectPlant(plant: Plant) {
  router.push(`/catalog/${plant.id}`)
}
</script>

<template>
  <div class="catalog-view">
    <div class="section-head">
      <div>
        <h2>Каталог растений FloraAtlas</h2>
        <p>Выберите растение из списка или на интерактивной географической карте.</p>
      </div>
    </div>

    <div v-if="plantStore.loading" class="loading-state">
      Загрузка каталога растений...
    </div>

    <div v-else class="catalog-layout">
      <div class="plant-grid">
        <PlantCard
          v-for="plant in plantStore.plants"
          :key="plant.id"
          :plant="plant"
          @select-plant="handleSelectPlant"
        />
      </div>

      <div class="map-container">
        <RussiaMap
          :plants="plantStore.plants"
          @select-plant="handleSelectPlant"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-head {
  margin-bottom: 24px;
}

.section-head h2 {
  margin: 0 0 6px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.section-head p {
  margin: 0;
  color: var(--muted);
  font-size: 0.98rem;
}

.catalog-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 24px;
  align-items: start;
}

.plant-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.loading-state {
  text-align: center;
  padding: 48px;
  color: var(--muted);
  font-size: 1.1rem;
}

@media (max-width: 900px) {
  .catalog-layout {
    grid-template-columns: 1fr;
  }
}
</style>
