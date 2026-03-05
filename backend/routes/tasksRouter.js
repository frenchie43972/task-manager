/**
 * File: tasksRouter.js
 *
 * Purpose:
 * This file defines the HTTP routes for the "tasks" resource and maps
 * each route to a corresponding controller function.
 *
 * Architecture Concept: Routing Layer
 *
 * In an Express application, routing determines which controller function
 * runs when a specific HTTP request is received.
 *
 * The routing layer acts as a lightweight mapping between:
 *
 *   HTTP request → controller function
 *
 * Routes should remain simple and should not contain business logic.
 * Their primary job is to connect URLs and HTTP methods to controllers.
 *
 * Typical project structure:
 *
 *   routes/        → defines HTTP endpoints
 *   controllers/   → contains request handling logic
 *   db/queries/    → contains SQL queries
 *
 * This separation keeps the codebase easier to maintain and reason about.
 */

import express from "express";
import {
  getAll,
  getById,
  create,
  remove,
  update,
} from "../controllers/tasksController.js";

/**
 * Express Router
 *
 * Router allows grouping related routes into a modular unit.
 *
 * Instead of defining routes directly in the main server file,
 * routers allow splitting large applications into smaller,
 * resource-specific modules.
 *
 * Example structure:
 *
 *   /routes/tasks.routes.js
 *   /routes/users.routes.js
 *   /routes/auth.routes.js
 */
const router = express.Router();

router.get("/", getAll);

router.get("/:id", getById);

router.post("/", create);

router.delete("/:id", remove);

router.put("/:id", update);

export default router;
