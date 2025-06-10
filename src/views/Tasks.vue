<template>
  <div class="tasks-container">
    <div class="tasks-header">
      <div class="header-content">
        <h1>My Tasks</h1>
        <div class="header-actions">
          <button
            @click="showCompletedTasks = !showCompletedTasks"
            class="action-btn"
            :class="{ active: showCompletedTasks }"
          >
            <span class="icon">👁</span>
            {{ showCompletedTasks ? 'Hide Completed' : 'Show Completed' }}
          </button>
          <button
            @click="sortByDate = !sortByDate"
            class="action-btn"
            :class="{ active: sortByDate }"
          >
            <span class="icon">📅</span>
            {{ sortByDate ? 'Newest First' : 'Oldest First' }}
          </button>
        </div>
      </div>
      <form @submit.prevent="addTask" class="add-task-form">
        <div class="input-group">
          <input
            v-model="newTask"
            type="text"
            placeholder="Add a new task..."
            class="task-input"
            :disabled="loading"
          />
          <input
            v-model="taskDueDate"
            type="datetime-local"
            class="date-input"
            :disabled="loading"
          />
        </div>
        <button type="submit" class="add-btn" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          <span class="icon">➕</span>
          Add Task
        </button>
      </form>
    </div>

    <div class="tasks-filters">
      <button
        v-for="filter in filters"
        :key="filter.value"
        @click="currentFilter = filter.value"
        :class="['filter-btn', { active: currentFilter === filter.value }]"
      >
        <span class="icon">{{ filter.icon }}</span>
        {{ filter.label }}
        <span class="count">({{ getFilteredTasks(filter.value).length }})</span>
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading tasks...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadTasks" class="retry-btn">Retry</button>
    </div>

    <div v-else class="tasks-list">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p>No tasks found</p>
        <p class="empty-subtitle">Add a task to get started!</p>
      </div>
      <transition-group name="task-list" tag="div">
        <div
          v-for="task in sortedTasks"
          :key="task.id"
          class="task-item"
          :class="{
            completed: task.completed,
            'due-soon': isDueSoon(task),
            overdue: isOverdue(task),
          }"
        >
          <div class="task-content">
            <input
              type="checkbox"
              :checked="task.completed"
              @change="toggleTask(task)"
              :disabled="loading"
              class="task-checkbox"
            />
            <div class="task-details">
              <span class="task-text">{{ task.text }}</span>
              <div class="task-meta">
                <span class="task-date">
                  <span class="icon">📅</span>
                  {{ formatDate(task.createdAt) }}
                </span>
                <span
                  v-if="task.dueDate"
                  class="task-due"
                  :class="{ 'due-soon': isDueSoon(task), overdue: isOverdue(task) }"
                >
                  <span class="icon">⏰</span>
                  Due: {{ formatDate(task.dueDate) }}
                </span>
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button @click="editTask(task)" class="action-btn" title="Edit task">
              <span class="icon">✏</span>
            </button>
            <button @click="deleteTask(task)" class="action-btn delete" title="Delete task">
              <span class="icon">🗑</span>
            </button>
          </div>
        </div>
      </transition-group>
    </div>

    <div class="tasks-summary">
      <div class="summary-item">
        <span class="icon">📋</span>
        <div class="summary-content">
          <span class="label">Total Tasks</span>
          <span class="value">{{ tasks.length }}</span>
        </div>
      </div>
      <div class="summary-item">
        <span class="icon">⏳</span>
        <div class="summary-content">
          <span class="label">Pending</span>
          <span class="value">{{ pendingTasks.length }}</span>
        </div>
      </div>
      <div class="summary-item">
        <span class="icon">✅</span>
        <div class="summary-content">
          <span class="label">Completed</span>
          <span class="value">{{ completedTasks.length }}</span>
        </div>
      </div>
      <div class="summary-item">
        <span class="icon">🎯</span>
        <div class="summary-content">
          <span class="label">Completion Rate</span>
          <span class="value">{{ completionRate }}%</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const tasks = ref([])
