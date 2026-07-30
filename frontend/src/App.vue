<script setup lang="ts">
import { onMounted } from 'vue'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import VinesBackground from '@/components/ui/VinesBackground.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(() => {
  authStore.fetchCurrentUser()
})
</script>

<template>
  <VinesBackground />
  <div class="app-wrapper">
    <AppHeader />
    <main class="container">
      <router-view />
    </main>
    <AppFooter />
  </div>
</template>
