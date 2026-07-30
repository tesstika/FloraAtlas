<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  payload: {
    question: string
    options: string[]
    correct: string
  }
}>()

const emit = defineEmits<{
  (e: 'complete', isPassed: boolean, score: number): void
}>()

const selectedOption = ref<string | null>(null)
const isSubmitted = ref(false)
const isFailed = ref(false)

function submitAnswer() {
  if (!selectedOption.value) return
  const isCorrect = selectedOption.value === props.payload.correct
  isSubmitted.value = isCorrect
  isFailed.value = !isCorrect
  emit('complete', isCorrect, isCorrect ? 100 : 0)
}

function resetGame() {
  selectedOption.value = null
  isSubmitted.value = false
  isFailed.value = false
}
</script>

<template>
  <div class="mini-game quiz-game">
    <h3>Мини-игра: Тест</h3>
    <p class="question">{{ payload.question }}</p>

    <div class="options">
      <button
        v-for="opt in payload.options"
        :key="opt"
        class="quiz-opt-btn"
        :class="{ selected: selectedOption === opt }"
        :disabled="isSubmitted"
        @click="selectedOption = opt; isFailed = false"
      >
        {{ opt }}
      </button>
    </div>

    <div v-if="isFailed" class="failed-notice">
      <span>❌ Ответ неверный. Попробуйте еще раз.</span>
    </div>

    <div class="game-actions">
      <button
        v-if="isFailed"
        class="btn secondary"
        @click="resetGame"
      >
        Попробовать снова ↺
      </button>
      <button
        v-else
        class="btn"
        :disabled="!selectedOption || isSubmitted"
        @click="submitAnswer"
      >
        Проверить ответ
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

.question {
  font-weight: 600;
  margin-bottom: 16px;
}

.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}

.quiz-opt-btn {
  padding: 12px 16px;
  border-radius: 14px;
  background: white;
  border: 1px solid var(--line);
  text-align: left;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.quiz-opt-btn:hover:not(:disabled) {
  border-color: var(--accent);
}

.quiz-opt-btn.selected {
  background: var(--accent);
  color: white;
  border-color: var(--accent);
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
}
</style>
