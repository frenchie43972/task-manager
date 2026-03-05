/**
 * File: router/index.js
 *
 * Purpose:
 * Configures Vue Router for the application. The router determines which
 * view component should be displayed based on the current URL.
 *
 * Concept: Client-Side Routing
 *
 * In a Single Page Application (SPA), navigation between pages does not
 * reload the entire browser page. Instead, Vue Router swaps components
 * dynamically depending on the route.
 *
 * Example:
 *   /            → TaskView (task list page)
 *   /tasks/new   → TaskFormView (create task page)
 *   /tasks/5/edit → TaskFormView (edit task page)
 */
import { createRouter, createWebHistory } from 'vue-router'
/**
 * Import view components that represent full pages.
 *
 * Convention:
 * Files inside /views are typically top-level pages rather
 * than small reusable UI components.
 */
import TaskView from '@/views/TaskView.vue'
import TaskFormView from '@/views/TaskFormView.vue'

const routes = [
  {
    path: '/',
    name: 'tasks',
    component: TaskView,
  },
  {
    path: '/tasks/new',
    name: 'task-create',
    component: TaskFormView,
  },
  {
    path: '/tasks/:id/edit',
    name: 'tasks-edit',
    component: TaskFormView,
    /**
     * props: true
     *
     * This tells Vue Router to pass route parameters
     * directly to the component as props.
     *
     * Instead of accessing:
     *   route.params.id
     *
     * The component can simply use:
     *   props.id
     */
    props: true,
  },
]

/**
 * Create the router instance.
 *
 * createWebHistory() uses the browser's History API
 * so URLs look clean (no # in the address bar).
 *
 * Example:
 *   /tasks/5
 * instead of
 *   /#/tasks/5
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
