<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskForm from '@/components/TaskForm.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

// If route has an id param, it can be edited
const isEditMode = computed(() => !!route.params.id)

// Finds the task in the store if editing
const task = computed(() => {
  if (!isEditMode.value) return null

  return taskStore.tasks.find((t) => t.id === Number(route.params.id))
})

onMounted(async () => {
  if (!isEditMode.value) return

  const id = Number(route.params.id)

  if (!Number.isInteger(id) || id <= 0) {
    router.replace({ name: 'tasks' })
    return
  }

  try {
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`)

    if (!res.ok) {
      router.replace({ name: 'tasks' })
      return
    }

    const json = await res.json()

    const exists = taskStore.tasks.find((t) => t.id === id)

    if (!exists) {
      taskStore.tasks.push(json.data)
    }
  } catch {
    router.replace({ name: 'tasks' })
  }
})

// After saving, return to the home page
function handleSuccess() {
  router.push({ name: 'tasks' })
}
</script>

<template>
  <div class="form-page">
    <h1>{{ isEditMode ? 'Edit Task' : 'Create Task' }}</h1>

    <TaskForm :task="task" :isEdit="isEditMode" @success="handleSuccess" @cancel="handleSuccess" />
  </div>
</template>

<style scoped>
.form-page {
  max-width: 520px;
  margin: 0 auto;
  padding: var(--space-lg);
}

h1 {
  margin-bottom: var(--space-md);
}
</style>
