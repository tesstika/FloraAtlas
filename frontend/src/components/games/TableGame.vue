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

const treatmentsPool = props.payload.rows.map(r => r.treatment).sort(() => Math.random() - 0.5)

props.payload.rows.forEach(r => {
  userTreatments.value[r.symptom] = ''
})

function submitTable() {
  isSubmitted.value = true
  let correctCount = 0

  props.payload.rows.forEach(r => {
    if (userTreatments.value[r.symptom] === r.treatment) {
      correctCount++
    }
  })

  const isPassed = correctCount === props.payload.rows.length
  emit('complete', isPassed, Math.round((correctCount / props.payload.rows.length) * 100))
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
              class="table-select"
            >
              <option value="">-- Выберите способ ухода --</option>
              <option v-for="t in treatmentsPool" :key="t" :value="t">
                {{ t }}
              </option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="game-actions">
      <button class="btn" :disabled="isSubmitted" @click="submitTable">
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
  border: 1px solid var(--line);
}

.game-table th,
.game-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.game-table th {
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 0.85rem;
}

.table-select {
  width: 100%;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--line);
}

.game-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
