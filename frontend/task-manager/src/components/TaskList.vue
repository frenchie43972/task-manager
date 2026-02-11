<script setup>
import { useTaskStore } from '@/stores/taskStore'
import TaskItem from './TaskItem.vue'

const taskStore = useTaskStore()
</script>

<template>
  <ul>
    <TaskItem v-for="task in taskStore.tasks" :key="task.id" :task="task" />
  </ul>
</template>

<style scoped></style>
