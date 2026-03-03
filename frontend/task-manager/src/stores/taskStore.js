import { defineStore } from 'pinia'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    // The single source of truth for task data
    tasks: [],

    // UI state that components can react to
    loading: false,
    error: null,

    // Query state
    search: '',
    limit: 10,
    offset: 0,
    completed: null,
    total: 0,
  }),

  actions: {
    /*
      Fetch a list of tasks from the backend.
      This action owns:
      - loading state
      - error handling
      - knowledge of the API response shape
    */
    async fetchTasks() {
      this.loading = true
      this.error = null

      try {
        const params = new URLSearchParams({
          search: this.search,
          limit: this.limit,
          offset: this.offset,
        })

        if (this.completed !== null) {
          params.append('completed', this.completed)
        }

        const res = await fetch(`${API_BASE_URL}/tasks?${params}`)

        if (!res.ok) {
          throw new Error('Failed to fetch tasks.')
        }

        // Backend returns an envelope {data, limit, offset}
        const result = await res.json()

        // Stores only the actual task data
        this.tasks = result.data
        this.total = result.total
      } catch (err) {
        this.error = err.message
      } finally {
        // Always clear loading whether succerss or failure
        this.loading = false
      }
    },

    /*
      Create a new task.
      Components pass a plain object:
      { title, priority, details }
    */
    async createTask(taskData) {
      this.error = null

      try {
        const res = await fetch(`${API_BASE_URL}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData),
        })

        if (!res.ok) {
          throw new Error('Failed to create task')
        }

        await res.json()

        await this.fetchTasks()
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    /*
      Delete a task by ID.
      Backend returns 204 No Content on success.
    */
    async deleteTask(id) {
      this.error = null

      try {
        const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
          method: 'DELETE',
        })

        if (!res.ok) {
          throw new Error('Failed to delete task.')
        }

        await this.fetchTasks()
      } catch (err) {
        this.error = err.message
        throw err
      }
    },

    /*
      Update an existing task.
      `updates` is a plain object with updated fields.
    */
    async updateTask(id, updates) {
      this.error = null

      try {
        const res = await fetch(`${API_BASE_URL}/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates),
        })

        if (!res.ok) {
          throw new Error('Failed to update task.')
        }

        await res.json()

        await this.fetchTasks()
      } catch (err) {
        this.error = err.message
        throw err
      }
    },
  },
})
