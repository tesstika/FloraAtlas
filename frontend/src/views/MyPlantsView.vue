<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useObservationStore } from '@/stores/observation'

const router = useRouter()
const observationStore = useObservationStore()

onMounted(() => {
  observationStore.fetchUserObservations()
})

function openObservation(id: number) {
  router.push(`/watch/${id}`)
}
</script>

<template>
  <div class="my-plants-view">
    <div class="section-head">
      <div>
        <h2>Мои растения</h2>
        <p>Активные наблюдения за растениями в FloraAtlas.</p>
      </div>
      <router-link to="/catalog" class="btn secondary">
        + Добавить растение
      </router-link>
    </div>

    <div v-if="observationStore.loading" class="loading-state">
      Загрузка ваших растений...
    </div>

    <div v-else-if="!observationStore.observations.length" class="empty-panel panel">
      <div class="empty-icon">🪴</div>
      <h3>У вас пока нет активных наблюдений</h3>
      <p>Выберите растение в каталоге и начните виртуальный процесс выращивания.</p>
      <router-link to="/catalog" class="btn">Открыть каталог</router-link>
    </div>

    <div v-else class="plants-grid">
      <article
        v-for="obs in observationStore.observations"
        :key="obs.id"
        class="panel plant-obs-card"
      >
        <div class="obs-header">
          <div class="plant-icon">{{ obs.plant_icon || '🌲' }}</div>
          <div>
            <h3>{{ obs.plant_name }}</h3>
            <span class="mode-tag">{{ obs.time_mode === 'virtual' ? 'Виртуальный режим' : 'Реальный режим' }}</span>
          </div>
        </div>

        <div class="obs-metrics">
          <div class="metric">
            <span class="label">Здоровье:</span>
            <strong :class="{ danger: obs.health < 40 }">{{ obs.health }}%</strong>
          </div>
          <div class="metric">
            <span class="label">Удобрения:</span>
            <strong>{{ obs.fertilizer_count }}</strong>
          </div>
          <div class="metric">
            <span class="label">Этап:</span>
            <strong>№ {{ obs.current_stage_index + 1 }}</strong>
          </div>
        </div>

        <button class="btn" @click="openObservation(obs.id)">
          Открыть наблюдение
        </button>
      </article>
    </div>
  </div>
</template>

<style scoped>
.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-head h2 {
  margin: 0 0 4px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.section-head p {
  margin: 0;
  color: var(--muted);
}

.empty-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 56px 24px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 12px;
}

.empty-panel h3 {
  margin: 0 0 8px;
  font-size: 1.3rem;
}

.empty-panel p {
  color: var(--muted);
  margin: 0 0 20px;
  max-width: 420px;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.plant-obs-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.obs-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.plant-icon {
  width: 54px;
  height: 54px;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: var(--surface-soft);
  font-size: 2rem;
}

.obs-header h3 {
  margin: 0 0 2px;
  font-size: 1.25rem;
}

.mode-tag {
  font-size: 0.78rem;
  color: var(--muted);
}

.obs-metrics {
  display: flex;
  justify-content: space-between;
  padding: 12px;
  background: var(--surface-soft);
  border-radius: 14px;
  margin-bottom: 20px;
}

.metric {
  display: flex;
  flex-direction: column;
  font-size: 0.82rem;
}

.metric .label {
  color: var(--muted);
}

.metric strong {
  color: var(--accent);
  font-size: 1.05rem;
}

.metric strong.danger {
  color: var(--danger);
}

.plant-obs-card .btn {
  width: 100%;
}

.loading-state {
  text-align: center;
  padding: 48px;
  color: var(--muted);
}
</style>
