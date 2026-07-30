<script setup lang="ts">
import { ref } from 'vue'

interface TableRow {
  symptom: string
  cause: string
  treatment: string
}

const props = defineProps<{
  payload: {
    question: string
    rows: TableRow[]
  }
}>()

const emit = defineEmits<{
  (e: 'complete', isPassed: boolean, score: number): void
}>()

const userTreatments = ref<Record<string, string>>({})
const isSubmitted = ref(false)
const isFailed = ref(false)

const treatmentsPool = props.payload.rows.map(r => r.treatment).sort(() => Math.random() - 0.5)

props.payload.rows.forEach(r => {
  userTreatments.value[r.symptom] = ''
})

function submitTable() {
  let correctCount = 0

  props.payload.rows.forEach(r => {
    if (userTreatments.value[r.symptom] === r.treatment) {
      correctCount++
    }
  })

  const isPassed = correctCount === props.payload.rows.length
  isSubmitted.value = isPassed
  isFailed.value = !isPassed
  emit('complete', isPassed, Math.round((correctCount / props.payload.rows.length) * 100))
}

function resetGame() {
  props.payload.rows.forEach(r => {
    userTreatments.value[r.symptom] = ''
  })
  isSubmitted.value = false
  isFailed.value = false
}
</script>

<template>
  <div class="mini-game table-game">
    <h3>Мини-игра: Таблица ухода</h3>
    <p class="question">{{ payload.question }}</p>

    <table class="game-table">
      <thead>
        <tr>
          <th>Симптом / Проблема</th>
          <th>Причина</th>
          <th>Способ ухода / Лечение</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="r in payload.rows" :key="r.symptom">
          <td><strong>{{ r.symptom }}</strong></td>
          <td>{{ r.cause }}</td>
          <td>
            <select
              v-model="userTreatments[r.symptom]"
              :disabled="isSubmitted"
              @change="isFailed = false"
            >
              <option value="">-- Выберите решение --</option>
              <option v-for="t in treatmentsPool" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="isFailed" class="failed-notice">
      <span>❌ Таблица заполнена с ошибками. Измените выбранные ответы и проверьте снова.</span>
    </div>

    <div class="game-actions">
      <button
        v-if="isFailed"
        class="btn ghost"
        @click="resetGame"
      >
        Сбросить ответы ↺
      </button>
      <button
        class="btn"
        :disabled="isSubmitted"
        @click="submitTable"
      >
        Проверить таблицу
      </button>
    </div>
  </div>
</template>

<style scoped>
.mini-game {
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--surface-soft);
  margin-top: 20px;
}

.game-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.game-table th,
.game-table td {
  padding: 10px 12px;
  border: 1px solid var(--line);
  font-size: 0.88rem;
  text-align: left;
}

.game-table th {
  background: var(--surface-soft);
  font-weight: 700;
}

.failed-notice {
  padding: 10px 14px;
  border-radius: 12px;
  background: #fdf2f0;
  color: var(--danger);
  font-weight: 600;
  font-size: 0.9rem;
  margin-bottom: 16px;
  border: 1px solid #f5c6cb;
}

.game-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
