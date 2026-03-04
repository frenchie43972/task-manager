# Task Manager – Full Architectural Evolution and Design Narrative

## Why This Document Exists

This document captures the complete architectural journey of the application. It explains how the project evolved from a basic CRUD implementation into a layered, route-driven, migration-based system with hardened validation and authoritative data flow.

The purpose of this document is long-term clarity. If this repository is revisited months or years from now, this narrative should explain not only what the system does, but why it is structured the way it is. It is intended to serve as both architectural documentation and a personal development record.

# The Original Application State

The project began as a straightforward CRUD learning exercise built with Vue (Composition API), Express, and SQLite.

The backend exposed working endpoints. The frontend could create, update, and delete tasks. The database persisted data correctly. From a surface perspective, the application functioned.

On the backend, the database module both opened the SQLite connection and executed schema logic. Controllers passed route parameters directly to query functions without strict coercion. SQLite implicitly coerced types, meaning invalid IDs could behave unpredictably. Response shapes were inconsistent across endpoints. Filtering and pagination existed but were not normalized as a formal contract.

On the frontend, everything rendered inside `App.vue`. There was no router. Editing occurred inline within list items. The store performed fetch calls but components were still aware of response structures. Application state was internal to components rather than represented in the URL.

The system worked, but it was fragile and not reusable as a structural template.

The first architectural decision was to stabilize structure before adding complexity.

# Phase 1 – Backend Architectural Stabilization

The backend refactor focused on layering, input normalization, lifecycle clarity, and contract stability.

## Controller Normalization and Input Validation

Controllers were rewritten to explicitly parse and validate route parameters and query values. IDs are now coerced using `Number()` and validated as positive integers. Pagination parameters are bounded and normalized before reaching SQL. Invalid values are rejected early with appropriate HTTP status codes.

This eliminated implicit type coercion and made controller logic deterministic.

At the same time, responses were standardized. Successful responses are now consistently wrapped in a predictable envelope structure:

List endpoints additionally include pagination metadata such as total, limit, and offset.

This established a stable API contract. Controllers now own HTTP semantics and validation. Query modules own data access. The frontend no longer guesses response shapes.

This was the first reinforcement of strict layering discipline.

SQL-Level Filtering and Pagination

Filtering and pagination were clarified as database responsibilities.

Search is implemented using SQL WHERE clauses. Pagination uses LIMIT and OFFSET. Total row counts are computed using COUNT(\*) with matching filter conditions.

Controllers do not re-filter result sets after retrieval. JavaScript does not manipulate row inclusion logic.

This reinforced a foundational principle: the database determines which rows exist in a result set. The application layer does not simulate filtering after the fact. This preserves scalability and separation of concerns.

Separating Startup Lifecycle from Runtime Logic

Originally, schema execution occurred inside the database initialization module. Importing the database module could trigger schema side effects.

This was refactored into an explicit startup lifecycle.

The application now follows a deterministic boot sequence:

Introducing a Lightweight Migration System

The original schema.sql file was replaced with a structured migrations directory. Each migration file represents a discrete schema change. A migrations table tracks which migrations have been applied.

This allows the schema to evolve incrementally and reproducibly. Database state is now versioned and deterministic. No manual schema setup is required.

At this point, the backend achieved structural maturity. It was layered, deterministic at startup, and contract-stable.

Phase 2 – Frontend Structural Refactor

With the backend stabilized, the frontend was refactored to mirror the same architectural discipline.

The guiding principle remained the same: stabilize structure before expanding features.

Store as the Single IO Boundary

The Pinia store was refactored to fully own API communication.

The store now:

Performs all fetch calls.

Parses envelope responses.

Manages loading and error state.

Updates internal state consistently.

Owns query parameters such as search, offset, limit, and lifecycle filter.

Components no longer access raw HTTP responses. They consume only store state and call store actions.

This established a clean IO boundary. The store acquires data. Components render data.

Introducing Vue Router and Route-Driven State

Routing was introduced with explicit named routes:

/ for task listing.

/tasks/new for task creation.

/tasks/:id/edit for editing.

App.vue was simplified to render only <router-view />.

