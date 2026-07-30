<script setup lang="ts"></script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-brand">🌱 <strong>FloraAtlas</strong> — Образовательно-интерактивная платформа</div>
      <div class="footer-copy">Изучение жизненного цикла растений через пошаговые наблюдения и мини-игры. &copy; 2026</div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--line);
  background: var(--surface);
  padding: 24px 16px;
  color: var(--muted);
  font-size: 0.9rem;
  margin-top: auto;
}

.footer-container {
  width: min(1120px, calc(100% - 32px));
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.footer-brand strong {
  color: var(--accent);
}
</style>
