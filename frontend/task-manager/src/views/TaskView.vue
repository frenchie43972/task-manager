<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskList from '@/components/TaskList.vue'

const taskStore = useTaskStore()

const route = useRoute()
const router = useRouter()

const searchInput = ref(taskStore.search)

function applySearch() {
  router.push({
    query: {
      ...route.query,
      search: searchInput.value,
      offset: 0,
      limit: taskStore.limit,
    },
  })
}

function clearSearch() {
  searchInput.value = ''
  taskStore.search = ''
  taskStore.offset = 0
  taskStore.fetchTasks()
}

function previousPage() {
  const prevOffset = taskStore.offset - taskStore.limit

  if (prevOffset < 0) return

  router.push({
    query: {
      ...route.query,
      offset: prevOffset,
      limit: taskStore.limit,
      search: taskStore.search,
    },
  })
}

function nextPage() {
  const nextOffset = taskStore.offset + taskStore.limit

  if (nextOffset >= taskStore.total) return

  router.push({
    query: {
      ...route.query,
      offset: nextOffset,
      limit: taskStore.limit,
      search: taskStore.search,
    },
  })
}

watch(
  () => route.query,
  (query) => {
    taskStore.search = query.search || ''
    taskStore.limit = Number(query.limit) || 10
    taskStore.offset = Number(query.offset) || 0

    searchInput.value = taskStore.search

    taskStore.fetchTasks()
  },
  { immediate: true },
)

// onMounted(() => {
//   const { search = '', limit = 10, offset = 0 } = route.query

//   taskStore.search = search
//   taskStore.limit = Number(limit)
//   taskStore.offset = Number(offset)

//   searchInput.value = search

//   taskStore.fetchTasks()
// })
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
    <button @click="nextPage" :disabled="taskStore.offset + taskStore.limit >= taskStore.total">
      Next
    </button>
  </div>
</template>

<style scoped></style>
