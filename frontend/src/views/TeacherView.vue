<script setup lang="ts">
import { ref } from 'vue'
import StudentProcessEditor from '@/components/teacher/StudentProcessEditor.vue'
import PlantContentEditor from '@/components/teacher/PlantContentEditor.vue'
import AppToast from '@/components/ui/AppToast.vue'

const activeTab = ref<'studentProcess' | 'plantEditor'>('studentProcess')
const toastRef = ref<InstanceType<typeof AppToast> | null>(null)

function handleToast(message: string) {
  toastRef.value?.showToast(message)
}
</script>

<template>
  <div class="teacher-view">
    <AppToast ref="toastRef" />

    <div class="section-head">
      <div>
        <h2>Кабинет преподавателя FloraAtlas</h2>
        <p>Панель управления учебным процессом студентов и редактор образовательного контента.</p>
      </div>
    </div>

    <div class="teacher-layout">
      <div class="panel side-menu">
        <button
          :class="{ active: activeTab === 'studentProcess' }"
          @click="activeTab = 'studentProcess'"
        >
          📋 Редактор процесса студента
        </button>
        <button
          :class="{ active: activeTab === 'plantEditor' }"
          @click="activeTab = 'plantEditor'"
        >
          🌿 Редактор списка растений
        </button>
      </div>

      <div class="panel main-content">
        <StudentProcessEditor
          v-if="activeTab === 'studentProcess'"
          @toast="handleToast"
        />
        <PlantContentEditor
          v-else-if="activeTab === 'plantEditor'"
          @toast="handleToast"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.section-head {
  margin-bottom: 24px;
}

.section-head h2 {
  margin: 0 0 4px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.section-head p {
  margin: 0;
  color: var(--muted);
}

.teacher-layout {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}

.side-menu {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.side-menu button {
  width: 100%;
  padding: 14px;
  border-radius: 16px;
  background: var(--surface-soft);
  color: var(--muted);
  text-align: left;
  font-weight: 700;
  font-size: 0.95rem;
}

.side-menu button.active {
  background: var(--accent);
  color: white;
  box-shadow: 0 6px 16px rgba(47, 107, 79, 0.2);
}

@media (max-width: 860px) {
  .teacher-layout {
    grid-template-columns: 1fr;
  }
}
</style>
