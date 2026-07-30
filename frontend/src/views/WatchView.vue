<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useObservationStore } from '@/stores/observation'

import StageVisual from '@/components/watch/StageVisual.vue'
import HealthBar from '@/components/watch/HealthBar.vue'
import StageCarousel from '@/components/watch/StageCarousel.vue'
import TheoryPanel from '@/components/watch/TheoryPanel.vue'
import AppToast from '@/components/ui/AppToast.vue'
import ResultModal from '@/components/ui/ResultModal.vue'

import QuizGame from '@/components/games/QuizGame.vue'
import MatchGame from '@/components/games/MatchGame.vue'
import GroupingGame from '@/components/games/GroupingGame.vue'
import CrosswordGame from '@/components/games/CrosswordGame.vue'
import TableGame from '@/components/games/TableGame.vue'

const props = defineProps<{
  id: string
}>()

const observationStore = useObservationStore()
const toastRef = ref<InstanceType<typeof AppToast> | null>(null)

const modalShow = ref(false)
const modalTitle = ref('')
const modalText = ref('')
const modalSuccess = ref(true)

const selectedStageIndex = ref(0)

const obs = computed(() => observationStore.currentObservation)
const stages = computed(() => observationStore.observationStages)
const unlockedStageIndex = computed(() => obs.value?.current_stage_index || 0)
const currentStage = computed(() => stages.value[selectedStageIndex.value] || stages.value[0] || null)

onMounted(async () => {
  await observationStore.fetchObservationDetails(Number(props.id))
  if (obs.value) {
    selectedStageIndex.value = obs.value.current_stage_index
  }
})

watch(obs, (newObs) => {
  if (newObs && selectedStageIndex.value > newObs.current_stage_index) {
    selectedStageIndex.value = newObs.current_stage_index
  }
})

function selectStage(index: number) {
  if (index <= unlockedStageIndex.value) {
    selectedStageIndex.value = index
  }
}

async function handleUseFertilizer() {
  if (!obs.value) return
  if (obs.value.fertilizer_count <= 0) {
    toastRef.value?.showToast('Удобрений пока нет. Выполните мини-игру успешно.')
    return
  }
  if (obs.value.health >= 100) {
    toastRef.value?.showToast('Здоровье растения уже максимальное (100%).')
    return
  }

  try {
    const res = await observationStore.applyFertilizer(obs.value.id)
    toastRef.value?.showToast(res.message)
  } catch (error) {
    console.error('Save error:', error)
    toastRef.value?.showToast('Ошибка применения удобрения')
  }
}

function handleNextStage() {
  if (!obs.value || !stages.value.length) return
  if (selectedStageIndex.value < unlockedStageIndex.value) {
    selectedStageIndex.value++
  }
}

async function handleGameComplete(isPassed: boolean, score: number) {
  if (!obs.value) return

  try {
    const res = await observationStore.submitStageAttempt(
      obs.value.id,
      isPassed,
      score,
      selectedStageIndex.value
    )
    
    if (isPassed) {
      showResultModal(
        'Задание успешно выполнено!',
        'Растение продолжает развитие без потери здоровья. Вам начислено 1 удобрение.',
        true
      )
      if (res.current_stage_index > selectedStageIndex.value) {
        selectedStageIndex.value = res.current_stage_index
      }
    } else {
      showResultModal(
        'Ответ неверный',
        'Здоровье растения уменьшено на 10 баллов. Вы можете применить удобрение для восстановления.',
        false
      )
    }
  } catch (error) {
    console.error('Save error:', error)
    toastRef.value?.showToast('Ошибка сохранения результата')
  }
}

function showResultModal(title: string, text: string, isSuccess: boolean) {
  modalTitle.value = title
  modalText.value = text
  modalSuccess.value = isSuccess
  modalShow.value = true
}
</script>

<template>
  <div class="watch-view">
    <AppToast ref="toastRef" />
    <ResultModal
      :show="modalShow"
      :title="modalTitle"
      :text="modalText"
      :is-success="modalSuccess"
      @close="modalShow = false"
    />

    <div v-if="observationStore.loading || !obs" class="loading-state">
      Загрузка параметров наблюдения...
    </div>

    <div v-else class="watch-container">
      <div class="section-head">
        <h2>Наблюдение за растением</h2>
        <p>{{ obs.plant_name }} — учебный сценарий роста в FloraAtlas</p>
      </div>

      <div class="watch-layout">
        <div class="panel left-panel">
          <StageVisual
            v-if="currentStage"
            :icon="currentStage.icon || obs.plant_icon || '🌱'"
            :stage-title="currentStage.title"
          />

          <HealthBar :health="obs.health" />

          <div class="tag-row">
            <span class="tag">Удобрения: <strong>{{ obs.fertilizer_count }}</strong></span>
            <span class="tag">Доступно этапов: <strong>{{ unlockedStageIndex + 1 }}/{{ stages.length }}</strong></span>
          </div>

          <div class="actions">
            <button class="btn secondary" @click="handleUseFertilizer">
              Использовать удобрение
            </button>
            <button
              class="btn ghost"
              :disabled="selectedStageIndex >= unlockedStageIndex"
              @click="handleNextStage"
            >
              Следующий открытый этап →
            </button>
          </div>
        </div>

        <div class="panel right-panel">
          <TheoryPanel
            v-if="currentStage"
            :stage="currentStage"
            :stage-order="selectedStageIndex + 1"
            :total-stages="stages.length"
          />

          <template v-if="currentStage">
            <QuizGame
              v-if="currentStage.game_type === 'quiz'"
              :key="'quiz-' + selectedStageIndex"
              :payload="currentStage.game_payload"
              @complete="handleGameComplete"
            />

            <MatchGame
              v-else-if="currentStage.game_type === 'match'"
              :key="'match-' + selectedStageIndex"
              :payload="currentStage.game_payload"
              @complete="handleGameComplete"
            />

            <GroupingGame
              v-else-if="currentStage.game_type === 'grouping'"
              :key="'grouping-' + selectedStageIndex"
              :payload="currentStage.game_payload"
              @complete="handleGameComplete"
            />

            <CrosswordGame
              v-else-if="currentStage.game_type === 'crossword'"
              :key="'crossword-' + selectedStageIndex"
              :payload="currentStage.game_payload"
              @complete="handleGameComplete"
            />

            <TableGame
              v-else-if="currentStage.game_type === 'table'"
              :key="'table-' + selectedStageIndex"
              :payload="currentStage.game_payload"
              @complete="handleGameComplete"
            />
          </template>

          <StageCarousel
            :stages="stages"
            :current-index="selectedStageIndex"
            :unlocked-index="unlockedStageIndex"
            @select-stage="selectStage"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-head {
  margin-bottom: 24px;
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

.watch-layout {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 24px;
}

.left-panel {
  display: flex;
  flex-direction: column;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 24px;
}

.actions .btn {
  width: 100%;
}

.loading-state {
  text-align: center;
  padding: 48px;
  color: var(--muted);
}

@media (max-width: 900px) {
  .watch-layout {
    grid-template-columns: 1fr;
  }
}
</style>