const newTask = ref('')
const taskDueDate = ref('')
const loading = ref(false)
const error = ref(null)
const currentFilter = ref('all')
const showCompletedTasks = ref(true)
const sortByDate = ref(true)

const filters = [
  { label: 'All', value: 'all', icon: '📋' },
  { label: 'Pending', value: 'pending', icon: '⏳' },
  { label: 'Completed', value: 'completed', icon: '✅' },
  { label: 'Due Soon', value: 'due-soon', icon: '⏰' },
]

const filteredTasks = computed(() => {
  let filtered = getFilteredTasks(currentFilter.value)
  if (!showCompletedTasks.value) {
    filtered = filtered.filter((task) => !task.completed)
  }
  return filtered
})

const sortedTasks = computed(() => {
  return [...filteredTasks.value].sort((a, b) => {
    const dateA = new Date(sortByDate.value ? a.createdAt : a.dueDate || a.createdAt)
    const dateB = new Date(sortByDate.value ? b.createdAt : b.dueDate || b.createdAt)
    return sortByDate.value ? dateB - dateA : dateA - dateB
  })
})

const pendingTasks = computed(() => {
  return tasks.value.filter((task) => !task.completed)
})

const completedTasks = computed(() => {
  return tasks.value.filter((task) => task.completed)
})

const completionRate = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedTasks.value.length / tasks.value.length) * 100)
})

const getFilteredTasks = (filter) => {
  switch (filter) {
    case 'pending':
      return tasks.value.filter((task) => !task.completed)
    case 'completed':
      return tasks.value.filter((task) => task.completed)
    case 'due-soon':
      return tasks.value.filter((task) => isDueSoon(task))
    default:
      return tasks.value
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

const isDueSoon = (task) => {
  if (!task.dueDate) return false
  const dueDate = new Date(task.dueDate)
  const now = new Date()
  const diffHours = (dueDate - now) / (1000 * 60 * 60)
  return diffHours > 0 && diffHours <= 24
}

const isOverdue = (task) => {
  if (!task.dueDate) return false
  const dueDate = new Date(task.dueDate)
  const now = new Date()
  return dueDate < now && !task.completed
}

const loadTasks = async () => {
  loading.value = true
  error.value = null
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || []
    tasks.value = storedTasks.filter((task) => task.userId === authStore.currentUser.id)
  } catch (err) {
    error.value = 'Failed to load tasks'
    console.error('Error loading tasks:', err)
  } finally {
    loading.value = false
  }
}

const addTask = async () => {
  if (!newTask.value.trim()) return

  loading.value = true
  try {
    const task = {
      id: Date.now(),
      text: newTask.value.trim(),
      completed: false,
      userId: authStore.currentUser.id,
      createdAt: new Date().toISOString(),
      dueDate: taskDueDate.value || null,
    }

    tasks.value.unshift(task)
    saveTasks()
    newTask.value = ''
    taskDueDate.value = ''
  } catch (err) {
    error.value = 'Failed to add task'
    console.error('Error adding task:', err)
  } finally {
    loading.value = false
  }
}

const editTask = (task) => {
  console.log('Edit task:', task)
}

const toggleTask = async (task) => {
  loading.value = true
  try {
    task.completed = !task.completed
    saveTasks()
  } catch (err) {
    error.value = 'Failed to update task'
    console.error('Error updating task:', err)
  } finally {
    loading.value = false
  }
}

const deleteTask = async (task) => {
  loading.value = true
  try {
    tasks.value = tasks.value.filter((t) => t.id !== task.id)
    saveTasks()
  } catch (err) {
    error.value = 'Failed to delete task'
    console.error('Error deleting task:', err)
  } finally {
    loading.value = false
  }
}

const saveTasks = () => {
  const allTasks = JSON.parse(localStorage.getItem('tasks')) || []
  const otherTasks = allTasks.filter((task) => task.userId !== authStore.currentUser.id)
  localStorage.setItem('tasks', JSON.stringify([...otherTasks, ...tasks.value]))
}

onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.tasks-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.tasks-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background-color: #f5f5f5;
}

