import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const user = JSON.parse(localStorage.getItem('user'))
    const token = localStorage.getItem('token')
    console.log('Initial auth state:', { user, token })
    return {
      user,
      token,
      loading: false,
      error: null,
      registeredUsers: JSON.parse(localStorage.getItem('registeredUsers')) || [],
    }
  },

  getters: {
    isAuthenticated: (state) => {
      const isAuth = !!state.token && !!state.user
      console.log('isAuthenticated check:', { isAuth, token: state.token, user: state.user })
      return isAuth
    },
    currentUser: (state) => state.user,
  },

  actions: {
    async login(email, password) {
      console.log('Login attempt:', { email })
      this.loading = true
      this.error = null
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if user exists and password matches
        const user = this.registeredUsers.find((u) => u.email === email)

        if (!user) {
          throw new Error('User not found')
        }

        if (user.password !== password) {
          throw new Error('Invalid password')
        }

        const token = 'demo-token-' + Math.random()
        this.token = token
        this.user = { email: user.email, id: user.id }

        localStorage.setItem('token', token)
        localStorage.setItem('user', JSON.stringify(this.user))

        console.log('Login successful:', { user: this.user, token })
        return true
      } catch (error) {
        console.error('Login error:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async register(email, password) {
      console.log('Register attempt:', { email })
      this.loading = true
      this.error = null
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Check if email is already registered
        if (this.registeredUsers.some((u) => u.email === email)) {
          throw new Error('Email already registered')
        }

        // Create new user
        const newUser = {
          id: Date.now(),
          email,
          password,
          createdAt: new Date().toISOString(),
        }

        // Add to registered users
        this.registeredUsers.push(newUser)
        localStorage.setItem('registeredUsers', JSON.stringify(this.registeredUsers))

        // Automatically log in after registration
        await this.login(email, password)

        console.log('Registration successful:', { user: this.user })
        return true
      } catch (error) {
        console.error('Registration error:', error)
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async logout() {
      console.log('Logout attempt')
      try {
        // Clear auth state
        this.token = null
        this.user = null

        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')

        console.log('Logout successful')
        return true
      } catch (error) {
        console.error('Logout error:', error)
        throw error
      }
    },

    async checkAuth() {
      console.log('Checking auth state')
      try {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')

        console.log('Auth check:', { token, user })

        if (token && user) {
          const parsedUser = JSON.parse(user)
          // Verify user still exists in registered users
          const userExists = this.registeredUsers.some((u) => u.email === parsedUser.email)

          if (userExists) {
            this.token = token
            this.user = parsedUser
            console.log('Auth check successful:', { user: this.user })
          } else {
            console.log('User no longer exists in registered users')
            await this.logout()
          }
        } else {
          console.log('No token or user found')
          await this.logout()
        }
      } catch (error) {
        console.error('Auth check error:', error)
        await this.logout()
      }
    },
  },
})