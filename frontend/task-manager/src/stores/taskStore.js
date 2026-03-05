/**
 * File: taskStore.js
 *
 * Purpose:
 * Defines the Pinia store responsible for managing all task-related state
 * and API communication for the frontend.
 *
 * Concept: Global State Store
 *
 * Instead of each component fetching and storing its own data,
 * a central store manages the application's task data.
 *
 * Components can:
 * - read state (tasks, loading, error)
 * - call actions (fetchTasks, createTask, updateTask, deleteTask)
 *
 * This avoids duplicated logic and keeps API communication centralized.
 */

import { defineStore } from 'pinia'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

/**
 * defineStore creates a Pinia store.
 *
 * 'tasks' is the store ID used internally by Pinia.
 *
 * Components use this store by calling:
 *   const taskStore = useTaskStore()
 */
export const useTaskStore = defineStore('tasks', {
  /**
   * STATE
   *
   * State is reactive data shared across the application.
   * When state changes, Vue components using it automatically update.
   */
  state: () => ({
    // The single source of truth for task data
    tasks: [],

    /**
     * UI state that components react to.
     * Example uses:
     * - show loading spinners
     * - display error messages
     */
    loading: false,
    error: null,

    /**
     * Query state used when fetching tasks.
     *
     * These values control pagination and filtering
     * when calling the backend API.
     */
    search: '',
    limit: 10,
    offset: 0,
    completed: null,
    total: 0,
  }),

  /**
   * ACTIONS
   *
   * Actions are methods that can modify state and perform
   * asynchronous operations such as API calls.
   */
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
        /**
         * URLSearchParams helps construct query strings safely.
         *
         * Example result:
         * ?search=meeting&limit=10&offset=0
         */
        const params = new URLSearchParams({
          search: this.search,
          limit: this.limit,
          offset: this.offset,
        })

        /**
         * Only add completed filter if it was specified.
         */
        if (this.completed !== null) {
          params.append('completed', this.completed)
        }

        /**
         * Perform API request to backend.
         */
        const res = await fetch(`${API_BASE_URL}/tasks?${params}`)

        if (!res.ok) {
          throw new Error('Failed to fetch tasks.')
        }

        /**
         * Backend response structure:
         * {
         *   data: [...tasks],
         *   total: number,
         *   limit: number,
         *   offset: number
         * }
         */
        const result = await res.json()

        // Stores only the actual task data
        this.tasks = result.data
        /**
         * Store total for pagination.
         */
        this.total = result.total
      } catch (err) {
        this.error = err.message
      } finally {
        // Always reset loading state whether succerss or failure
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
