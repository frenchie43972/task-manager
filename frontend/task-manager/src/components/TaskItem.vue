<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore.js'

const taskStore = useTaskStore()

onMounted(() => {
  taskStore.fetchTasks()
})
</script>

<template>
  <div>
    <h2>Task Item</h2>

    <p v-if="taskStore.loading">Loading...</p>
    <p v-else-if="taskStore.error">{{ taskStore.error }}</p>
    <p v-else-if="taskStore.length === 0">No Tasks Yet.</p>

    <ul v-else>
      <li v-for="task in taskStore.tasks" :key="task.id" :task="task">
        <h3>{{ task.title }}</h3>
        <p>{{ task.priority }}</p>
        <p>{{ task.details }}</p>
        <button @click="taskStore.deleteTask(task.id)">Delete Task</button>
        <button>Edit Task</button>
      </li>
    </ul>
    <button>Add Task</button>
  </div>
</template>

<style scoped></style>
