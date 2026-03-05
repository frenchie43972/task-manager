/**
 * File: main.js
 *
 * Purpose:
 * Entry point of the Vue frontend application.
 *
 * This file is responsible for:
 * - Creating the Vue application instance
 * - Registering global plugins (Pinia, Router)
 * - Importing global styles
 * - Mounting the app to the HTML page
 *
 * Concept: Application Bootstrap (Frontend)
 *
 * Similar to the backend server bootstrap, this file initializes
 * the core pieces of the frontend before the UI begins rendering.
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
