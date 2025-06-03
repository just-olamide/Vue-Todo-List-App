<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ isLogin ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="auth-subtitle">
          {{ isLogin ? 'Sign in to continue' : 'Sign up to get started' }}
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Enter your email"
            :class="{ error: errors.email }"
            @input="clearError('email')"
          />
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="Enter your password"
            :class="{ error: errors.password }"
            @input="clearError('password')"
          />
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
        </div>

        <div class="form-group" v-if="!isLogin">
          <label for="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Confirm your password"
            :class="{ error: errors.confirmPassword }"
            @input="clearError('confirmPassword')"
          />
          <span class="error-message" v-if="errors.confirmPassword">{{
            errors.confirmPassword
          }}</span>
        </div>

        <div class="error-message global-error" v-if="errors.submit">
          {{ errors.submit }}
        </div>

        <button type="submit" class="submit-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ isLogin ? 'Sign In' : 'Sign Up' }}
        </button>
      </form>

      <div class="auth-footer">
        <p>
          {{ isLogin ? "Don't have an account?" : 'Already have an account?' }}
          <a href="#" @click.prevent="toggleMode">
            {{ isLogin ? 'Sign Up' : 'Sign In' }}
          </a>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isLogin = ref(true)
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const errors = ref({})

const validateForm = () => {
  errors.value = {}

  // Email validation
  if (!email.value) {
    errors.value.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email'
  }

  // Password validation
  if (!password.value) {
    errors.value.password = 'Password is required'
  } else if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters'
  }

  // Confirm password validation (for registration)
  if (!isLogin.value) {
    if (!confirmPassword.value) {
      errors.value.confirmPassword = 'Please confirm your password'
    } else if (confirmPassword.value !== password.value) {
      errors.value.confirmPassword = 'Passwords do not match'
    }
  }

  return Object.keys(errors.value).length === 0
}

const clearError = (field) => {
  if (errors.value[field]) {
    errors.value[field] = ''
  }
  if (errors.value.submit) {
    errors.value.submit = ''
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  loading.value = true
  errors.value.submit = ''

  try {
    if (isLogin.value) {
      await authStore.login(email.value, password.value)
    } else {
      await authStore.register(email.value, password.value)
    }

    // Redirect to the intended destination or tasks page
    const redirectPath = route.query.redirect || '/tasks'
    router.push(redirectPath)
  } catch (error) {
    errors.value.submit = error.message
  } finally {
    loading.value = false
  }
}

const toggleMode = () => {
  isLogin.value = !isLogin.value
  errors.value = {}
  // Clear form fields when switching modes
  if (!isLogin.value) {
    confirmPassword.value = ''
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
}

.auth-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  color: #333;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.auth-subtitle {
  color: #666;
  font-size: 1rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  color: #555;
  font-size: 0.9rem;
  font-weight: 500;
}

input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #4caf50;
}

input.error {
  border-color: #ff4444;
}

.error-message {
  color: #ff4444;
  font-size: 0.8rem;
}

.global-error {
  text-align: center;
  margin-top: 0.5rem;
}

.submit-btn {
  background: #4caf50;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover {
  background: #45a049;
}

.submit-btn:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 3px solid #ffffff;
  border-top: 3px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.auth-footer {
  margin-top: 2rem;
  text-align: center;
  color: #666;
}

.auth-footer a {
  color: #4caf50;
  text-decoration: none;
  font-weight: 500;
  margin-left: 0.5rem;
}

.auth-footer a:hover {
  text-decoration: underline;
}
</style>