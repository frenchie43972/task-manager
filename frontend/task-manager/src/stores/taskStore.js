import { defineStore } from 'pinia'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchTasks() {
      this.loading = true
      this.error = null

      try {
        const res = await fetch(`${API_BASE_URL}/tasks`)

        if (!res.ok) {
          throw new Error('Failed to fetch notes.')
        }

        // Reads the JSON response from the body
        const data = await res.json()

        // Updates the reactive state triggering a rerender
        this.tasks = data
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },

    async createTask(title, priority, details) {
      const res = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({title, priority, details}),
      });

      if (!res.ok) {
        throw new Error('Failed to create task');
      }

      const newTask = await res.json();

      this.tasks.push(newTask);
    },
  },
});