This shifted the application from internal component state to route-driven state. The URL now represents UI state. Editing survives refresh. Views are bookmarkable. Navigation is explicit.

List behavior was also made route-driven. Search, pagination, and lifecycle filtering are represented in the query string. The route becomes the canonical source of list state. The store synchronizes with the route and fetches data accordingly.

This eliminated duplicated state and ensured refresh persistence.

Separation of Page, Collection, and Item Responsibilities

The original monolithic list component was decomposed into distinct layers:

TaskView became the page-level component responsible for syncing route state and triggering fetch operations.

TaskList became responsible only for rendering a collection of tasks.

TaskItem became responsible only for rendering a single task and emitting user interaction intent.

Fetching occurs only at the page layer. Collection components do not trigger side effects. Nested loops and duplicate fetch calls were eliminated.

Each component now has a single responsibility.

Route-Driven Create and Edit

Inline editing was removed. Editing became route-driven.

The Create button navigates to /tasks/new. The Edit button navigates to /tasks/:id/edit.

TaskFormView determines mode based on route parameters. TaskForm is a reusable component that receives props and emits events. It does not control navigation directly.

Navigation logic lives in the view layer. Form logic lives in the form component. Store logic lives in the store.

This mirrored backend layering discipline on the frontend.

Phase 3 – Domain Hardening and Behavioral Maturity

After structural layering was complete, the system was hardened to behave predictably under real-world conditions.

Lifecycle Modeling and Filtering

A completed flag was introduced via migration to model task lifecycle state. Filtering by lifecycle was implemented at the SQL level and integrated into route query parameters.

The list supports three states: all tasks, active tasks, and completed tasks. Filtering is handled by the backend. Pagination counts remain accurate under filtering.

Lifecycle toggling uses authoritative refetching to ensure filtered views remain consistent.

Authoritative Mutations

Create, update, and delete operations were refactored to refetch list data after mutation instead of mutating local arrays optimistically.

This ensures:

Pagination metadata remains correct.

Filtering remains accurate.

Total counts remain aligned with backend truth.

Edge cases are minimized.

The backend remains the source of truth for all list state.

Defensive Pagination

If a route contains an invalid or stale offset, the system detects when offset >= total and computes the last valid page offset. The route is updated automatically, and data is refetched.

This prevents empty pages caused by manual URL edits or state drift.

Strict Domain Validation

Backend validation was hardened to enforce strict priority values. Only "High", "Medium", and "Low" are accepted. Invalid values result in 400 responses.

Frontend validation prevents blank submissions and surfaces backend error messages. Delete actions require confirmation.

Domain integrity is enforced at the backend. The frontend enhances usability but does not replace backend authority.

Edit Route Existence Validation

Navigating to /tasks/:id/edit now validates the ID and confirms existence via a backend fetch. Invalid or nonexistent IDs redirect to the list view.

The frontend does not assume resource existence based solely on route parameters.

Current Architectural State

The system now follows consistent structural principles across backend and frontend.

On the backend, controllers are thin and validated. Queries are isolated. Migrations handle schema evolution. Startup lifecycle is explicit. Response envelopes are consistent. Domain validation is strict.

On the frontend, routes represent UI state. The store owns all data acquisition. Pages synchronize route state and trigger fetches. Collection and item components are purely presentational. Forms are reusable and emit events. Mutations are authoritative.

The application is layered, predictable, and reusable as a full-stack template.

Development Model for Future Projects

This project now serves as a structured development template.

Future projects should begin with minimal working CRUD functionality. Once functionality works, backend layering should be stabilized. Migrations should be introduced early. API contracts should be normalized. Routing should represent UI state before adding interface complexity. IO boundaries should be centralized in the store. Only after structure is stable should feature complexity expand.

The core principle reinforced throughout this evolution is simple:

Stabilize structure first. Expand functionality second.

Conclusion

This project evolved from a functional CRUD application into a layered, route-driven, migration-based system through deliberate structural refactoring.

Every major change reinforced separation of concerns, explicit lifecycle management, IO boundary ownership, route-driven UI state, and backend-authoritative validation.

The result is a small but architecturally mature application suitable as a template for future projects and as a documented milestone in architectural progression.
