import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/services/api'

export interface User {
  id: number
  name: string
  email: string
  role: 'student' | 'teacher'
  group_name: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const loading = ref(false)
  const initialized = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const isTeacher = computed(() => user.value?.role === 'teacher')

  async function fetchCurrentUser() {
    loading.value = true
    try {
      const res = await api.get<{ user: User }>('/auth/me')
      user.value = res.data.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function login(email: string, password: string) {
    loading.value = true
    try {
      const res = await api.post<{ user: User }>('/auth/login', { email, password })
      user.value = res.data.user
      return user.value
    } finally {
      loading.value = false
    }
  }

  async function register(payload: { name: string; email: string; password: string; role: 'student' | 'teacher'; group_name?: string }) {
    loading.value = true
    try {
      const res = await api.post<{ user: User }>('/auth/register', payload)
      user.value = res.data.user
      return user.value
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } finally {
      user.value = null
    }
  }

  return {
    user,
    loading,
    initialized,
    isAuthenticated,
    isTeacher,
    fetchCurrentUser,
    login,
    register,
    logout
  }
})
