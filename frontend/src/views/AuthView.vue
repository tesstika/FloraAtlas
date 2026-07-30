<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const role = ref<'student' | 'teacher'>('student')
const isLoginMode = ref(true)

const name = ref('Анна Иванова')
const email = ref('student@example.ru')
const password = ref('123456')
const groupName = ref('БИО-101')
const errorMessage = ref('')

function switchRole(selectedRole: 'student' | 'teacher') {
  role.value = selectedRole
  if (selectedRole === 'teacher') {
    email.value = 'teacher@example.ru'
    name.value = 'Профессор Петров'
    groupName.value = 'Кафедра ботаники'
  } else {
    email.value = 'student@example.ru'
    name.value = 'Анна Иванова'
    groupName.value = 'БИО-101'
  }
}

async function handleSubmit() {
  errorMessage.value = ''
  try {
    if (isLoginMode.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register({
        name: name.value,
        email: email.value,
        password: password.value,
        role: role.value,
        group_name: groupName.value
      })
    }

    const redirectPath = (route.query.redirect as string) || (authStore.isTeacher ? '/teacher' : '/catalog')
    router.push(redirectPath)
  } catch (err: any) {
    errorMessage.value = err.response?.data?.error || 'Ошибка входа в систему'
  }
}
</script>

<template>
  <div class="auth-view">
    <div class="panel auth-card">
      <div class="section-head">
        <h2>{{ isLoginMode ? 'Вход в систему' : 'Регистрация' }}</h2>
        <p>Выберите роль пользователя для сохранения персонального прогресса в FloraAtlas.</p>
      </div>

      <div class="role-tabs">
        <button
          :class="{ active: role === 'student' }"
          @click="switchRole('student')"
        >
          🎓 Студент
        </button>
        <button
          :class="{ active: role === 'teacher' }"
          @click="switchRole('teacher')"
        >
          👩‍🏫 Преподаватель
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div v-if="errorMessage" class="error-banner">
          {{ errorMessage }}
        </div>

        <div v-if="!isLoginMode" class="field">
          <label for="name">Имя и фамилия</label>
          <input id="name" v-model="name" required placeholder="Введите ваше имя" />
        </div>

        <div class="field">
          <label for="email">Электронная почта</label>
          <input id="email" v-model="email" type="email" required placeholder="example@domain.ru" />
        </div>

        <div class="field">
          <label for="password">Пароль</label>
          <input id="password" v-model="password" type="password" required placeholder="••••••••" />
        </div>

        <div v-if="!isLoginMode && role === 'student'" class="field">
          <label for="group">Учебная группа</label>
          <input id="group" v-model="groupName" placeholder="Например: БИО-101" />
        </div>

        <div class="actions">
          <button type="submit" class="btn" :disabled="authStore.loading">
            {{ isLoginMode ? 'Продолжить' : 'Зарегистрироваться' }}
          </button>

          <button
            type="button"
            class="btn ghost"
            @click="isLoginMode = !isLoginMode"
          >
            {{ isLoginMode ? 'Создать новый аккаунт' : 'Уже есть аккаунт? Войти' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.auth-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 70vh;
}

.auth-card {
  width: min(520px, 100%);
}

.section-head h2 {
  margin: 0 0 6px;
  font-size: 1.8rem;
  letter-spacing: -0.03em;
}

.section-head p {
  margin: 0 0 20px;
  color: var(--muted);
  font-size: 0.95rem;
}

.role-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 24px;
  padding: 4px;
  background: var(--surface-soft);
  border-radius: 999px;
}

.role-tabs button {
  padding: 10px;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  font-weight: 700;
}

.role-tabs button.active {
  background: white;
  color: var(--accent);
  box-shadow: 0 4px 12px rgba(22, 40, 30, 0.08);
}

form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.error-banner {
  padding: 12px;
  border-radius: 12px;
  background: #fdf2f0;
  border: 1px solid #f5c6cb;
  color: var(--danger);
  font-size: 0.9rem;
  font-weight: 600;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
}

.actions .btn {
  width: 100%;
}
</style>
