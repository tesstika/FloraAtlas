<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePlantStore } from '@/stores/plants'
import { useTeacherStore } from '@/stores/teacher'
import { useObservationStore } from '@/stores/observation'

const emit = defineEmits<{
  (e: 'toast', message: string): void
}>()

const plantStore = usePlantStore()
const teacherStore = useTeacherStore()
const observationStore = useObservationStore()

const selectedPlantId = ref<number | null>(null)
const name = ref('')
const description = ref('')
const regionName = ref('')
const stagesCount = ref(4)

const isSubmitting = ref(false)

// New Plant Modal state
const showAddModal = ref(false)
const newName = ref('')
const newDescription = ref('')
const newRegionName = ref('Азия / Сибирь (Тайга)')
const newStagesCount = ref(4)
const newIcon = ref('🪴')

const regionOptions = [
  'Азия / Сибирь (Тайга)',
  'Северная Америка (Калифорния)',
  'Южная Америка (Амазония)',
  'Европа (Альпы / Скандинавия)',
  'Африка / Саванна (Мадагаскар)',
  'Африка / Тропики (Эфиопия)',
  'Австралия / Океания'
]

onMounted(async () => {
  await plantStore.fetchPlants()
  if (plantStore.plants.length) {
    selectedPlantId.value = plantStore.plants[0].id
    updateForm()
  }
})

watch(selectedPlantId, () => {
  updateForm()
})

function updateForm() {
  const p = plantStore.plants.find(item => item.id === selectedPlantId.value)
  if (p) {
    name.value = p.name
    description.value = p.description
    regionName.value = p.region_name
    stagesCount.value = p.stages_count
  } else {
    name.value = ''
    description.value = ''
    regionName.value = ''
    stagesCount.value = 4
  }
}

async function savePlantChanges() {
  if (!selectedPlantId.value) return
  isSubmitting.value = true
  try {
    await teacherStore.updatePlantCard(selectedPlantId.value, {
      name: name.value,
      description: description.value,
      stages_count: stagesCount.value,
      region_name: regionName.value
    })
    await plantStore.fetchPlants()
    if (selectedPlantId.value) {
      await plantStore.fetchPlantById(selectedPlantId.value)
    }
    emit('toast', 'Содержание карточки растения и структура этапов успешно обновлены!')
  } catch (err: any) {
    console.error('Save error:', err)
    emit('toast', err.response?.data?.error || 'Ошибка сохранения карточки')
  } finally {
    isSubmitting.value = false
  }
}

async function handleDeletePlant() {
  if (!selectedPlantId.value) return
  const currentPlant = plantStore.plants.find(p => p.id === selectedPlantId.value)
  const plantName = currentPlant ? currentPlant.name : 'это растение'

  if (!window.confirm(`Вы уверены, что хотите удалить растение "${plantName}"?`)) {
    return
  }

  isSubmitting.value = true
  try {
    const deletedId = selectedPlantId.value
    await teacherStore.deletePlantCard(deletedId)

    plantStore.plants = plantStore.plants.filter(p => p.id !== deletedId)
    observationStore.observations = observationStore.observations.filter(o => o.plant_id !== deletedId)

    await plantStore.fetchPlants()

    if (plantStore.plants.length > 0) {
      selectedPlantId.value = plantStore.plants[0].id
    } else {
      selectedPlantId.value = null
    }

    updateForm()
    emit('toast', 'Растение успешно удалено из каталога!')
  } catch (err: any) {
    console.error('Save error:', err)
    emit('toast', err.response?.data?.error || 'Ошибка удаления растения')
  } finally {
    isSubmitting.value = false
  }
}

