<script setup>
/**
 * File: TaskView.vue
 *
 * Purpose:
 * Main page that displays the task list along with search, filtering,
 * and pagination controls.
 *
 * Responsibilities:
 * - Sync query parameters in the URL with the store state
 * - Fetch tasks when filters/search/pagination change
 * - Provide UI controls for search, filters, and navigation
 *
 * Concept: URL-driven state
 *
 * Instead of storing search/filter state only inside the component,
 * this page keeps it inside the URL query parameters.
 *
 * Example URLs:
 *   /?search=meeting
 *   /?offset=10
 *   /?completed=1
 *
 * Benefits:
 * - The page can be bookmarked
 * - Refreshing the browser keeps the same filters
 * - Links can share the current search/filter state
 */
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTaskStore } from '@/stores/taskStore'
import TaskList from '@/components/TaskList.vue'

/**
 * Access the current route and router.
 *
 * route  → information about the current URL
 * router → allows navigation or updating the URL
 */
const route = useRoute()
const router = useRouter()
const taskStore = useTaskStore()

/**
 * Local search input state.
 *
 * This is separate from the store so the user can type
 * without immediately triggering a new request.
 */
const searchInput = ref('')

/**
 * Synchronize the store state with URL query parameters.
 *
 * Example URL:
 *   /?search=test&offset=10&completed=1
 *
 * These values are copied into the store so fetchTasks()
 * uses them when querying the backend.
 */
function syncStoreWithRoute() {
  taskStore.search = route.query.search || ''
  taskStore.offset = Number(route.query.offset) || 0

  /**
   * completed filter logic:
   * undefined → no filter
   * 0 → active tasks
   * 1 → completed tasks
   */
  if (route.query.completed === undefined) {
    taskStore.completed = null
  } else {
    taskStore.completed = Number(route.query.completed)
  }
}

/**
 * Update the route query parameters.
 *
 * This triggers the watcher below, which will
 * re-fetch tasks using the updated parameters.
 */
function updateRoute(queryUpdates) {
  router.push({
    name: 'tasks',
    query: {
      ...route.query,
      ...queryUpdates,
    },
  })
}

/**
 * Apply the search value from the input field.
 *
 * Reset offset so results start from the first page.
 */
function applySearch() {
  updateRoute({
    search: searchInput.value || undefined,
    offset: 0,
  })
}

/**
 * Clear the search filter.
 */
function clearSearch() {
  searchInput.value = ''
  updateRoute({
    search: undefined,
    offset: 0,
  })
}

/**
 * Move to the previous page.
 *
 * Pagination uses offset/limit pattern:
 * offset = starting index of results
 */
function previousPage() {
  if (taskStore.offset === 0) return
  updateRoute({
    offset: taskStore.offset - taskStore.limit,
  })
}

function nextPage() {
  updateRoute({
    offset: taskStore.offset + taskStore.limit,
  })
}

/**
 * Apply completion filter.
 *
 * value:
 *   null → all tasks
 *   0 → active
 *   1 → completed
 */
function setFilter(value) {
  updateRoute({
    completed: value === null ? undefined : value,
    offset: 0,
  })
}

function goToCreate() {
  router.push({ name: 'task-create' })
}

/**
 * Watch for changes to the route query parameters.
 *
 * Whenever the URL changes:
 * - sync the store
 * - fetch tasks
 * - correct pagination if needed
 */
watch(
  () => route.query,
  async () => {
    syncStoreWithRoute()
    /**
     * Keep the search input field synced with store state.
     */
    searchInput.value = taskStore.search

    /**
     * Fetch tasks from backend API.
     */
    await taskStore.fetchTasks()

    /**
     * Pagination guard.
     *
     * If the current offset is beyond the total results,
     * calculate the last valid page and update the route.
     */
    if (taskStore.total > 0 && taskStore.offset >= taskStore.total) {
      const lastValidOffset = Math.floor((taskStore.total - 1) / taskStore.limit) * taskStore.limit

      if (lastValidOffset !== taskStore.offset) {
        updateRoute({ offset: lastValidOffset })
      }
    }
  },
  /**
   * immediate:true means the watcher runs
   * once when the component first loads.
   */
  { immediate: true },
)
</script>

<template>
  <div class="page">
    <h1>Tasks</h1>

    // Controls for search, filters, and create button
    <div class="controls">
      <div class="search-group">
        <input v-model="searchInput" placeholder="Search Tasks..." />
        <button @click="applySearch">Search</button>
        <button @click="clearSearch">Clear</button>
      </div>

      <div class="filter-group">
        <!-- Filter buttons toggle completion state -->
        <button @click="setFilter(null)" :class="{ active: taskStore.completed === null }">
          All
        </button>
        <button @click="setFilter(0)" :class="{ active: taskStore.completed === 0 }">Active</button>
        <button @click="setFilter(1)" :class="{ active: taskStore.completed === 1 }">
          Completed
        </button>
      </div>

      <div class="create-group">
        <button @click="goToCreate" class="primary">Add New Task</button>
      </div>
    </div>

    <div class="content">
      <!-- Loading / error / empty states -->
      <p v-if="taskStore.loading">Loading...</p>
      <p v-else-if="taskStore.error">{{ taskStore.error }}</p>
      <p v-else-if="taskStore.tasks.length === 0">No Tasks Yet.</p>

      <TaskList />

      // Pagination controls
      <div class="pagination">
        <button @click="previousPage" :disabled="taskStore.offset === 0">Previous</button>
        <button @click="nextPage" :disabled="taskStore.offset + taskStore.limit >= taskStore.total">
          Next
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/**
 * Main page layout container.
 */
.page {
  max-width: 720px;
  margin: 0 auto;
  padding: var(--space-lg);
}

.controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

/**
 * Groups allow controls to wrap on smaller screens.
 * flex-wrap supports responsive layout behavior.
 */
.search-group,
.filter-group,
.create-group {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.content {
  background: var(--color-surface);
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
}

.pagination {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-md);
}

button.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

button.primary {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
