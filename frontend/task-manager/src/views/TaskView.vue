<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskList from '@/components/TaskList.vue'

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

const searchInput = ref('')

function syncStoreWithRoute() {
  taskStore.search = route.query.search || ''
  taskStore.offset = Number(route.query.offset) || 0

  if (route.query.completed === undefined) {
    taskStore.completed = null
  } else {
    taskStore.completed = Number(route.query.completed)
  }
}

function updateRoute(queryUpdates) {
  router.push({
    name: 'tasks',
    query: {
      ...route.query,
      ...queryUpdates,
    },
  })
}

function applySearch() {
  updateRoute({
    search: searchInput.value || undefined,
    offset: 0,
  })
}

function clearSearch() {
  searchInput.value = ''
  updateRoute({
    search: undefined,
    offset: 0,
  })
}

function previousPage() {
  if (taskStore.offset === 0) return
  updateRoute({
    offset: taskStore.offset - taskStore.limit,
  })
}

function nextPage() {
  updateRoute({
    offset: taskStore.offset + taskStore.limit,
  })
}

function setFilter(value) {
  updateRoute({
    completed: value === null ? undefined : value,
    offset: 0,
  })
}

function goToCreate() {
  router.push({ name: 'task-create' })
}

watch(
  () => route.query,
  async () => {
    syncStoreWithRoute()
    searchInput.value = taskStore.search

    await taskStore.fetchTasks()

    if (taskStore.total > 0 && taskStore.offset >= taskStore.total) {
      const lastValidOffset = Math.floor((taskStore.total - 1) / taskStore.limit) * taskStore.limit

      if (lastValidOffset !== taskStore.offset) {
        updateRoute({ offset: lastValidOffset })
      }
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="page">
    <h1>Tasks</h1>

    <div class="controls">
      <div class="search-group">
        <input v-model="searchInput" placeholder="Search Tasks..." />
        <button @click="applySearch">Search</button>
        <button @click="clearSearch">Clear</button>
      </div>

      <div class="filter-group">
        <button @click="setFilter(null)" :class="{ active: taskStore.completed === null }">
          All
        </button>
        <button @click="setFilter(0)" :class="{ active: taskStore.completed === 0 }">Active</button>
        <button @click="setFilter(1)" :class="{ active: taskStore.completed === 1 }">
          Completed
        </button>
      </div>

      <div class="create-group">
        <button @click="goToCreate" class="primary">Add New Task</button>
      </div>
    </div>

    <div class="content">
      <p v-if="taskStore.loading">Loading...</p>
      <p v-else-if="taskStore.error">{{ taskStore.error }}</p>
      <p v-else-if="taskStore.tasks.length === 0">No Tasks Yet.</p>

      <TaskList />

      <div class="pagination">
        <button @click="previousPage" :disabled="taskStore.offset === 0">Previous</button>
        <button @click="nextPage" :disabled="taskStore.offset + taskStore.limit >= taskStore.total">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.search-group,
.filter-group,
.create-group {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.content {
  background: var(--color-surface);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-md);
}

button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

button.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
