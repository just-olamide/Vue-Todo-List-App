<template>
  <div class="mt-4">
    <h1 class="mb-4 text-primary">Dashboard</h1>
    
    <!-- Loading State -->
    <div v-if="taskStore.loading" class="text-center">
      <b-spinner variant="primary" label="Loading..."></b-spinner>
    </div>

    <!-- Error State -->
    <b-alert
      v-else-if="taskStore.error"
      show
      variant="danger"
      class="mb-4"
    >
      {{ taskStore.error }}
    </b-alert>

    <!-- Content -->
    <template v-else>
      <b-row>
        <b-col md="4" class="mb-4">
          <b-card title="Total Tasks" class="stat-card shadow-sm">
            <p class="stat-value">{{ totalTasks }}</p>
          </b-card>
        </b-col>
        <b-col md="4" class="mb-4">
          <b-card title="Pending Tasks" class="stat-card shadow-sm">
            <p class="stat-value">{{ pendingTasks.length }}</p>
          </b-card>
        </b-col>
        <b-col md="4" class="mb-4">
          <b-card title="Completed Tasks" class="stat-card shadow-sm">
            <p class="stat-value">{{ completedTasks.length }}</p>
          </b-card>
        </b-col>
      </b-row>

      <b-card title="Task Analytics" header-class="chart-header" class="mt-4 shadow-sm">
        <div style="height: 300px">
          <BarChart
            v-if="chartData"
            :chart-data="chartData"
            :options="chartOptions"
          />
        </div>
      </b-card>
    </template>
  </div>
</template>

<script>
import { useTaskStore } from '../stores/tasks'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

export default {
  name: 'Dashboard',
  components: { BarChart: Bar },
  setup() {
    const taskStore = useTaskStore()
    return { taskStore }
  },
  computed: {
    totalTasks() {
      return this.taskStore.totalTasks
    },
    pendingTasks() {
      return this.taskStore.pendingTasks
    },
    completedTasks() {
      return this.taskStore.completedTasks
    },
    chartData() {
      return {
        labels: ['Pending', 'Completed'],
        datasets: [
          {
            label: 'Tasks by Status',
            backgroundColor: ['#007bff', '#28a745'],
            data: [this.pendingTasks.length, this.completedTasks.length]
          }
        ]
      }
    },
    chartOptions() {
      return {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    }
  },
  mounted() {
    this.taskStore.loadTasks()
  },
  watch: {
    // Watch for changes in tasks
    'taskStore.tasks': {
      handler() {
        // Force chart update when tasks change
        this.$forceUpdate()
      },
      deep: true
    }
  }
}
</script>

<style scoped>
.stat-card {
  border-radius: 10px;
  text-align: center;
  background: #ffffff;
}

.stat-card .card-title {
  font-size: 1.2rem;
  color: #343a40;
}

.stat-value {
  font-size: 2.5rem;
  font-weight: 600;
  color: #007bff;
  margin: 0;
}

.chart-header {
  background-color: #f1f3f5;
  font-size: 1.3rem;
  font-weight: 600;
  border-radius: 10px 10px 0 0;
  padding: 1.2rem;
}
</style>