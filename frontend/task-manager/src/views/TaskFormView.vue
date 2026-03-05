<script setup>
/**
 * File: TaskFormView.vue
 *
 * Purpose:
 * Page component responsible for rendering the task form used to
 * create a new task or edit an existing one.
 *
 * This view mainly coordinates:
 * - reading the route parameter
 * - determining whether the form is in create or edit mode
 * - loading the task if necessary
 * - handling navigation after a successful save
 */
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskForm from '@/components/TaskForm.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

/**
 * Determine if the page is editing a task.
 *
 * If the route contains an id parameter:
 *   /tasks/5/edit
 *
 * then edit mode is enabled.
 *
 * !! converts the value into a true/false boolean.
 */
const isEditMode = computed(() => !!route.params.id)

/**
 * Locate the task inside the store when editing.
 *
 * computed() keeps this value reactive so if the
 * store changes, the component updates automatically.
 */
const task = computed(() => {
  if (!isEditMode.value) return null

  return taskStore.tasks.find((t) => t.id === Number(route.params.id))
})

/**
 * Lifecycle hook: runs when the component is mounted.
 *
 * Used here to ensure the task exists when editing.
 */
onMounted(async () => {
  if (!isEditMode.value) return

  const id = Number(route.params.id)

  /**
   * Validate the id parameter.
   */
  if (!Number.isInteger(id) || id <= 0) {
    router.replace({ name: 'tasks' })
    return
  }

  try {
    /**
     * Request the specific task from the backend.
     *
     * This ensures the page works even if the user
     * navigates directly to the edit URL.
     */
    const res = await fetch(`${API_BASE_URL}/tasks/${id}`)

    if (!res.ok) {
      router.replace({ name: 'tasks' })
      return
    }

    const json = await res.json()

    /**
     * Avoid duplicating the task if it already exists
     * in the store.
     */
    const exists = taskStore.tasks.find((t) => t.id === id)

    if (!exists) {
      taskStore.tasks.push(json.data)
    }
  } catch {
    router.replace({ name: 'tasks' })
  }
})

/**
 * Called after a successful create or edit.
 *
 * Redirects back to the task list page.
 */
function handleSuccess() {
  router.push({ name: 'tasks' })
}
</script>

<template>
  <div class="form-page">
    <!-- Page title changes depending on mode -->
    <h1>{{ isEditMode ? 'Edit Task' : 'Create Task' }}</h1>

    <!--
      TaskForm component handles the actual form UI.

      Props:
      task   → existing task when editing
      isEdit → tells the form which mode to use

      Events:
      success → called after successful save
      cancel  → user cancelled form
    -->
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
