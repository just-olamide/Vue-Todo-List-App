import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Tasks from '../views/Tasks.vue'
import History from '../views/History.vue'
import Login from '../views/Login.vue'
import Completed from '../views/Completed.vue'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/tasks',
  },
  {
    path: '/tasks',
    name: 'Tasks',
    component: Tasks,
    meta: { requiresAuth: true },
    // This route will show the Tasks component
    // If the component is commented out, it will show the test message
    // The route still works because Vue's router system is independent of component content
  },
  {
    path: '/completed',
    name: 'Completed',
    component: Completed,
    meta: { requiresAuth: true },
  },
  {
    path: '/history',
    name: 'history',
    component: History,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { guest: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Ensure auth state is checked
  await authStore.checkAuth()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // Save the intended destination
    next({
      name: 'Login',
      query: { redirect: to.fullPath },
    })
  } else if (to.meta.guest && authStore.isAuthenticated) {
    next({ name: 'Tasks' })
  } else {
    next()
  }
})

export default router