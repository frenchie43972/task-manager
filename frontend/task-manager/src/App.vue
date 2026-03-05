<script setup></script>

<template>
  <!--
    router-view is a Vue Router component.

    Concept: Dynamic Route Rendering

    Vue Router replaces <router-view> with the component
    that matches the current URL.

    Example:
      URL: /tasks
      Rendered component: TasksPage.vue

      URL: /tasks/5
      Rendered component: TaskDetail.vue
  -->
  <router-view />
</template>

<style scoped></style>
