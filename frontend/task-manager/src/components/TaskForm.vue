<script setup>
/**
 * File: TaskForm.vue
 *
 * Purpose:
 * Reusable form component used for both creating and editing tasks.
 *
 * Behavior:
 * - When `isEdit` is false → creates a new task
 * - When `isEdit` is true  → updates an existing task
 *
 * Concept: Reusable Form Component
 *
 * Instead of creating separate forms for "create" and "edit",
 * one component handles both cases using props.
 */
import { ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

/**
 * Props received from the parent view.
 *
 * task  → task object when editing
 * isEdit → boolean flag indicating edit mode
 */
const props = defineProps({
  task: Object,
  isEdit: Boolean,
})

/**
 * Component events that can be emitted to the parent.
 *
 * success → form completed successfully
 * cancel  → user cancelled the form
 */
const emit = defineEmits(['success', 'cancel'])

const taskStore = useTaskStore()

/**
 * Reactive form fields.
 *
 * ref() creates reactive values that update the UI automatically.
 */
const title = ref('')
const priority = ref('')
const details = ref('')

const formError = ref(null)

/**
 * Basic client-side validation before submitting.
 */
function validate() {
  if (!title.value.trim()) {
    formError.value = 'Title is required'
    return false
  }

  if (!priority.value) {
    formError.value = 'Priority is required'
    return false
  }

  formError.value = null
  return true
}

/**
 * Handles form submission.
 *
 * Determines whether to create or update a task
 * based on the isEdit prop.
 */
async function handleSubmit() {
  if (!validate()) return

  try {
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
  } catch (err) {
    formError.value = err.message || 'An unexpectd error occured'
  }
}

/**
 * Cancel button handler.
 *
 * Emits cancel event so parent view can decide
 * how to handle navigation or UI changes.
 */
function handleCancel() {
  emit('cancel')
}

/**
 * Watch for changes to the incoming `task` prop.
 *
 * Concept: Watchers
 *
 * A watcher allows the component to react when
 * reactive data changes.
 *
 * Here it ensures the form fields stay synced
 * when the parent provides a different task.
 */
watch(
  () => props.task,
  /**
   * This callback runs whenever props.task changes.
   */
  (newTask) => {
    /**
     * Guard clause ensures a task object exists.
     */
    if (newTask) {
      /**
       * Copy values into local refs.
       *
       * Props are read-only in Vue, so we copy values
       * instead of modifying the prop directly.
       */
      title.value = newTask.title
      priority.value = newTask.priority
      /**
       * Nullish coalescing (??)
       *
       * Ensures details is always a string.
       */
      details.value = newTask.details ?? ''
    }
  },
  /**
   * immediate: true means the watcher runs
   * once when the component is first mounted.
   */
  { immediate: true },
)
</script>

<template>
  <!--
    Form submission uses @submit.prevent to stop
    the browser from refreshing the page.
  -->
  <form class="task-form" @submit.prevent="handleSubmit">
    <div class="field">
      <label>Title</label>
      <!--
        v-model creates two-way binding between
        input value and the reactive ref.
      -->
      <input v-model="title" placeholder="Title" />
    </div>

    <div class="field">
      <label>Priority</label>
      <select v-model="priority">
        <option value="" disabled>Select Priority</option>
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>
    </div>

    <div class="field">
      <label>Details</label>
      <textarea v-model="details" placeholder="Task Details"></textarea>
    </div>

    <!-- Display form error if validation fails -->
    <p v-if="formError" class="error">{{ formError }}</p>

    <div class="actions">
      <!--
        Button label changes depending on mode.
      -->
      <button type="submit" class="primary">
        {{ isEdit ? 'Save Edit' : 'Create Task' }}
      </button>
      <button type="button" @click="handleCancel">Cancel</button>
    </div>
  </form>
</template>

<style scoped>
/**
 * Container styling for the form.
 */
.task-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  background: var(--color-surface);
  padding: var(--space-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

/**
 * Field group layout.
 *
 * Flex column stacks label + input vertically.
 */
.field {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

label {
  font-size: 0.85rem;
  font-weight: 600;
}

/**
 * Textarea sizing.
 *
 * resize: vertical allows height adjustment only vertically.
 */
textarea {
  min-height: 250px;
  resize: vertical;
}

.error {
  color: var(--color-danger);
  font-size: 0.85rem;
  margin: 0;
}

.actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
}
</style>