async function handleAddPlant() {
  if (!newName.value || !newDescription.value) {
    emit('toast', 'Заполните название и описание растения')
    return
  }

  isSubmitting.value = true
  try {
    const res = await teacherStore.createPlantCard({
      name: newName.value,
      description: newDescription.value,
      stages_count: newStagesCount.value,
      region_name: newRegionName.value || 'Азия / Сибирь (Тайга)',
      icon: newIcon.value
    })

    await plantStore.fetchPlants()
    selectedPlantId.value = res.plant.id
    showAddModal.value = false

    newName.value = ''
    newDescription.value = ''
    newRegionName.value = 'Азия / Сибирь (Тайга)'
    newStagesCount.value = 4

    emit('toast', 'Новое растение успешно добавлено в каталог!')
  } catch (err: any) {
    console.error('Save error:', err)
    emit('toast', err.response?.data?.error || 'Ошибка добавления растения')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="plant-content-editor">
    <div class="editor-header">
      <div>
        <h3>Редактор списка растений</h3>
        <p class="desc">Форма для управления карточками растений, описанием, регионами и этапами развития.</p>
      </div>

      <button class="btn" @click="showAddModal = true">
        + Добавить новое растение
      </button>
    </div>

    <div v-if="plantStore.plants.length > 0" class="form-grid">
      <div class="field">
        <label>Выберите растение</label>
        <select v-model="selectedPlantId">
          <option v-for="p in plantStore.plants" :key="p.id" :value="p.id">
            {{ p.icon }} {{ p.name }} ({{ p.stages_count }} этапов)
          </option>
        </select>
      </div>

      <div class="field">
        <label>Название растения</label>
        <input v-model="name" placeholder="Название растения" />
      </div>

      <div class="field">
        <label>Количество этапов развития</label>
        <input v-model.number="stagesCount" type="number" min="1" max="10" />
      </div>

      <div class="field">
        <label>Маркер географического региона</label>
        <select v-model="regionName">
          <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
        </select>
      </div>

      <div class="field full-width">
        <label>Описание и характеристики</label>
        <textarea v-model="description" rows="4" style="resize: none;" placeholder="Теоретическое описание растения..."></textarea>
      </div>
    </div>

    <div v-else class="empty-notice">
      В каталоге нет растений. Нажмите "+ Добавить новое растение", чтобы создать первое.
    </div>

    <div v-if="plantStore.plants.length > 0" class="actions">
      <button class="btn danger-btn" :disabled="isSubmitting" @click="handleDeletePlant">
        🗑️ Удалить растение
      </button>
      <button class="btn" :disabled="isSubmitting" @click="savePlantChanges">
        Сохранить изменения
      </button>
    </div>

    <!-- Modal for Adding New Plant -->
    <Teleport to="body">
      <div v-if="showAddModal" class="modal-backdrop" @click.self="showAddModal = false">
        <div class="modal-card">
          <h3>🌱 Добавить новое растение</h3>
          <p class="modal-sub">Заполните параметры для добавления растения в каталог FloraAtlas.</p>

          <div class="modal-form">
            <div class="field">
              <label>Название растения</label>
              <input v-model="newName" placeholder="Например: Кедр сибирский" required />
            </div>

            <div class="field">
              <label>Иконка (Эмодзи)</label>
              <select v-model="newIcon">
                <option value="🌲">🌲 Хвойное дерево</option>
                <option value="🌳">🌳 Лиственное дерево</option>
                <option value="🌴">🌴 Пальма</option>
                <option value="🌿">🌿 Росток / Кустарник</option>
                <option value="🪴">🪴 Комнатное растение</option>
                <option value="🌻">🌻 Подсолнух</option>
                <option value="☕">☕ Кофейное дерево</option>
              </select>
            </div>

            <div class="field">
              <label>Количество этапов развития</label>
              <input v-model.number="newStagesCount" type="number" min="1" max="10" />
            </div>

            <div class="field">
              <label>Географический регион</label>
              <select v-model="newRegionName">
                <option v-for="r in regionOptions" :key="r" :value="r">{{ r }}</option>
              </select>
            </div>

            <div class="field full-width">
              <label>Описание растения</label>
              <textarea v-model="newDescription" rows="3" style="resize: none;" placeholder="Краткое ботаническое описание..."></textarea>
            </div>
          </div>

          <div class="modal-actions">
            <button class="btn ghost" @click="showAddModal = false">Отмена</button>
            <button class="btn" :disabled="isSubmitting" @click="handleAddPlant">
              Создать растение
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
  flex-wrap: wrap;
}

.editor-header h3 {
  margin: 0 0 4px;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
}

.desc {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.full-width {
  grid-column: 1 / -1;
}

.field input,
.field select,
.field textarea {
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  resize: none;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.danger-btn {
  background: #fdf2f0;
  color: var(--danger);
  border: 1px solid #f5c6cb;
}

.danger-btn:hover {
  background: var(--danger);
  color: white;
}

.empty-notice {
  padding: 32px;
  text-align: center;
  color: var(--muted);
  border: 1px dashed var(--line);
  border-radius: 16px;
  margin-bottom: 24px;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 18px;
  background: rgba(31, 42, 36, 0.45);
  backdrop-filter: blur(4px);
}

.modal-card {
  width: min(540px, 92vw);
  max-width: 100%;
  padding: 28px;
  border-radius: 24px;
  background: white;
  box-shadow: var(--shadow-lg);
  box-sizing: border-box;
  overflow: hidden;
}

.modal-card h3 {
  margin: 0 0 4px;
  font-size: 1.4rem;
}

.modal-sub {
  margin: 0 0 20px;
  color: var(--muted);
  font-size: 0.9rem;
}

.modal-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 24px;
  width: 100%;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
