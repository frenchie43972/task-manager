<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskForm from '@/components/TaskForm.vue'

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
  if (isEditMode.value && taskStore.tasks.length === 0) {
    await taskStore.fetchTasks()
  }
})

// After saving, return to the home page
function handleSuccess() {
  router.push({ name: 'tasks' })
}
</script>

<template>
  <div>
    <h1 v-if="isEditMode">Edit Task</h1>
    <h1 v-else>Create Task</h1>

    <TaskForm :task="task" :isEdit="isEditMode" @success="handleSuccess" @cancel="handleSuccess" />
  </div>
</template>

<style scoped></style>
