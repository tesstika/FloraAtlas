<script setup lang="ts">
import { ref } from 'vue'

interface Group {
  name: string
  items: string[]
}

const props = defineProps<{
  payload: {
    question: string
    groups: Group[]
  }
}>()

const emit = defineEmits<{
  (e: 'complete', isPassed: boolean, score: number): void
}>()

const itemsPool = ref<string[]>([])
const groupAssignments = ref<Record<string, string[]>>({})
const selectedItem = ref<string | null>(null)
const isSubmitted = ref(false)
const isFailed = ref(false)

function initGame() {
  itemsPool.value = []
  groupAssignments.value = {}
  selectedItem.value = null
  isSubmitted.value = false
  isFailed.value = false

  props.payload.groups.forEach(g => {
    groupAssignments.value[g.name] = []
    itemsPool.value.push(...g.items)
  })
  itemsPool.value.sort(() => Math.random() - 0.5)
}

initGame()

function selectPoolItem(item: string) {
  if (isSubmitted.value) return
  selectedItem.value = item
}

function assignToGroup(groupName: string) {
  if (!selectedItem.value || isSubmitted.value) return
  groupAssignments.value[groupName].push(selectedItem.value)
  itemsPool.value = itemsPool.value.filter(i => i !== selectedItem.value)
  selectedItem.value = null
  isFailed.value = false
}

function unassignItem(groupName: string, item: string, event: MouseEvent) {
  event.stopPropagation()
  if (isSubmitted.value) return
  groupAssignments.value[groupName] = groupAssignments.value[groupName].filter(i => i !== item)
  itemsPool.value.push(item)
  isFailed.value = false
}

function submitGrouping() {
  let correct = true

  props.payload.groups.forEach(g => {
    const assigned = groupAssignments.value[g.name]
    if (assigned.length !== g.items.length) correct = false
    g.items.forEach(item => {
      if (!assigned.includes(item)) correct = false
    })
  })

  isSubmitted.value = correct
  isFailed.value = !correct
  emit('complete', correct, correct ? 100 : 0)
}
</script>

<template>
  <div class="mini-game grouping-game">
    <h3>Мини-игра: Группировка</h3>
    <p class="question">{{ payload.question }}</p>

    <div class="pool-box">
      <p class="pool-label">Выберите элемент из пула, затем нажмите на нужный блок категории:</p>
      <div class="items-flex">
        <button
          v-for="item in itemsPool"
          :key="item"
          class="item-btn"
          :class="{ selected: selectedItem === item }"
          :disabled="isSubmitted"
          @click="selectPoolItem(item)"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <div class="groups-grid">
      <div
        v-for="g in payload.groups"
        :key="g.name"
        class="group-card"
        @click="assignToGroup(g.name)"
      >
        <h4>{{ g.name }}</h4>
        <div class="assigned-items">
          <span
            v-for="i in groupAssignments[g.name]"
            :key="i"
            class="assigned-chip"
            title="Нажмите, чтобы убрать обратно в пул"
            @click="unassignItem(g.name, i, $event)"
          >
            {{ i }} ✕
          </span>
        </div>
      </div>
    </div>

    <div v-if="isFailed" class="failed-notice">
      <span>❌ Группировка выполнены неверно. Нажмите "Сбросить ответы" и попробуйте снова.</span>
    </div>

    <div class="game-actions">
      <button
        class="btn ghost"
        @click="initGame"
      >
        Сбросить ответы ↺
      </button>
      <button
        class="btn"
        :disabled="itemsPool.length > 0 || isSubmitted"
        @click="submitGrouping"
      >
        Проверить распределение
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

.pool-box {
  background: white;
  padding: 12px;
  border-radius: 14px;
  margin-bottom: 16px;
  border: 1px solid var(--line);
}

.pool-label {
  margin: 0 0 8px;
  font-size: 0.85rem;
  color: var(--muted);
}

.items-flex {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.item-btn {
  padding: 8px 12px;
  border-radius: 999px;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  font-size: 0.88rem;
  font-weight: 600;

}

.item-btn.selected {
  background: var(--accent);
  color: white;
}

.groups-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 20px;
}

.group-card {
  background: white;
  border: 2px dashed var(--line);
  border-radius: 16px;
  padding: 14px;
  min-height: 120px;
  cursor: pointer;
  transition: border-color 0.2s ease;
}

.group-card:hover {
  border-color: var(--accent);
}

.group-card h4 {
  margin: 0 0 10px;
  font-size: 0.95rem;
  color: var(--accent);
}

.assigned-items {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.assigned-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background: var(--accent-weak);
  color: var(--accent);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}

.assigned-chip:hover {
  background: #fdf2f0;
  color: var(--danger);
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
