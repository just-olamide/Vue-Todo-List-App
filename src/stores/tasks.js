import { defineStore } from 'pinia'

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: JSON.parse(localStorage.getItem('tasks')) || [], // Start with empty array
    loading: false,
    error: null
  }),

  getters: {
    totalTasks: (state) => state.tasks.length,
    pendingTasks: (state) => state.tasks.filter(task => !task.completed),
    completedTasks: (state) => state.tasks.filter(task => task.completed)
  },

  actions: {
    async loadTasks() {
      this.loading = true
      this.error = null
      try {
        // Load tasks from localStorage only
        const savedTasks = localStorage.getItem('tasks')
        if (savedTasks) {
          this.tasks = JSON.parse(savedTasks)
        }
      } catch (error) {
        this.error = error.message || 'Failed to load tasks'
        console.error('Error loading tasks:', error)
      } finally {
        this.loading = false
      }
    },

    saveTasks() {
      localStorage.setItem('tasks', JSON.stringify(this.tasks))
    },

    async addTask(task) {
      this.loading = true
      this.error = null
      try {
        const newTask = {
          id: Date.now(),
          ...task,
          completed: false
        }
        this.tasks.push(newTask)
        this.saveTasks()
        return newTask
      } catch (error) {
        this.error = error.message || 'Failed to add task'
        console.error('Error adding task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async toggleTask(id) {
      this.loading = true
      this.error = null
      try {
        const task = this.tasks.find(task => task.id === id)
        if (task) {
          task.completed = !task.completed
          this.saveTasks()
        }
      } catch (error) {
        this.error = error.message || 'Failed to toggle task'
        console.error('Error toggling task:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteTask(id) {
      this.loading = true
      this.error = null
      try {
        this.tasks = this.tasks.filter(task => task.id !== id)
        this.saveTasks()
      } catch (error) {
        this.error = error.message || 'Failed to delete task'
        console.error('Error deleting task:', error)
        throw error
      } finally {
        this.loading = false
      }
    }
  }
})