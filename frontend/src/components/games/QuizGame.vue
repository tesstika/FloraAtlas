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

function submitAnswer() {
  if (!selectedOption.value) return
  isSubmitted.value = true
  const isCorrect = selectedOption.value === props.payload.correct
  emit('complete', isCorrect, isCorrect ? 100 : 0)
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
        @click="selectedOption = opt"
      >
        {{ opt }}
      </button>
    </div>

    <div class="game-actions">
      <button
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

.mini-game h3 {
  margin: 0 0 8px;
  font-size: 1.15rem;
}

.question {
  margin: 0 0 16px;
  color: var(--text);
  font-weight: 600;
  font-size: 1.02rem;
}

.options {
  display: grid;
  gap: 10px;
  margin-bottom: 20px;
}

.quiz-opt-btn {
  padding: 12px 16px;
  border-radius: 14px;
  background: white;
  color: var(--text);
  border: 1px solid var(--line);
  text-align: left;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.quiz-opt-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: var(--accent-weak);
}

.quiz-opt-btn.selected {
  border-color: var(--accent);
  background: var(--accent-weak);
  color: var(--accent);
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(47, 107, 79, 0.12);
}

.game-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
