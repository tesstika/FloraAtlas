import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { PlantStage } from './plants'

export interface UserObservation {
  id: number
  user_id: number
  plant_id: number
  time_mode: 'virtual' | 'real'
  health: number
  fertilizer_count: number
  current_stage_index: number
  status: 'active' | 'completed'
  plant_name?: string
  plant_icon?: string
  plant_description?: string
}

export const useObservationStore = defineStore('observation', () => {
  const observations = ref<UserObservation[]>([])
  const currentObservation = ref<UserObservation | null>(null)
  const observationStages = ref<PlantStage[]>([])
  const loading = ref(false)

  async function fetchUserObservations() {
    loading.value = true
    try {
      const res = await api.get<{ observations: UserObservation[] }>('/observations')
      observations.value = res.data.observations
    } finally {
      loading.value = false
    }
  }

  async function startNewObservation(plantId: number, timeMode: 'virtual' | 'real' = 'virtual') {
    loading.value = true
    try {
      const res = await api.post<{ observation: UserObservation }>('/observations', {
        plant_id: plantId,
        time_mode: timeMode
      })
      await fetchUserObservations()
      return res.data.observation
    } finally {
      loading.value = false
    }
  }

  async function fetchObservationDetails(id: number) {
    loading.value = true
    try {
      const res = await api.get<{ observation: UserObservation; stages: PlantStage[] }>(`/observations/${id}`)
      currentObservation.value = res.data.observation
      observationStages.value = res.data.stages
    } finally {
      loading.value = false
    }
  }

  async function applyFertilizer(id: number) {
    const res = await api.post<{ message: string; health: number; fertilizer_count: number }>(`/observations/${id}/use-fertilizer`)
    if (currentObservation.value) {
      currentObservation.value.health = res.data.health
      currentObservation.value.fertilizer_count = res.data.fertilizer_count
    }
    return res.data
  }

  async function submitStageAttempt(id: number, isPassed: boolean, score = 0) {
    const res = await api.post<{
      message: string
      is_passed: boolean
      health: number
      fertilizer_count: number
      current_stage_index: number
    }>(`/observations/${id}/complete-stage`, { is_passed, score })

    if (currentObservation.value) {
      currentObservation.value.health = res.data.health
      currentObservation.value.fertilizer_count = res.data.fertilizer_count
      currentObservation.value.current_stage_index = res.data.current_stage_index
    }
    return res.data
  }

  return {
    observations,
    currentObservation,
    observationStages,
    loading,
    fetchUserObservations,
    startNewObservation,
    fetchObservationDetails,
    applyFertilizer,
    submitStageAttempt
  }
})
