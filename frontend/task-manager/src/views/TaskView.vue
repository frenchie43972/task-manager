<script setup>
import { onMounted, ref, watch } from 'vue'
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

onMounted(() => {
  syncStoreWithRoute()
  searchInput.value = taskStore.search
  taskStore.fetchTasks()
})

watch(
  () => route.query,
  () => {
    syncStoreWithRoute()
    taskStore.fetchTasks()
  },
)

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
</script>

<template>
  <div>
    <h1>Tasks</h1>

    <input v-model="searchInput" placeholder="Search Tasks..." />
    <button @click="applySearch">Search</button>
    <button @click="clearSearch">Clear Search</button>

    <p v-if="taskStore.loading">Loading...</p>
    <p v-else-if="taskStore.error">{{ taskStore.error }}</p>
    <p v-else-if="taskStore.tasks.length === 0">No Tasks Yet.</p>

    <TaskList />
    <button @click="previousPage" :disabled="taskStore.offset === 0">Previous</button>
    <button @click="nextPage">Next</button>
  </div>
</template>

<style scoped></style>
