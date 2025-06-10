<template>
  <div class="mt-4">
    <h1 class="mb-4 text-primary">Task History</h1>


    <div v-if="taskStore.loading" class="text-center">
      <b-spinner variant="primary" label="Loading..."></b-spinner>
    </div>

    <!-- Error State -->
    <b-alert v-else-if="taskStore.error" show variant="danger" class="mb-4">
      {{ taskStore.error }}
    </b-alert>

    <!-- Content -->
    <b-card v-else class="shadow-sm">
      <b-tabs content-class="mt-3">
        <b-tab title="All Tasks" active>
          <b-list-group v-if="taskStore.tasks.length > 0">
            <b-list-group-item
              v-for="task in taskStore.tasks"
              :key="task.id"
              :class="{ 'text-decoration-line-through': task.completed }"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ task.text }}</h6>
                  <small class="text-muted">
                    Status: {{ task.completed ? 'Completed' : 'Pending' }}
                  </small>
                </div>
                <b-button
                  variant="outline-danger"
                  size="sm"
                  @click="() => deleteTask(task.id)"
                  :disabled="taskStore.loading"
                >
                  Delete
                </b-button>
              </div>
            </b-list-group-item>
          </b-list-group>
          <div v-else class="text-center p-4">
            <p class="text-muted">No tasks available</p>
          </div>
        </b-tab>

        <b-tab title="Completed">
          <b-list-group v-if="taskStore.completedTasks.length > 0">
            <b-list-group-item
              v-for="task in taskStore.completedTasks"
              :key="task.id"
              class="text-decoration-line-through"
            >
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ task.text }}</h6>
                  <small class="text-muted">Completed</small>
                </div>
                <b-button
                  variant="outline-danger"
                  size="sm"
                  @click="() => deleteTask(task.id)"
                  :disabled="taskStore.loading"
                >
                  Delete
                </b-button>
              </div>
            </b-list-group-item>
          </b-list-group>
          <div v-else class="text-center p-4">
            <p class="text-muted">No completed tasks</p>
          </div>
        </b-tab>

        <b-tab title="Statistics">
          <b-card class="mt-3">
            <div class="row text-center">
              <div class="col">
                <h3>{{ taskStore.totalTasks }}</h3>
                <p class="text-muted">Total Tasks</p>
              </div>
              <div class="col">
                <h3>{{ taskStore.pendingTasks.length }}</h3>
                <p class="text-muted">Pending Tasks</p>
              </div>
              <div class="col">
                <h3>{{ taskStore.completedTasks.length }}</h3>
                <p class="text-muted">Completed Tasks</p>
              </div>
            </div>
            <div class="mt-4">
              <h5>Completion Rate</h5>
              <b-progress
                :value="completionRate"
                :max="100"
                show-progress
                animated
                class="mt-2"
              ></b-progress>
              <small class="text-muted mt-2 d-block">
                {{ completionRate }}% of tasks completed
              </small>
            </div>
          </b-card>
        </b-tab>
      </b-tabs>
    </b-card>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/tasks'

const taskStore = useTaskStore()

// Compute completion rate
const completionRate = computed(() => {
  if (taskStore.totalTasks === 0) return 0
  return Math.round((taskStore.completedTasks.length / taskStore.totalTasks) * 100)
})

onMounted(() => {
  taskStore.loadTasks()
})

const deleteTask = async (id) => {
  await taskStore.deleteTask(id)
}
</script>

<style scoped>
.text-decoration-line-through {
  text-decoration: line-through;
  color: #6c757d;
}

.list-group-item {
  padding: 1rem;
}

.progress {
  height: 1.5rem;
}
</style>