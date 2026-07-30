<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import heroSpruce from '@/assets/hero-spruce.png'

const router = useRouter()
const authStore = useAuthStore()

const heroRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

const tiltX = ref(0)
const tiltY = ref(0)

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  swayAmp: number
  swayPhase: number
  type: 'needle' | 'spore'
  maxAlpha: number
  angle: number
  rotSpeed: number
}

let animId: number | null = null
const particles: Particle[] = []

function initParticles(width: number, height: number) {
  particles.length = 0
  const count = 40
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.8 + 1.2,
      speedY: Math.random() * 0.7 + 0.3,
      swayAmp: Math.random() * 0.6 + 0.2,
      swayPhase: Math.random() * Math.PI * 2,
      type: Math.random() > 0.45 ? 'needle' : 'spore',
      maxAlpha: Math.random() * 0.6 + 0.25,
      angle: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02
    })
  }
}

function startAnimation() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const resize = () => {
    if (heroRef.value && canvas) {
      const rect = heroRef.value.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      if (particles.length === 0) {
        initParticles(canvas.width, canvas.height)
      }
    }
  }

  resize()
  window.addEventListener('resize', resize)

  const render = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const h = canvas.height
    particles.forEach(p => {
      p.y += p.speedY
      p.x += Math.sin(p.swayPhase + p.y * 0.02) * p.swayAmp
      p.angle += p.rotSpeed

      if (p.y > h + 10) {
        p.y = -10
        p.x = Math.random() * canvas.width
      }

      let alpha = p.maxAlpha
      if (p.y < 30) {
        alpha *= p.y / 30
      } else if (p.y > h - 50) {
        alpha *= (h - p.y) / 50
      }
      alpha = Math.max(0, Math.min(p.maxAlpha, alpha))

      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)

      if (p.type === 'needle') {
        ctx.fillStyle = `rgba(114, 207, 157, ${alpha})`
        ctx.fillRect(-p.size / 2, -p.size * 2, p.size * 0.6, p.size * 3.5)
      } else {
        ctx.fillStyle = `rgba(175, 235, 195, ${alpha})`
        ctx.beginPath()
        ctx.arc(0, 0, p.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })

    animId = requestAnimationFrame(render)
  }

  animId = requestAnimationFrame(render)
}

function handleMouseMove(e: MouseEvent) {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  const mouseX = (e.clientX - rect.left) / rect.width - 0.5
  const mouseY = (e.clientY - rect.top) / rect.height - 0.5

  tiltX.value = mouseX * 12
  tiltY.value = mouseY * 8
}

function handleMouseLeave() {
  tiltX.value = 0
  tiltY.value = 0
}

function navigateToAuthOrCatalog() {
  if (authStore.isAuthenticated) {
    router.push('/catalog')
  } else {
    router.push('/auth')
  }
}

onMounted(() => {
  startAnimation()
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<template>
  <div class="home-view">
    <!-- Main Hero Card Container with Parallax & Particle Canvas -->
    <div
      ref="heroRef"
      class="hero"
      @mousemove="handleMouseMove"
      @mouseleave="handleMouseLeave"
    >
      <!-- Falling Needles & Spores Particle Canvas Overlay -->
      <canvas ref="canvasRef" class="particle-canvas"></canvas>

      <!-- Hero Text Content (Left) -->
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

      <!-- Upgraded ZZZ-Style Hero Tree Visual (Right) -->
      <div
        class="hero-tree-stage"
        :style="{ transform: `translate3d(${tiltX}px, ${tiltY}px, 0)` }"
      >
        <!-- Radial Emerald Lighting Glow -->
        <div class="emerald-glow"></div>

        <!-- Realistic Base Shadow -->
        <div class="tree-ground-shadow"></div>

        <!-- Swaying & Breathing Transparent Tree Artwork -->
        <img
          :src="heroSpruce"
          alt="FloraAtlas Spruce Plant"
          class="hero-spruce-img"
        />
      </div>
    </div>

    <!-- Platform Features Grid -->
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
  position: relative;
  overflow: hidden;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 32px;
  align-items: center;
  padding: clamp(32px, 5vw, 64px);
  background:
    radial-gradient(circle at 85% 30%, rgba(47, 107, 79, 0.22), transparent 45%),
    linear-gradient(135deg, #ffffff 0%, #f4f8f5 100%);
  border: 1px solid var(--line);
  border-radius: 36px;
  box-shadow: var(--shadow-lg);
  margin-bottom: 48px;
}

.particle-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.hero-content {
  position: relative;
  z-index: 5;
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
  font-size: clamp(2.2rem, 4.8vw, 3.6rem);
  line-height: 1.1;
  letter-spacing: -0.04em;
  color: var(--text);
}

.description {
  color: var(--muted);
  font-size: 1.08rem;
  margin: 16px 0 28px;
  max-width: 640px;
  line-height: 1.55;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

/* Right Side ZZZ-Style Tree Stage */
.hero-tree-stage {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 380px;
  z-index: 4;
  transition: transform 0.15s ease-out;
}

.emerald-glow {
  position: absolute;
  width: 280px;
  height: 280px;
  border-radius: 50%;
  background: rgba(114, 207, 157, 0.28);
  filter: blur(55px);
  z-index: 1;
  pointer-events: none;
}

.tree-ground-shadow {
  position: absolute;
  bottom: 15px;
  width: 220px;
  height: 28px;
  border-radius: 50%;
  background: rgba(18, 36, 26, 0.35);
  filter: blur(10px);
  z-index: 2;
  pointer-events: none;
}

.hero-spruce-img {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 360px;
  max-height: 420px;
  object-fit: contain;
  transform-origin: bottom center;
  animation: treeSwayBreathing 6s ease-in-out infinite;
  filter: drop-shadow(0 14px 30px rgba(22, 45, 32, 0.22));
}

@keyframes treeSwayBreathing {
  0%, 100% {
    transform: rotate(-1.5deg) scale(1);
  }
  50% {
    transform: rotate(1.5deg) scale(1.025);
  }
}

.features h2 {
  font-size: 1.8rem;
  margin-bottom: 24px;
  letter-spacing: -0.03em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
}

.feature-card {
  padding: 24px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--line);
  box-shadow: var(--shadow);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 12px;
}

.feature-card h3 {
  margin: 0 0 8px;
  font-size: 1.1rem;
}

.feature-card p {
  margin: 0;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.45;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }

  .actions {
    justify-content: center;
  }

  .hero-tree-stage {
    min-height: 300px;
  }

  .hero-spruce-img {
    max-width: 280px;
  }
}
</style>
