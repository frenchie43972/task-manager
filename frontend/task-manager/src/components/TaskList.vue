<script setup>
import { useTaskStore } from '@/stores/taskStore'
import TaskItem from './TaskItem.vue'

const taskStore = useTaskStore()
</script>

<template>
  <ul class="task-grid">
    <TaskItem v-for="task in taskStore.tasks" :key="task.id" :task="task" />
  </ul>
</template>

<style scoped>
.task-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
  padding: 0;
  margin: 0;
}
</style>
