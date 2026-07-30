<script setup lang="ts">
import { ref } from 'vue'

interface Pair {
  left: string
  right: string
}

const props = defineProps<{
  payload: {
    question: string
    pairs: Pair[]
  }
}>()

const emit = defineEmits<{
  (e: 'complete', isPassed: boolean, score: number): void
}>()

const selectedLeft = ref<string | null>(null)
const matches = ref<Record<string, string>>({})
const isSubmitted = ref(false)
const isFailed = ref(false)

function selectLeft(left: string) {
  if (isSubmitted.value) return
  selectedLeft.value = left
}

function selectRight(right: string) {
  if (isSubmitted.value || !selectedLeft.value) return
  matches.value[selectedLeft.value] = right
  selectedLeft.value = null
  isFailed.value = false
}

function submitMatch() {
  let correctCount = 0
  props.payload.pairs.forEach(p => {
    if (matches.value[p.left] === p.right) {
      correctCount++
    }
  })

  const isPassed = correctCount === props.payload.pairs.length
  isSubmitted.value = isPassed
  isFailed.value = !isPassed
  emit('complete', isPassed, Math.round((correctCount / props.payload.pairs.length) * 100))
}

function resetGame() {
  matches.value = {}
  selectedLeft.value = null
  isSubmitted.value = false
  isFailed.value = false
}
</script>

<template>
  <div class="mini-game match-game">
    <h3>Мини-игра: Задание на соответствие</h3>
    <p class="question">{{ payload.question }}</p>

    <div class="match-grid">
      <div class="column left-col">
        <button
          v-for="p in payload.pairs"
          :key="p.left"
          class="match-btn"
          :class="{ active: selectedLeft === p.left, matched: matches[p.left] }"
          :disabled="isSubmitted"
          @click="selectLeft(p.left)"
        >
          {{ p.left }}
        </button>
      </div>

      <div class="column right-col">
        <button
          v-for="p in payload.pairs"
          :key="p.right"
          class="match-btn"
          :disabled="isSubmitted || !selectedLeft"
          @click="selectRight(p.right)"
        >
          {{ p.right }}
        </button>
      </div>
    </div>

    <div v-if="Object.keys(matches).length > 0" class="matches-list">
      <h4>Составленные пары:</h4>
      <ul>
        <li v-for="(rightVal, leftKey) in matches" :key="leftKey">
          {{ leftKey }} ➔ {{ rightVal }}
        </li>
      </ul>
    </div>

    <div v-if="isFailed" class="failed-notice">
      <span>❌ Ответ неверный. Попробуйте пересоздать пары.</span>
    </div>

    <div class="game-actions">
      <button
        v-if="Object.keys(matches).length > 0"
        class="btn ghost"
        @click="resetGame"
      >
        Сбросить пары ↺
      </button>
      <button
        class="btn"
        :disabled="Object.keys(matches).length !== payload.pairs.length || isSubmitted"
        @click="submitMatch"
      >
        Проверить
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

.match-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.column {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.match-btn {
  padding: 10px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--line);
  font-size: 0.9rem;
}

.match-btn.active {
  border-color: var(--accent);
  background: var(--accent-weak);
}

.match-btn.matched {
  background: #e2f0d9;
  border-color: #70ad47;
}

.matches-list {
  background: white;
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;

}

.matches-list h4 {
  margin: 0 0 6px;
  font-size: 0.85rem;
}

.matches-list ul {
  margin: 0;
  padding-left: 18px;
  font-size: 0.85rem;
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
