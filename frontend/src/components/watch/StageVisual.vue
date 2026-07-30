<script setup lang="ts">
defineProps<{
  icon: string
  stageTitle: string
}>()
</script>

<template>
  <div class="stage-visual">
    <div class="visual-icon">{{ icon }}</div>
    <span class="stage-badge">{{ stageTitle }}</span>
  </div>
</template>

<style scoped>
.stage-visual {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  background:
    radial-gradient(circle at center bottom, rgba(47, 107, 79, 0.18), transparent 55%),
    var(--surface-soft);
  margin-bottom: 20px;
  padding: 24px;
  position: relative;
}

.visual-icon {
  font-size: 7.5rem;
  line-height: 1;
  filter: drop-shadow(0 12px 24px rgba(22, 40, 30, 0.15));
  transition: transform 0.3s ease;
}

.visual-icon:hover {
  transform: scale(1.08);
}

.stage-badge {
  position: absolute;
  bottom: 16px;
  padding: 6px 14px;
  border-radius: 999px;
  background: white;
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(22, 40, 30, 0.08);
}
</style>
