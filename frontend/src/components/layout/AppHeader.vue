<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const user = computed(() => authStore.user)

async function handleLogout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <header class="topbar">
    <router-link to="/" class="brand">
      <div class="brand-mark">🌱</div>
      <span class="brand-title">FloraAtlas</span>
    </router-link>

    <nav class="nav" aria-label="Основная навигация">
      <router-link to="/" exact-active-class="active">Главная</router-link>
      <router-link to="/catalog" active-class="active">Растения</router-link>

      <template v-if="authStore.isAuthenticated">
        <router-link v-if="!authStore.isTeacher" to="/my-plants" active-class="active">Мои растения</router-link>
        <router-link v-if="authStore.isTeacher" to="/teacher" active-class="active">Преподаватель</router-link>

        <div class="user-badge">
          <span class="user-name">{{ user?.name }}</span>
          <span class="user-role">{{ user?.role === 'teacher' ? 'Преподаватель' : 'Студент' }}</span>
          <button class="logout-btn" title="Выйти" @click="handleLogout">🚪</button>
        </div>
      </template>

      <template v-else>
        <router-link to="/auth" class="btn primary-link" active-class="active">
          Войти или зарегистрироваться
        </router-link>
      </template>
    </nav>
  </header>
</template>

<style scoped>
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px clamp(16px, 4vw, 56px);
  background: rgba(246, 247, 243, 0.92);
  backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(220, 227, 216, 0.7);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  text-decoration: none;
  color: var(--text);
  letter-spacing: -0.02em;
  font-size: 1.25rem;
}

.brand-mark {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--accent);
  color: white;
  font-size: 1.2rem;
}

.nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
}

.nav a {
  padding: 9px 14px;
  border-radius: 999px;
  background: transparent;
  color: var(--muted);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.nav a:hover,
.nav a.active {
  background: var(--accent-weak);
  color: var(--accent);
}

.nav a.primary-link {
  background: var(--accent);
  color: white;
}

.nav a.primary-link:hover {
  background: var(--accent-hover);
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: var(--surface-soft);
  border: 1px solid var(--line);
  border-radius: 999px;
  font-size: 0.88rem;
  margin-left: 8px;
}

.user-name {
  font-weight: 700;
  color: var(--text);
}

.user-role {
  font-size: 0.75rem;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-weak);
  color: var(--accent);
  font-weight: 600;
}

.logout-btn {
  background: transparent;
  padding: 4px;
  font-size: 1rem;
  border-radius: 50%;
}

.logout-btn:hover {
  background: rgba(184, 81, 66, 0.15);
}

@media (max-width: 768px) {
  .topbar {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
