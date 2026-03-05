/**
 * File: database.js
 *
 * Purpose:
 * This module initializes and exports the SQLite database connection used
 * throughout the backend. Other parts of the application import this module
 * whenever they need to run SQL queries.
 *
 * Architecture Concept: Shared Database Connection
 *
 * Instead of opening a new database connection in every file, the application
 * creates one connection here and exports it. Any module that imports this
 * file receives the same database instance.
 *
 * This pattern avoids unnecessary connections and keeps database access
 * centralized.
 *
 * Typical usage elsewhere in the project:
 *
 *   import db from "./database.js";
 *   db.get(...)
 *   db.run(...)
 *
 * SQLite Notes:
 * SQLite is a file-based database. Unlike systems such as PostgreSQL or MySQL,
 * the entire database lives inside a single file (tasks.sqlite).
 *
 * When the application starts:
 * - If the file exists → SQLite opens it
 * - If the file does not exist → SQLite creates it automatically
 */

import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

/**
 * ES Modules and File Paths
 *
 * In older Node.js CommonJS modules, the variables `__filename`
 * and `__dirname` exist automatically.
 *
 * In ES modules (which this project uses), those variables are not available.
 * Instead, Node provides the module URL through `import.meta.url`.
 *
 * fileURLToPath converts that URL into a standard filesystem path.
 */
const __filename = fileURLToPath(import.meta.url);

/**
 * Extract the directory containing this file.
 *
 * This recreates the behavior of the CommonJS `__dirname` variable.
 */
const __dirname = path.dirname(__filename);

/**
 * Absolute path to the SQLite database file.
 *
 * path.resolve ensures the path is absolute rather than relative.
 * This prevents issues where the server might start from different
 * working directories.
 *
 * The database file will live in the same directory as this module:
 *
 *   /db/tasks.sqlite
 */
const dbPath = path.resolve(__dirname, "tasks.sqlite");

/**
 * Create or open the SQLite database.
 *
 * sqlite3.Database(path, callback)
 *
 * Behavior:
 * - If the file exists → open it
 * - If the file does not exist → create it
 *
 * The callback runs once the connection attempt finishes.
 */
const db = new sqlite3.Database(dbPath, (err) => {
  /**
   * If the database connection fails, log the error.
   * In production systems, you might terminate the application here.
   */
  if (err) {
    console.error("Failed to connect to the database", err);
    return;
  }

  console.log("Database connected");
});

export default db;
