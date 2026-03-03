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
    name: 'tasks-edit',
    params: { id: task.id },
  })
}

async function handleDelete() {
  const confirmed = window.confirm('Are you sure you want to delete this task?')

  if (!confirmed) {
    return
  }

  await taskStore.deleteTask(task.id)
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
  <li class="card">
    <div class="card-header">
      <input type="checkbox" :checked="task.completed === 1" @change="toggleCompleted" />
      <h3 :class="{ completed: task.completed === 1 }">
        {{ task.title }}
      </h3>
    </div>

    <div class="card-body">
      <p class="priority">{{ task.priority }}</p>
      <p class="details">{{ task.details }}</p>
    </div>

    <div class="card-actions">
      <button @click="goToEdit">Edit</button>
      <button @click="handleDelete" class="danger">Delete</button>
    </div>
  </li>
</template>

<style scoped>
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--space-md);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: var(--space-sm);
  min-height: 180px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
}

.completed {
  text-decoration: line-through;
  color: var(--color-muted);
}

.card-body {
  flex: 1;
}

.priority {
  font-weight: 600;
  font-size: 0.85rem;
  margin: 0 0 var(--space-xs) 0;
}

.details {
  font-size: 0.85rem;
  color: var(--color-muted);
  margin: 0;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  gap: var(--space-sm);
}

button.danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
}
</style>
