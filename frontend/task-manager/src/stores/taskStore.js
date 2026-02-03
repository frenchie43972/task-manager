import { defineStore } from 'pinia'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    error: null,
  }),

  actions: {
    async fetchTasks() {
      this.error = null

      try {
        const res = await fetch(`${API_BASE_URL}/tasks`)

        if (!res.ok) {
          throw new Error('Failed to fetch tasks.')
        }

        // Reads the JSON response from the body
        const data = await res.json()

        // Updates the reactive state triggering a rerender
        this.tasks = data
        this.error = null
      } catch (err) {
        this.error = err.message
      }
    },

    async createTask(taskData) {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData),
      })

      if (!res.ok) {
        throw new Error('Failed to create task')
      }

      const createdTask = await res.json()

      this.tasks.push(createdTask)
    },

    async deleteTask(id) {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        throw new Error('Failed to delete task.')
      }

      this.tasks = this.tasks.filter((task) => task.id !== id)
    },

    async updateTask(id, updates) {
      const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      })

      if (!res.ok) {
        throw new Error('Failed to update task.')
      }

      const updatedTask = await res.json()

      const index = this.tasks.findIndex((task) => task.id === id)

      if (index !== -1) {
        this.tasks[index] = updatedTask
      }
    },
  },
})
