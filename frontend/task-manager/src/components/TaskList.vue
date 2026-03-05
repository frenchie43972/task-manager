<script setup>
/**
 * File: TaskList.vue
 *
 * Purpose:
 * Displays a collection of tasks using the TaskItem component.
 *
 * This component reads task data from the Pinia task store
 * and renders one TaskItem component per task.
 *
 * Concept: Store-driven UI
 *
 * The component does not fetch data itself. Instead, it relies on
 * the global task store. When the store updates (for example after
 * fetchTasks()), the UI automatically re-renders because the store
 * state is reactive.
 */
import { useTaskStore } from '@/stores/taskStore'
import TaskItem from './TaskItem.vue'

const taskStore = useTaskStore()
</script>

<template>
  <!--
    Container for all task cards.
    Each task in the store is rendered as a TaskItem component.
  -->
  <ul class="task-grid">
    <!--
      v-for loops over the tasks array in the store.

      :key helps Vue efficiently update the DOM when
      items are added, removed, or changed.
    -->
    <TaskItem v-for="task in taskStore.tasks" :key="task.id" :task="task" />
  </ul>
</template>

<style scoped>
/**
 * Grid layout for displaying task cards.
 *
 * CSS Grid is used to create a responsive layout
 * where cards automatically wrap based on screen width.
 */
.task-grid {
  display: grid;
  /**
   * Responsive grid behavior.
   *
   * auto-fit:
   *   Automatically creates as many columns as will fit.
   *
   * minmax(240px, 1fr):
   *   Each column is at least 240px wide,
   *   but can grow to fill available space.
   *
   * Result:
   * - Small screens → fewer columns
   * - Large screens → more columns
   */
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--space-md);
  padding: 0;
  margin: 0;
}
</style>
