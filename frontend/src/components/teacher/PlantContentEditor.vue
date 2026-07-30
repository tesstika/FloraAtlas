<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { usePlantStore } from '@/stores/plants'
import { useTeacherStore } from '@/stores/teacher'

const emit = defineEmits<{
  (e: 'toast', message: string): void
}>()

const plantStore = usePlantStore()
const teacherStore = useTeacherStore()

const selectedPlantId = ref<number | null>(null)
const name = ref('')
const description = ref('')
const regionName = ref('')
const stagesCount = ref(4)

const isSubmitting = ref(false)

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
    emit('toast', 'Содержание карточки растения успешно обновлено!')
  } catch (err: any) {
    emit('toast', err.response?.data?.error || 'Ошибка сохранения карточки')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="plant-content-editor">
    <h3>Редактор списка растений</h3>
    <p class="desc">Форма для управления карточками растений, описанием, регионами и этапами развития.</p>

    <div class="form-grid">
      <div class="field">
        <label>Выберите растение</label>
        <select v-model="selectedPlantId">
          <option v-for="p in plantStore.plants" :key="p.id" :value="p.id">
            {{ p.icon }} {{ p.name }}
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
        <input v-model="regionName" placeholder="Регион распространения" />
      </div>

      <div class="field full-width">
        <label>Описание и характеристики</label>
        <textarea v-model="description" rows="4" placeholder="Теоретическое описание растения..."></textarea>
      </div>
    </div>

    <div class="actions">
      <button class="btn" :disabled="isSubmitting" @click="savePlantChanges">
        Сохранить изменения
      </button>
    </div>
  </div>
</template>

<style scoped>
.plant-content-editor h3 {
  margin: 0 0 4px;
  font-size: 1.3rem;
  letter-spacing: -0.02em;
}

.desc {
  margin: 0 0 20px;
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

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
