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

async function toggleCompleted() {
  const isCompleted = task.completed === 1 ? 0 : 1

  await taskStore.updateTask(task.id, {
    title: task.title,
    priority: task.priority,
    details: task.details,
    completed: isCompleted,
  })
}
</script>

<template>
  <li>
    <div>
      <input type="checkbox" :checked="task.completed === 1" @change="toggleCompleted" />

      <h3 :style="{ textDecoration: task.completed === 1 ? 'line-through' : 'none' }">
        {{ task.title }}
      </h3>

      <p>{{ task.priority }}</p>
      <p>{{ task.details }}</p>

      <button @click="taskStore.deleteTask(task.id)">Delete</button>
      <button @click="goToEdit">Edit</button>
    </div>
  </li>
</template>

<style scoped></style>
