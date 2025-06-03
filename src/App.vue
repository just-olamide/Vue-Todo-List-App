<template>
  <div class="app">
    <nav class="navbar">
      <div class="nav-brand">My  TO-DO App</div>
      <div class="nav-content">
        <div class="nav-links" v-if="authStore.isAuthenticated">
          <router-link to="/tasks" class="nav-link">Tasks</router-link>
          <router-link to="/completed" class="nav-link">Completed</router-link>
          <button @click="handleLogout" class="nav-link logout-btn">
            <span class="menu-icon">🚪</span>
            Sign Out
          </button>
        </div>
        <div class="user-menu" v-if="authStore.isAuthenticated">
          <div class="user-info" @click="toggleUserMenu">
            <div class="user-avatar">
              {{ authStore.currentUser?.email.charAt(0).toUpperCase() }}
            </div>
            <span class="user-email">{{ authStore.currentUser?.email }}</span>
            <span class="menu-arrow" :class="{ open: showUserMenu }">▼</span>
          </div>
          <div class="dropdown-menu" v-show="showUserMenu" @click.stop>
            <div class="menu-header">
              <div class="menu-avatar">
                {{ authStore.currentUser?.email.charAt(0).toUpperCase() }}
              </div>
              <div class="menu-user-info">
                <span class="menu-email">{{ authStore.currentUser?.email }}</span>
                <span class="menu-label">Signed in</span>
              </div>
            </div>
            <div class="menu-divider"></div>
            <button @click="handleLogout" class="menu-item logout-btn">
              <span class="menu-icon">🚪</span>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from './stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const showUserMenu = ref(false)

// Watch for authentication changes
watch(
  () => authStore.isAuthenticated,
  (isAuthenticated) => {
    if (!isAuthenticated) {
      showUserMenu.value = false
    }
  },
)

// Initialize auth state when app loads
onMounted(async () => {
  console.log('App mounted, checking auth state')
  await authStore.checkAuth()
  console.log('Auth state after check:', {
    isAuthenticated: authStore.isAuthenticated,
    currentUser: authStore.currentUser,
  })
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})

const toggleUserMenu = (event) => {
  event.stopPropagation()
  console.log('Toggling user menu:', { currentState: showUserMenu.value })
  showUserMenu.value = !showUserMenu.value
}

const handleLogout = async (event) => {
  event.stopPropagation()
  console.log('Handling logout')
  try {
    await authStore.logout()
    console.log('Logout successful, redirecting to login')
    router.push('/login')
    showUserMenu.value = false
  } catch (error) {
    console.error('Logout failed:', error)
  }
}

// Close user menu when clicking outside
const handleClickOutside = (event) => {
  if (!event.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}
</script>

<style>
/* Global styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans',
    'Helvetica Neue', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

/* App layout */
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Navigation */
.navbar {
  background-color: #4caf50;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.nav-brand {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.nav-links {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.nav-link:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.menu-icon {
  font-size: 1.1rem;
}

/* User menu */
.user-menu {
  position: relative;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-email {
  color: white;
  font-size: 0.9rem;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: white;
  color: #4caf50;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.1rem;
}

.menu-arrow {
  color: white;
  font-size: 0.8rem;
  transition: transform 0.3s;
}

.menu-arrow.open {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 0.5rem);
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 240px;
  overflow: hidden;
  z-index: 1000;
  animation: slideDown 0.2s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.menu-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #f8f9fa;
}

.menu-avatar {
  width: 40px;
  height: 40px;
  background-color: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.menu-user-info {
  display: flex;
  flex-direction: column;
}

.menu-email {
  font-weight: 500;
  color: #333;
}

.menu-label {
  font-size: 0.8rem;
  color: #666;
}

.menu-divider {
  height: 1px;
  background-color: #e0e0e0;
  margin: 0.5rem 0;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: none;
  color: #333;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

/* Main content */
.main-content {
  flex: 1;
  padding: 2rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>