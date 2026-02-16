<script setup>
import { useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore.js'

const { task } = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const router = useRouter()
const taskStore = useTaskStore()

function goToEdit() {
  router.push({
    name: 'task-edit',
    params: { id: task.id },
  })
}
</script>

<template>
  <li>
    <div>
      <h3>{{ task.title }}</h3>
      <p>{{ task.priority }}</p>
      <p>{{ task.details }}</p>

      <button @click="taskStore.deleteTask(task.id)">Delete</button>
      <button @click="goToEdit">Edit</button>
    </div>
  </li>
</template>

<style scoped></style>
