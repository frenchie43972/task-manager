<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import TaskList from '@/components/TaskList.vue'

const taskStore = useTaskStore()

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<template>
  <div>
    <h1>Tasks</h1>

    <p v-if="taskStore.loading">Loading...</p>
    <p v-else-if="taskStore.error">{{ taskStore.error }}</p>
    <p v-else-if="taskStore.tasks.length === 0">No Tasks Yet.</p>

    <TaskList />
  </div>
</template>

<style scoped></style>
