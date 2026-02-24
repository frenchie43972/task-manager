<script setup>
import { onMounted, ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import TaskList from '@/components/TaskList.vue'

const taskStore = useTaskStore()

const searchInput = ref(taskStore.search)

onMounted(() => {
  taskStore.fetchTasks()
})

function applySearch() {
  taskStore.search = searchInput.value
  taskStore.offset = 0
  taskStore.fetchTasks()
}

function clearSearch() {
  taskStore.search = ''
  taskStore.offset = 0
  taskStore.fetchTasks()
}

function previousPage() {
  if (taskStore.offset === 0) return
  taskStore.offset -= taskStore.limit
  taskStore.fetchTasks()
}

function nextPage() {
  taskStore.offset += taskStore.limit
  taskStore.fetchTasks()
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
