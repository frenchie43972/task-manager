/**
 * File: migrations.js
 *
 * Purpose:
 * This module is responsible for applying database migrations.
 *
 * Migrations are version-controlled SQL files that define how the database
 * schema changes over time. Instead of manually modifying the database
 * structure, developers create migration files that describe those changes.
 *
 * This approach provides several benefits:
 *
 * - Database structure is reproducible across environments
 * - Changes are tracked in version control (Git)
 * - New developers or deployments can recreate the schema automatically
 * - Schema evolution becomes predictable and ordered
 *
 * Example migration file:
 *
 *   001_create_tasks_table.sql
 *
 *   CREATE TABLE tasks (
 *     id INTEGER PRIMARY KEY AUTOINCREMENT,
 *     title TEXT NOT NULL,
 *     priority TEXT NOT NULL,
 *     details TEXT,
 *     completed INTEGER DEFAULT 0
 *   );
 *
 * Migration Naming Convention:
 * Files should be ordered so they run in the correct sequence.
 * The simplest pattern is a numeric prefix:
 *
 *   001_create_tasks_table.sql
 *   002_add_due_date_column.sql
 *   003_add_index_to_priority.sql
 *
 * Because files are sorted alphabetically, the numeric prefix ensures
 * migrations run in the intended order.
 *
 * How migrations are used in practice:
 *
 * When you add new SQL that modifies the schema (tables, columns, indexes):
 *
 * 1. Create a new migration file in /migrations
 * 2. Write the SQL change
 * 3. Restart the server or run migrations again
 *
 * The system will:
 * - detect that the migration has not been applied
 * - execute it
 * - record it in the migrations table
 *
 * Migrations are only executed once.
 *
 * Important Rule:
 * Never modify a migration that has already been applied in production.
 * Instead, create a new migration that changes the schema further.
 */

// Node.js promise-based filesystem API (async/await friendly)
import fs from 'fs/promises';

// Path utilities for resolving filesystem paths
import path, { resolve } from 'path';

// Utility to convert ES module URLs to file paths
import { fileURLToPath } from 'url';
import db from './database.js';

/**
 * ES Modules do not provide __filename and __dirname automatically.
 *
 * In CommonJS (older Node.js module system), these variables exist by default.
 * In ES Modules, they must be recreated manually using the module URL.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Absolute path to the directory containing migration SQL files.
 *
 * path.join ensures cross-platform compatibility between
 * Windows, macOS, and Linux file systems.
 */
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

/**
 * Executes a SQL statement that modifies the database.
 *
 * Examples of modifying statements:
 * - INSERT
 * - UPDATE
 * - DELETE
 * - CREATE TABLE
 * - ALTER TABLE
 *
 * sqlite3 uses a callback-based API. This function wraps `db.run`
 * inside a Promise so the rest of the codebase can use async/await.
 *
 * Concept: Promisifying a callback API.
 *
 * Instead of:
 *   db.run(sql, callback)
 *
 * we can write:
 *   await run(sql)
 *
 * which leads to cleaner asynchronous control flow.
 *
 * @param {string} sql - SQL statement to execute
 * @param {Array} params - Optional parameter bindings
 * @returns {Promise<{changes:number,lastID:number}>}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);

      /**
       * sqlite3 provides metadata about the executed statement.
       *
       * `this` refers to the internal statement context.
       *
       * changes → number of rows affected
       * lastID  → id of the last inserted row
       */
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

/**
 * Executes a SQL SELECT query returning multiple rows.
 *
 * This wraps sqlite3's `db.all()` method in a Promise so
 * the rest of the application can use async/await.
 *
 * @param {string} sql - SQL SELECT query
 * @param {Array} params - Optional parameter bindings
 * @returns {Promise<Array>}
 */
function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

/**
 * Runs all pending database migrations.
 *
 * High-level process:
 *
 * 1. Ensure the migrations tracking table exists
 * 2. Read migration files from the filesystem
 * 3. Determine which migrations have already run
 * 4. Execute new migrations in order
 * 5. Record each successful migration
 *
 * The migrations table functions as a "history log"
 * of schema changes applied to the database.
 */
export async function runMigrations() {
  /**
   * This table records which migrations have been applied.
   *
   * filename → name of the migration file
   * applied_at → timestamp when migration ran
   */
  await run(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  /**
   * Read all files in the migrations directory.
   *
   * Steps:
   * 1. Read directory contents
   * 2. Keep only .sql files
   * 3. Sort alphabetically to ensure deterministic order
   */
  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith('.sql'))
    .sort();

  /**
   * Query database to determine which migrations
   * have already been applied.
   */
  const appliedRows = await all(`SELECT filename FROM migrations`);
  /**
   * Convert filenames into a Set for fast lookup.
   *
   * Concept: Sets provide O(1) lookup time and enforce uniqueness.
   */
  const applied = new Set(appliedRows.map((r) => r.filename));

  // Iterate through all migration files
  for (const filename of files) {
    /**
     * Skip migrations that were already applied.
     *
     * This ensures migrations are idempotent and safe to run
     * every time the application starts.
     */
    if (applied.has(filename)) continue;

    // Build absolute path to the migration file
    const fullPath = path.join(MIGRATIONS_DIR, filename);
    // Load the SQL contents of the migration file
    const sql = await fs.readFile(fullPath, 'utf8');

    /**
     * Database Transaction
     *
     * Concept:
     * A transaction groups multiple database operations into
     * a single atomic unit.
     *
     * Either all operations succeed, or all operations fail.
     *
     * This prevents partially applied migrations that could
     * leave the schema in an inconsistent state.
     */
    await run('BEGIN');
    try {
      /**
       * Execute the migration SQL.
       *
       * Migration files may contain statements like:
       * - CREATE TABLE
       * - ALTER TABLE
       * - CREATE INDEX
       */
      await run(sql);

      // Record that this migration has been successfully applied
      await run(`INSERT INTO migrations (filename) VALUES (?)`, [filename]);

      // Commit transaction if everything succeeded
      await run('COMMIT');
    } catch (err) {
      // Roll back all changes if any step fails
      await run('ROLLBACK');
      throw err;
    }
  }
}
