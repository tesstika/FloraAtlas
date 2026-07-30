<script setup lang="ts">
import { ref } from 'vue'

interface Clue {
  number: number
  clue: string
  answer: string
}

const props = defineProps<{
  payload: {
    question: string
    clues: Clue[]
  }
}>()

const emit = defineEmits<{
  (e: 'complete', isPassed: boolean, score: number): void
}>()

const userAnswers = ref<Record<number, string>>({})
const isSubmitted = ref(false)
const isFailed = ref(false)

props.payload.clues.forEach(c => {
  userAnswers.value[c.number] = ''
})

function submitCrossword() {
  let correctCount = 0

  props.payload.clues.forEach(c => {
    const userVal = (userAnswers.value[c.number] || '').trim().toUpperCase()
    if (userVal === c.answer.toUpperCase()) {
      correctCount++
    }
  })

  const isPassed = correctCount === props.payload.clues.length
  isSubmitted.value = isPassed
  isFailed.value = !isPassed
  emit('complete', isPassed, Math.round((correctCount / props.payload.clues.length) * 100))
}

function resetGame() {
  props.payload.clues.forEach(c => {
    userAnswers.value[c.number] = ''
  })
  isSubmitted.value = false
  isFailed.value = false
}
</script>

<template>
  <div class="mini-game crossword-game">
    <h3>Мини-игра: Кроссворд</h3>
    <p class="question">{{ payload.question }}</p>

    <div class="clues-list">
      <div v-for="c in payload.clues" :key="c.number" class="clue-item">
        <label :for="'clue-' + c.number">
          <strong>{{ c.number }}.</strong> {{ c.clue }} ({{ c.answer.length }} букв)
        </label>
        <input
          :id="'clue-' + c.number"
          v-model="userAnswers[c.number]"
          class="crossword-input"
          :maxlength="c.answer.length"
          placeholder="ВВЕДИТЕ ОТВЕТ"
          :disabled="isSubmitted"
          @input="isFailed = false"
        />
      </div>
    </div>

    <div v-if="isFailed" class="failed-notice">
      <span>❌ В кроссворде есть ошибки. Проверьте введенные слова и попробуйте еще раз.</span>
    </div>

    <div class="game-actions">
      <button
        v-if="isFailed"
        class="btn ghost"
        @click="resetGame"
      >
        Очистить ↺
      </button>
      <button
        class="btn"
        :disabled="isSubmitted"
        @click="submitCrossword"
      >
        Проверить кроссворд
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

.clues-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 20px;
}

.clue-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: white;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid var(--line);
}

.clue-item label {
  font-size: 0.9rem;
}

.crossword-input {
  text-transform: uppercase;
  letter-spacing: 0.1em;
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
