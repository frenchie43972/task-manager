<script setup>
import { ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const props = defineProps({
  task: Object,
  isEdit: Boolean,
})

const emit = defineEmits(['success', 'cancel'])

const taskStore = useTaskStore()

const title = ref('')
const priority = ref('')
const details = ref('')

// Watch for changes to the incoming `task` prop.
// Wrap it in a function so Vue can track it reactively.
watch(
  () => props.task,
  // This callback runs whenever `props.task` changes.
  // `newTask` is the updated value of the prop.
  (newTask) => {
    // Guard clause: only run if a task object exists.
    // Prevents errors if the prop is null/undefined.
    if (newTask) {
      // Sync the incoming prop data into local refs.
      // Copy values instead of mutating the prop directly.
      // (Props are read-only in Vue and should not be modified.)
      title.value = newTask.title
      priority.value = newTask.priority
      // Use nullish coalescing to ensure `details` is always a string.
      // If `newTask.details` is null or undefined, default to ''.
      details.value = newTask.details ?? ''
    }
  },
  // `immediate: true` forces this watcher to run once on component mount.
  // This ensures local state is initialized from the prop
  // even if the prop never changes after first render.
  { immediate: true },
)

async function handleSubmit() {
  if (!title.value || !priority.value) return

  if (props.isEdit && props.task) {
    await taskStore.updateTask(props.task.id, {
      title: title.value,
      priority: priority.value,
      details: details.value,
    })
  } else {
    await taskStore.createTask({
      title: title.value,
      priority: priority.value,
      details: details.value,
    })
  }

  emit('success')
}

function handleCancel() {
  emit('cancel')
}
</script>

<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="title" placeholder="Title" />

    <select v-model="priority">
      <option value="" disabled="">Select Priority</option>
      <option value="High">High</option>
      <option value="Medium">Medium</option>
      <option value="Low">Low</option>
    </select>

    <textarea v-model="details" placeholder="Task Details"></textarea>

    <button type="submit">
      {{ isEdit ? 'Save Edit' : 'Create Task' }}
    </button>
    <button @click="handleCancel">Cancel</button>
  </form>
</template>

<style scoped></style>
