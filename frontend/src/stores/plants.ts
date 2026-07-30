import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'

export interface PlantStage {
  id: number
  plant_id: number
  stage_order: number
  title: string
  icon: string
  theory_text: string
  game_type: 'quiz' | 'match' | 'grouping' | 'crossword' | 'table'
  game_payload: any
  event_notice: string
  health_penalty: number
  fertilizer_reward: number
}

export interface Plant {
  id: number
  name: string
  icon: string
  description: string
  stages_count: number
  region_name: string
  map_x_percent: number
  map_y_percent: number
}

export const usePlantStore = defineStore('plants', () => {
  const plants = ref<Plant[]>([])
  const currentPlant = ref<Plant | null>(null)
  const currentPlantStages = ref<PlantStage[]>([])
  const loading = ref(false)

  async function fetchPlants() {
    loading.value = true
    try {
      const res = await api.get<{ plants: Plant[] }>('/plants')
      plants.value = res.data.plants
    } finally {
      loading.value = false
    }
  }

  async function fetchPlantById(id: number) {
    loading.value = true
    try {
      const res = await api.get<{ plant: Plant; stages: PlantStage[] }>(`/plants/${id}`)
      currentPlant.value = res.data.plant
      currentPlantStages.value = res.data.stages
    } finally {
      loading.value = false
    }
  }

  return {
    plants,
    currentPlant,
    currentPlantStages,
    loading,
    fetchPlants,
    fetchPlantById
  }
})
