import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import HomeView from '@/views/HomeView.vue'
import AuthView from '@/views/AuthView.vue'
import CatalogView from '@/views/CatalogView.vue'
import PlantDetailView from '@/views/PlantDetailView.vue'
import MyPlantsView from '@/views/MyPlantsView.vue'
import WatchView from '@/views/WatchView.vue'
import TeacherView from '@/views/TeacherView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/auth',
      name: 'auth',
      component: AuthView
    },
    {
      path: '/catalog',
      name: 'catalog',
      component: CatalogView
    },
    {
      path: '/catalog/:id',
      name: 'plant-detail',
      component: PlantDetailView,
      props: true
    },
    {
      path: '/my-plants',
      name: 'my-plants',
      component: MyPlantsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/watch/:id',
      name: 'watch',
      component: WatchView,
      props: true,
      meta: { requiresAuth: true }
    },
    {
      path: '/teacher',
      name: 'teacher',
      component: TeacherView,
      meta: { requiresAuth: true, requiresTeacher: true }
    }
  ]
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.initialized) {
    await authStore.fetchCurrentUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next({ name: 'auth', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresTeacher && !authStore.isTeacher) {
    return next({ name: 'home' })
  }

  next()
})

export default router
