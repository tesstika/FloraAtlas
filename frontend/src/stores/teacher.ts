import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import type { UserObservation } from './observation'

export interface Student {
  id: number
  name: string
  email: string
  group_name: string
}

export const useTeacherStore = defineStore('teacher', () => {
  const groups = ref<string[]>([])
  const students = ref<Student[]>([])
  const studentObservations = ref<UserObservation[]>([])
  const loading = ref(false)

  async function fetchGroups() {
    loading.value = true
    try {
      const res = await api.get<{ groups: string[] }>('/teacher/groups')
      groups.value = res.data.groups
    } finally {
      loading.value = false
    }
  }

  async function fetchStudents(groupName?: string) {
    loading.value = true
    try {
      const res = await api.get<{ students: Student[] }>('/teacher/students', {
        params: { group_name: groupName }
      })
      students.value = res.data.students
    } finally {
      loading.value = false
    }
  }

  async function fetchStudentObservations(studentId: number) {
    loading.value = true
    try {
      const res = await api.get<{ observations: UserObservation[] }>(`/teacher/student-observations/${studentId}`)
      studentObservations.value = res.data.observations
    } finally {
      loading.value = false
    }
  }

  async function updateObservation(id: number, health?: number, currentStageIndex?: number) {
    const res = await api.patch<{ message: string }>(`/teacher/observations/${id}`, {
      health,
      current_stage_index: currentStageIndex
    })
    return res.data
  }

  async function updatePlantCard(id: number, payload: { name?: string; description?: string; stages_count?: number; region_name?: string }) {
    const res = await api.put<{ message: string }>(`/teacher/plants/${id}`, payload)
    return res.data
  }

  return {
    groups,
    students,
    studentObservations,
    loading,
    fetchGroups,
    fetchStudents,
    fetchStudentObservations,
    updateObservation,
    updatePlantCard
  }
})