.action-btn.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.add-task-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.input-group {
  flex: 1;
  display: flex;
  gap: 1rem;
  min-width: 280px;
}

.task-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.date-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.add-btn:hover {
  background-color: #45a049;
}

.tasks-filters {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
}

.filter-btn {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: none;
  cursor: pointer;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  background-color: #f5f5f5;
}

.filter-btn.active {
  background-color: #4caf50;
  color: white;
  border-color: #4caf50;
}

.count {
  font-size: 0.8rem;
  opacity: 0.8;
}

.tasks-list {
  margin-bottom: 2rem;
}

.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.task-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  flex-wrap: wrap;
  gap: 1rem;
}

.task-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.task-item.completed {
  opacity: 0.7;
}

.task-item.due-soon {
  border-left: 4px solid #ffa726;
}

.task-item.overdue {
  border-left: 4px solid #ef5350;
}

.task-content {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex: 1;
  min-width: 200px;
}

.task-checkbox {
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.task-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-text {
  font-size: 1rem;
  color: #333;
}

.task-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #666;
  flex-wrap: wrap;
}

.task-date,
.task-due {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.task-due.due-soon {
  color: #ffa726;
}

.task-due.overdue {
  color: #ef5350;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: #999;
}

.task-actions {
  display: flex;
  gap: 0.5rem;
}

.task-actions .action-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.task-actions .action-btn:hover {
  opacity: 1;
}

.task-actions .action-btn.delete:hover {
  color: #ef5350;
}

.tasks-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.summary-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.icon {
  font-size: 1.2rem;
}

.label {
  font-size: 0.9rem;
  color: #666;
}

.value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.loading-state,
.error-state,
.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-subtitle {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #f3f3f3;
  border-top: 2px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  display: inline-block;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-btn:hover {
  background-color: #45a049;
}

@media (max-width: 768px) {
  .tasks-container {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .header-actions {
    flex-wrap: wrap;
    justify-content: center;
  }

  .action-btn {
    flex: 1;
    justify-content: center;
    min-width: 140px;
  }

  .add-task-form {
    flex-direction: column;
  }

  .input-group {
    flex-direction: column;
    width: 100%;
  }

  .date-input {
    width: 100%;
  }

  .add-btn {
    width: 100%;
    justify-content: center;
  }

  .tasks-filters {
    justify-content: center;
  }

  .filter-btn {
    flex: 1;
    min-width: 120px;
    justify-content: center;
  }

  .task-item {
    padding: 0.75rem;
  }

  .task-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .task-meta {
    flex-direction: column;
    gap: 0.5rem;
  }

  .task-actions {
    width: 100%;
    justify-content: flex-end;
  }

  .tasks-summary {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    padding: 1rem;
  }

  .summary-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.5rem;
  }

  .summary-content {
    align-items: center;
  }
}

@media (max-width: 480px) {
  .tasks-container {
    padding: 0.75rem;
  }

  .header-actions {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }

  .filter-btn {
    width: 100%;
  }

  .tasks-summary {
    grid-template-columns: 1fr;
  }

  .task-item {
    padding: 0.5rem;
  }

  .task-text {
    font-size: 0.9rem;
  }

  .task-meta {
    font-size: 0.75rem;
  }

  .task-actions .action-btn {
    padding: 0.4rem;
  }
}

@media (max-width: 360px) {
  .tasks-container {
    padding: 0.5rem;
  }

  .task-item {
    margin-bottom: 0.25rem;
  }

  .task-checkbox {
    width: 16px;
    height: 16px;
  }

  .icon {
    font-size: 1rem;
  }

  .label {
    font-size: 0.8rem;
  }

  .value {
    font-size: 1rem;
  }
}
</style>