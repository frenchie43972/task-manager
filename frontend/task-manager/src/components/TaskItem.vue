<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore.js'

const props = defineProps({
  task: {
    type: Object,
    required: true,
  },
})

const taskStore = useTaskStore()

const isEditing = ref(false)
const editTitle = ref('')
const editPriority = ref('')
const editDetails = ref('')

function startEdit() {
  isEditing.value = true
  editTitle.value = props.task.title
  editPriority.value = props.task.priority
  editDetails.value = props.task.details ?? ''
}

async function saveEdit() {
  await taskStore.updateTask(props.task.id, {
    title: editTitle.value,
    priority: editPriority.value,
    details: editDetails.value,
  })

  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
}
</script>

<template>
  <li>
    <div v-if="isEditing">
      <input v-model="editTitle" />

      <select v-model="editPriority">
        <option value="High">High</option>
        <option value="Medium">Medium</option>
        <option value="Low">Low</option>
      </select>

      <textarea v-model="editDetails"></textarea>

      <button @click="saveEdit">Save</button>
      <button @click="cancelEdit">Cancel</button>
    </div>

    <div v-else>
      <h3>{{ task.title }}</h3>
      <p>{{ task.priority }}</p>
      <p>{{ task.details }}</p>

      <button @click="taskStore.deleteTask(props.task.id)">Delete</button>
      <button @click="startEdit">Edit</button>
    </div>
  </li>
</template>

<style scoped></style>
