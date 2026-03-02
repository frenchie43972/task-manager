import { createRouter, createWebHistory } from 'vue-router'
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
    props: true, // Allows rout params to be passed as props
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
