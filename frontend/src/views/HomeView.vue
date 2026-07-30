<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

function navigateToAuthOrCatalog() {
  if (authStore.isAuthenticated) {
    router.push('/catalog')
  } else {
    router.push('/auth')
  }
}
</script>

<template>
  <div class="home-view">
    <div class="hero">
      <div class="hero-content">
        <p class="eyebrow">Учебно-интерактивная платформа</p>
        <h1>Вырастите растение шаг за шагом в FloraAtlas</h1>
        <p class="description">
          Изучайте строение, этапы развития, географию распространения,
          условия роста, способы ухода и защиты растений через короткие
          образовательные задания и увлекательные мини-игры.
        </p>
        <div class="actions">
          <button class="btn" @click="navigateToAuthOrCatalog">
            {{ authStore.isAuthenticated ? 'Перейти в каталог' : 'Войти или зарегистрироваться' }}
          </button>
          <router-link to="/catalog" class="btn secondary">Открыть список растений</router-link>
        </div>
      </div>

      <div class="visual-card" aria-label="Краткая статистика растения">
        <div class="plant-illustration">🌲</div>
        <div class="metrics">
          <div class="metric">
            <strong>6</strong>
            <span>этапов</span>
          </div>
          <div class="metric">
            <strong>100</strong>
            <span>здоровье</span>
          </div>
          <div class="metric">
            <strong>4</strong>
            <span>растения</span>
          </div>
        </div>
      </div>
    </div>

    <section class="features">
      <h2>Особенности платформы</h2>
      <div class="features-grid">
        <div class="feature-card">
          <div class="feature-icon">🔍</div>
          <h3>Пошаговые наблюдения</h3>
          <p>Каждый этап жизни растения содержит теоретический контент и интерактивную визуализацию.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🎮</div>
          <h3>Мини-игры и события</h3>
          <p>Закрепляйте знания через тесты, кроссворды, классификации и соответствия.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">🩺</div>
          <h3>Система здоровья и бонусов</h3>
          <p>Неверный ответ снижает здоровье растения, а успешное выполнение дает удобрения для восстановления.</p>
        </div>
        <div class="feature-card">
          <div class="feature-icon">👩‍🏫</div>
          <h3>Кабинет преподавателя</h3>
          <p>Инструменты контроля прогресса студентов и управления учебными материалами.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(280px, 0.9fr);
  gap: 28px;
  align-items: center;
  padding: clamp(28px, 5vw, 56px);
  background:
    radial-gradient(circle at 80% 20%, rgba(47, 107, 79, 0.16), transparent 34%),
    var(--surface);
  border: 1px solid var(--line);
  border-radius: 32px;
  box-shadow: var(--shadow);
  margin-bottom: 48px;
}

.eyebrow {
  margin: 0 0 12px;
  color: var(--accent);
  font-weight: 700;
  font-size: 0.88rem;
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

h1 {
  margin: 0;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
}

.description {
  color: var(--muted);
  font-size: 1.08rem;
  margin: 16px 0 28px;
  max-width: 640px;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.visual-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px;
  border-radius: 24px;
  background: var(--surface-soft);
  border: 1px solid var(--line);
}

.plant-illustration {
  font-size: 7rem;
  line-height: 1;
  margin-bottom: 24px;
}

.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  width: 100%;
}

.metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px;
  border-radius: 16px;
  background: white;
  border: 1px solid var(--line);
}

.metric strong {
  font-size: 1.6rem;
  color: var(--accent);
}

.metric span {
  font-size: 0.8rem;
  color: var(--muted);
}

.features h2 {
  font-size: 1.8rem;
  letter-spacing: -0.03em;
  margin-bottom: 24px;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 24px;
  border-radius: 20px;
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
}

.feature-icon {
  font-size: 2.2rem;
  margin-bottom: 12px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 1.15rem;
}

.feature-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.95rem;
}

@media (max-width: 840px) {
  .hero {
    grid-template-columns: 1fr;
  }
}
</style>
