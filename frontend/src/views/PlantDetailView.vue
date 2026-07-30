<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { usePlantStore } from '@/stores/plants'
import { useObservationStore } from '@/stores/observation'
import { useAuthStore } from '@/stores/auth'

const props = defineProps<{
  id: string
}>()

const router = useRouter()
const plantStore = usePlantStore()
const observationStore = useObservationStore()
const authStore = useAuthStore()

const timeMode = ref<'virtual' | 'real'>('virtual')
const isSubmitting = ref(false)

const plant = computed(() => plantStore.currentPlant)

onMounted(() => {
  plantStore.fetchPlantById(Number(props.id))
})

async function handleStartObservation() {
  if (!authStore.isAuthenticated) {
    router.push({ name: 'auth', query: { redirect: `/catalog/${props.id}` } })
    return
  }

  isSubmitting.value = true
  try {
    const obs = await observationStore.startNewObservation(Number(props.id), timeMode.value)
    router.push(`/watch/${obs.id}`)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="plant-detail-view">
    <div v-if="plantStore.loading || !plant" class="loading-state">
      Загрузка информации о растении...
    </div>

    <div v-else class="detail-layout">
      <div class="panel icon-panel">
        <div class="big-icon">{{ plant.icon }}</div>
      </div>

      <div class="panel info-panel">
        <p class="eyebrow">Карточка растения</p>
        <h2>{{ plant.name }}</h2>
        <p class="detail-text">{{ plant.description }}</p>

        <div class="tag-row">
          <span class="tag">{{ plant.stages_count }} этапов</span>
          <span class="tag">📍 {{ plant.region_name }}</span>
          <span class="tag">Интерактивные события</span>
        </div>

        <div class="mode-section">
          <p class="mode-label">Режим прохождения</p>
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

        <div class="actions">
          <button class="btn" :disabled="isSubmitting" @click="handleStartObservation">
            Начать наблюдение
          </button>
          <router-link to="/catalog" class="btn secondary">
            Вернуться к каталогу
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.detail-layout {
  display: grid;
  grid-template-columns: 0.85fr 1.15fr;
  gap: 24px;
}

.icon-panel {
  display: grid;
  place-items: center;
  min-height: 320px;
  background: var(--surface-soft);
}

.big-icon {
  font-size: 8rem;
  line-height: 1;
}

.info-panel {
  display: flex;
  flex-direction: column;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

h2 {
  margin: 0 0 10px;
  font-size: 2.2rem;
  letter-spacing: -0.03em;
}

.detail-text {
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1.5;
  margin: 0 0 16px;
}

.mode-section {
  margin-top: 24px;
}

.mode-label {
  font-weight: 600;
  font-size: 0.88rem;
  color: var(--muted);
  margin: 0 0 8px;
}

.segment {
  display: inline-flex;
  gap: 6px;
  padding: 6px;
  border-radius: 999px;
  background: var(--surface-soft);
}

.segment button {
  padding: 8px 16px;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
}

.segment button.active {
  background: white;
  color: var(--accent);
  box-shadow: 0 6px 16px rgba(22, 40, 30, 0.08);
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 32px;
}

.loading-state {
  text-align: center;
  padding: 48px;
  color: var(--muted);
}

@media (max-width: 768px) {
  .detail-layout {
    grid-template-columns: 1fr;
  }
}
</style>
