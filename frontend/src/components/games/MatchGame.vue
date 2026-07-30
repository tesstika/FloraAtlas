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

function selectLeft(left: string) {
  if (isSubmitted.value) return
  selectedLeft.value = left
}

function selectRight(right: string) {
  if (isSubmitted.value || !selectedLeft.value) return
  matches.value[selectedLeft.value] = right
  selectedLeft.value = null
}

function submitMatch() {
  isSubmitted.value = true
  let correctCount = 0
  props.payload.pairs.forEach(p => {
    if (matches.value[p.left] === p.right) {
      correctCount++
    }
  })

  const isPassed = correctCount === props.payload.pairs.length
  emit('complete', isPassed, Math.round((correctCount / props.payload.pairs.length) * 100))
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
          :class="{ active: Object.values(matches).includes(p.right) }"
          @click="selectRight(p.right)"
        >
          {{ p.right }}
        </button>
      </div>
    </div>

    <div class="game-actions">
      <button
        class="btn"
        :disabled="Object.keys(matches).length !== payload.pairs.length || isSubmitted"
        @click="submitMatch"
      >
        Проверить пары
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
  margin: 0 0 16px;
  font-weight: 600;
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
  gap: 10px;
}

.match-btn {
  padding: 12px;
  border-radius: 12px;
  background: white;
  border: 1px solid var(--line);
  font-size: 0.9rem;
  text-align: left;
}

.match-btn.active {
  border-color: var(--accent);
  background: var(--accent-weak);
  color: var(--accent);
  font-weight: 700;
}

.match-btn.matched {
  border-color: #a3c4af;
  background: #f0f7f2;
}

.game-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
