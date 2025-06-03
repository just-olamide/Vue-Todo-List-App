<template>
  <div class="completed">
    <div class="completed-header">
      <h2>Completed Tasks</h2>
      <div class="stats">
        <div class="stat-item">
          <span class="stat-label">Completion Rate</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${completionRate}%` }"></div>
          </div>
          <span class="stat-value">{{ completionRate }}%</span>
        </div>
      </div>
    </div>

    <div class="completed-list">
      <div v-if="completedTasks.length === 0" class="no-tasks">No completed tasks yet!</div>
      <div v-for="task in completedTasks" :key="task.id" class="completed-item">
        <div class="task-content">
          <span class="task-text">{{ task.text }}</span>
          <span class="completion-date"> Completed on {{ formatDate(task.completedAt) }} </span>
        </div>
        <button @click="deleteTask(task.id)" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const tasks = ref([])

// Load tasks from localStorage
const loadTasks = () => {
  const savedTasks = localStorage.getItem('tasks')
  if (savedTasks) {
    tasks.value = JSON.parse(savedTasks)
  }
}

// Computed properties
const completedTasks = computed(() =>
  tasks.value.filter((task) => task.completed).sort((a, b) => b.completedAt - a.completedAt),
)

const completionRate = computed(() => {
  if (tasks.value.length === 0) return 0
  return Math.round((completedTasks.value.length / tasks.value.length) * 100)
})

// Methods
const deleteTask = (id) => {
  tasks.value = tasks.value.filter((t) => t.id !== id)
  localStorage.setItem('tasks', JSON.stringify(tasks.value))
}

const formatDate = (timestamp) => {
  return new Date(timestamp).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Load tasks when component is mounted
onMounted(() => {
  loadTasks()
})
</script>

<style scoped>
.completed {
  max-width: 800px;
  margin: 0 auto;
}

.completed-header {
  margin-bottom: 2rem;
}

.stats {
  margin-top: 1rem;
}

.stat-item {
  background-color: white;
  padding: 1rem;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.stat-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.progress-bar {
  height: 8px;
  background-color: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.progress-fill {
  height: 100%;
  background-color: #4caf50;
  transition: width 0.3s ease;
}

.stat-value {
  font-weight: bold;
  color: #4caf50;
}

.completed-list {
  margin-top: 2rem;
}

.completed-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: white;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.task-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.task-text {
  font-size: 1.1rem;
  color: #333;
}

.completion-date {
  font-size: 0.9rem;
  color: #666;
}

.delete-btn {
  padding: 0.5rem 1rem;
  background-color: #ff4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.delete-btn:hover {
  background-color: #cc0000;
}

.no-tasks {
  text-align: center;
  padding: 2rem;
  color: #666;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>