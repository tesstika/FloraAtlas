<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useTeacherStore } from '@/stores/teacher'

const emit = defineEmits<{
  (e: 'toast', message: string): void
}>()

const teacherStore = useTeacherStore()

const selectedGroup = ref('БИО-101')
const selectedStudentId = ref<number | null>(null)
const selectedObsId = ref<number | null>(null)

const healthInput = ref(100)
const stageIndexInput = ref(0)
const isSubmitting = ref(false)

onMounted(async () => {
  await teacherStore.fetchGroups()
  if (teacherStore.groups.length) {
    selectedGroup.value = teacherStore.groups[0]
  }
  await loadStudents()
})

watch(selectedGroup, async () => {
  await loadStudents()
})

watch(selectedStudentId, async (newVal) => {
  if (newVal) {
    await teacherStore.fetchStudentObservations(newVal)
    if (teacherStore.studentObservations.length) {
      selectedObsId.value = teacherStore.studentObservations[0].id
      updateFormState()
    } else {
      selectedObsId.value = null
    }
  }
})

watch(selectedObsId, () => {
  updateFormState()
})

async function loadStudents() {
  await teacherStore.fetchStudents(selectedGroup.value)
  if (teacherStore.students.length) {
    selectedStudentId.value = teacherStore.students[0].id
  } else {
    selectedStudentId.value = null
    selectedObsId.value = null
  }
}

function updateFormState() {
  const obs = teacherStore.studentObservations.find(o => o.id === selectedObsId.value)
  if (obs) {
    healthInput.value = obs.health
    stageIndexInput.value = obs.current_stage_index
  }
}

async function saveObservationChanges() {
  if (!selectedObsId.value) return
  isSubmitting.value = true
  try {
    await teacherStore.updateObservation(
      selectedObsId.value,
      healthInput.value,
      stageIndexInput.value
    )
    emit('toast', 'Параметры прогресса студента успешно обновлены!')
  } catch (err: any) {
    emit('toast', err.response?.data?.error || 'Ошибка сохранения')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="student-process-editor">
    <h3>Редактор процесса студента</h3>
    <p class="desc">Выбор группы, студента и конкретного растения для корректировки образовательного прогресса.</p>

    <div class="filters-grid">
      <div class="field">
        <label>Группа</label>
        <select v-model="selectedGroup">
          <option v-for="g in teacherStore.groups" :key="g" :value="g">
            {{ g }}
          </option>
        </select>
      </div>

      <div class="field">
        <label>Студент</label>
        <select v-model="selectedStudentId">
          <option v-for="s in teacherStore.students" :key="s.id" :value="s.id">
            {{ s.name }} ({{ s.email }})
          </option>
        </select>
      </div>

      <div class="field">
        <label>Растение студента</label>
        <select v-model="selectedObsId">
          <option v-for="o in teacherStore.studentObservations" :key="o.id" :value="o.id">
            {{ o.plant_name }} ({{ o.time_mode === 'virtual' ? 'Виртуальное' : 'Реальное' }})
          </option>
        </select>
      </div>
    </div>

    <div v-if="selectedObsId" class="edit-table-container">
      <table class="editor-table">
        <thead>
          <tr>
            <th>Параметр</th>
            <th>Значение</th>
            <th>Действие</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Здоровье растения (0-100%)</strong></td>
            <td>
              <input
                v-model.number="healthInput"
                type="number"
                min="0"
                max="100"
                class="table-input"
              />
            </td>
            <td>
              <button class="btn secondary" :disabled="isSubmitting" @click="saveObservationChanges">
                Сохранить здоровье
              </button>
            </td>
          </tr>

          <tr>
            <td><strong>Доступный этап развития</strong></td>
            <td>
              <select v-model.number="stageIndexInput" class="table-input">
                <option :value="0">1. Посадка семени</option>
                <option :value="1">2. Прорастание</option>
                <option :value="2">3. Молодой росток</option>
                <option :value="3">4. Развитие саженца</option>
                <option :value="4">5. Молодое дерево</option>
                <option :value="5">6. Взрослое дерево</option>
              </select>
            </td>
            <td>
              <button class="btn secondary" :disabled="isSubmitting" @click="saveObservationChanges">
                Открыть этап
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="empty-notice">
      Нет доступных наблюдений для выбранного студента.
    </div>
  </div>
</template>

<style scoped>
.student-process-editor h3 {
  margin: 0 0 4px;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
}

.desc {
  margin: 0 0 20px;
  color: var(--muted);
  font-size: 0.95rem;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.editor-table {
  width: 100%;
  border-collapse: collapse;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--line);
}

.editor-table th,
.editor-table td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid var(--line);
}

.editor-table th {
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 0.85rem;
}

.table-input {
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--line);
  background: var(--surface-soft);
  width: 100%;
  max-width: 220px;
}

.empty-notice {
  padding: 32px;
  text-align: center;
  color: var(--muted);
  border: 1px dashed var(--line);
  border-radius: 16px;
}
</style>
