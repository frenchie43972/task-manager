<script setup>
import { ref } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

const taskStore = useTaskStore();

const title = ref('')
const priority = ref('')
const details = ref('')

async function saveTask() {
  // Ensures the two required fields are filled out
  if (!title.value || !priority.value) return;

  await taskStore.createTask(title.value, priority.value, details.value);

  title.value = ''
  priority.value = ''
  details.value = ''
}

function cancelCreate() {
  title.value = ''
  priority.value = ''
  details.value = ''
}
</script>

<template>
  <div>
    <h2>Task Form</h2>
    <form @submit.prevent='saveTask'>
      <input v-model='title' placeholder='Title' />
      <select v-model='priority'>
        <option value='' disabled=''>Select Priority</option>
        <option value='High'>High</option>
        <option value='Medium'>Medium</option>
        <option value='Low'>Low</option>
      </select>
      <textarea v-model='details' placeholder='Task Details'></textarea>
      <div>
        <button type='submit'>Save</button>
        <button @click='cancelCreate'>Cancel</button>
      </div>
    </form>
  </div>
</template>

<style scoped></style>