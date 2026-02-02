<script setup>
import { ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore.js'

const taskStore = useTaskStore()
const editId = ref(null)

const editTitle = ref('')
const editPriority = ref('')
const editDetails = ref('')

onMounted(() => {
  taskStore.fetchTasks()
})

function startEdit(task) {
  editId.value = task.id
  editTitle.value = task.title
  editPriority.value = task.priority
  editDetails.value = task.details ?? ''
}

async function saveEdit(taskId) {
  await taskStore.updateTask(taskId, editTitle.value, editPriority.value, editDetails.value)

  editId.value = null
}

function cancelEdit() {
  editId.value = null
}
</script>

<template>
  <div>
    <h2>Task Item</h2>

    <p v-if="taskStore.loading">Loading...</p>
    <p v-else-if="taskStore.error">{{ taskStore.error }}</p>
    <p v-else-if="taskStore.tasks.length === 0">No Tasks Yet.</p>

    <ul v-else>
      <li v-for="task in taskStore.tasks" :key="task.id" :task="task">
        <div v-if="editId === task.id">
          <input v-model="editTitle" />

          <select v-model="editPriority">
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <textarea v-model="editDetails"></textarea>

          <button @click="saveEdit(task.id)">Save</button>
          <button @click="cancelEdit">Cancel</button>
        </div>

        <div v-else>
          <h3>{{ task.title }}</h3>
          <p>{{ task.priority }}</p>
          <p>{{ task.details }}</p>
          <button @click="taskStore.deleteTask(task.id)">Delete Task</button>
          <button @click="startEdit(task)">Edit Task</button>
        </div>
      </li>
    </ul>
    <button>Add Task</button>
  </div>
</template>

<style scoped></style>
