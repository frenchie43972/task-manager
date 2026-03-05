/**
 * File: server.js
 *
 * Purpose:
 * This is the main entry point of the backend application. It initializes
 * the Express server, configures middleware, runs database migrations,
 * mounts route modules, and starts the HTTP server.
 *
 * Concept: Application Bootstrap
 *
 * A bootstrap file is responsible for preparing the application environment
 * before handling requests. Typical responsibilities include:
 *
 * - Initializing the database
 * - Running migrations
 * - Registering middleware
 * - Mounting routes
 * - Starting the server
 *
 * This file does NOT contain business logic. It simply wires together
 * the components defined elsewhere in the project.
 */

import express from "express";
/**
 * Import the router responsible for handling /tasks endpoints.
 * The router itself maps URLs to controller functions.
 */
import router from "./routes/tasksRouter.js";

/**
 * CORS middleware allows browsers to call this API from
 * a different origin (domain/port).
 *
 * Without CORS enabled, modern browsers block requests
 * from frontend apps hosted on another port or domain.
 */
import cors from "cors";

/**
 * Importing the database ensures the connection is initialized
 * when the server starts.
 *
 * Even if this variable is not directly used here, importing it
 * guarantees the database module runs and opens the connection.
 */
import db from "./db/database.js";

/**
 * Migration runner.
 *
 * Migrations ensure the database schema is up-to-date before the
 * server begins handling requests.
 */
import { runMigrations } from "./db/migrate.js";

/**
 * Centralized error-handling middleware.
 */
import { errorHandler } from "./middleware/errorHandler.js";

/**
 * Create the Express application instance.
 *
 * The Express app acts as the central object for configuring
 * middleware, routes, and server behavior.
 */
const app = express();
/**
 * Port the server will listen on.
 *
 * In production applications this is often set using
 * environment variables instead of hardcoding the value.
 */
const port = 3000;

const taskRouter = router;

/**
 * Run database migrations before starting the server.
 *
 * Concept: Top-level await
 *
 * Because this file uses ES modules, Node.js allows the use of
 * `await` at the top level of the module. This means the server
 * will pause here until migrations complete.
 *
 * This guarantees the database schema exists before the API
 * begins accepting requests.
 */
await runMigrations();

/**
 * Built-in Express middleware for parsing JSON request bodies.
 *
 * Example:
 *
 * Client sends:
 * {
 *   "title": "Buy groceries"
 * }
 *
 * Express converts that JSON into:
 *   req.body
 */
app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

// You have to mount routes before you are able to use them
app.use("/tasks", taskRouter);

/**
 * IMPORTANT:
 * Error-handling middleware must be registered LAST.
 *
 * Express processes middleware in the order they are registered.
 * If this middleware were earlier in the chain, it would not catch
 * errors from routes defined later.
 *
 * When a controller calls:
 *
 *   next(err)
 *
 * Express jumps directly to this middleware.
 */
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
