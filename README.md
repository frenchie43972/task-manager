# Task Manager (Full-Stack Template)

A small full-stack task management application built with **Vue 3, Express, and SQLite**.  
This project demonstrates a **clean architectural structure** that can be reused as a template for future projects.

The application supports:

- Creating tasks
- Editing tasks
- Deleting tasks
- Marking tasks as completed
- Searching and filtering tasks
- Paginated task lists

The focus of this repository is **structure, clarity, and maintainability**, not feature complexity.

---

# Tech Stack

## Frontend

- Vue 3 (Composition API)
- Pinia (state management)
- Vue Router
- Vite

## Backend

- Node.js
- Express

## Database

- SQLite
- SQL migrations

---

# Project Structure

```
project-root
│
├─ backend
│   ├─ controllers
│   ├─ db
│   │   ├─ migrations
│   │   └─ queries
│   ├─ middleware
│   ├─ routes
│   └─ server.js
│
├─ frontend
│   ├─ components
│   ├─ stores
│   ├─ views
│   ├─ router
│   └─ main.js
│
└─ README.md
```

The structure separates responsibilities clearly across the stack.

---

# Architecture Overview

## Backend Layers

```
Routes → Controllers → Queries → Database
```

**Routes**

Define API endpoints.

**Controllers**

Handle request validation, input parsing, and HTTP responses.

**Queries**

Contain SQL logic and interact with the database.

**Database**

Initializes the SQLite connection and runs migrations.

---

## Frontend Layers

```
Views → Components → Store → API
```

**Views**

Page-level components tied to routes.

**Components**

Reusable UI pieces (lists, items, forms).

**Store**

The Pinia store is the **single place where API communication occurs**.

Components interact with the store rather than calling the API directly.

---

# Routing

The frontend uses **Vue Router** for navigation.

Routes include:

```
/                → Task list
/tasks/new       → Create task
/tasks/:id/edit  → Edit task
```

Search, filters, and pagination are stored in **URL query parameters** so the page state persists across refreshes.

Example:

```
/?search=test&completed=1&offset=10
```

---

# Database Migrations

The database schema is managed using SQL migration files.

Example:

```
backend/db/migrations
  001_create_tasks_table.sql
  002_add_completed_column.sql
```

When the backend starts, it automatically:

1. Creates the migrations tracking table
2. Applies any migrations that have not yet run

This ensures the database schema stays consistent across environments.

---

# Data Flow

### Fetching Tasks

```
Route change
     ↓
View updates store query state
     ↓
Store fetches tasks from API
     ↓
Components render results
```

### Creating / Updating / Deleting Tasks

```
Component action
     ↓
Store sends API request
     ↓
Backend updates database
     ↓
Store refetches tasks
```

Refetching ensures pagination and filters remain accurate.

---

# Getting Started

## 1. Clone the repository

```
git clone https://github.com/your-username/task-manager-template.git
cd task-manager-template
```

---

## 2. Start the backend

```
cd backend
npm install
npm run dev
```

Server runs on:

```
http://localhost:3000
```

---

## 3. Start the frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

# Environment Variables

Create a `.env` file in the **frontend** directory:

```
VITE_API_BASE_URL=http://localhost:3000
```

---

# Validation

**Backend validation**

- Task IDs must be positive integers
- Priority must be:
  - High
  - Medium
  - Low

**Frontend validation**

- Prevents empty form submissions
- Displays backend error messages

The backend remains the **source of truth** for validation.

---

# Key Design Principles

This project follows a few simple principles:

**Layered architecture**

Each part of the system has a clear responsibility.

**Centralized API access**

All HTTP requests go through the Pinia store.

**Route-driven UI state**

Search filters and pagination are stored in the URL.

**Database migrations**

Schema changes are tracked and applied automatically.

**Backend authority**

The frontend refetches data after mutations rather than modifying local state.

---

# Using This as a Template

When starting a new project with this template:

1. Implement basic CRUD functionality.
2. Keep backend layers separate.
3. Add database changes through migrations.
4. Centralize API calls in the store.
5. Represent UI state in routes.

This structure scales well as applications grow.

---

# License

MIT License
