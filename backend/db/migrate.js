// Node.js promise-based filesystem API (async/await friendly)
import fs from "fs/promises";

// Path utilities for resolving filesystem paths
import path, { resolve } from "path";

// Utility to convert ES module URLs to file paths
import { fileURLToPath } from "url";
import db from "./database.js";

// ES modules do not have __filename / __dirname by default,
// so these two lines recreate them manually
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to the migrations directory
const MIGRATIONS_DIR = path.join(__dirname, "migrations");

/**
 *
 * Executes a SQL statement that modifies the database
 * (INSERT, UPDATE, DELETE, CREATE, etc.)
 *
 * Wraps sqlite3's callback-based `db.run` in a Promise
 * so it can be awaited.
 *
 * @param {string} sql - SQL query to execute
 * @param {Array} params - Optional parameter bindings
 * @returns {Promise<{changes: number, lastID: number}>}
 */
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);

      // `this` refers to the statement context provided by sqlite3
      // changes = number of rows affected
      // lastID = ID of the last inserted row (if applicable)
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

/**
 * Executes a SQL SELECT query that returns multiple rows
 *
 * Wraps sqlite3's `db.all` in a Promise for async/await usage.
 *
 * @param {string} sql - SQL SELECT query
 * @param {Array} params - Optional parameter bindings
 * @returns {Promise<Array>} - Result rows
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
 * - Creates a migrations table if it does not exist
 * - Reads .sql files from the migrations directory
 * - Skips migrations that have already been applied
 * - Runs each migration inside a transaction
 */
export async function runMigrations() {
  await run(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Read all files in the migrations directory,
  // keep only .sql files, and sort them alphabetically
  // (ensures migrations run in a predictable order)
  const files = (await fs.readdir(MIGRATIONS_DIR))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  // Fetch filenames of migrations that have already been applied
  const appliedRows = await all(`SELECT filename FROM migrations`);
  // Convert applied filenames into a Set for fast lookup
  // Utilizes Set() to guarantee uniqueness so duplicates are automatically discarded
  const applied = new Set(appliedRows.map((r) => r.filename));

  // Iterate through all migration files
  for (const filename of files) {
    // Skip migration if it has already been applied
    if (applied.has(filename)) continue;

    // Build absolute path to the migration file
    const fullPath = path.join(MIGRATIONS_DIR, filename);
    // Read the SQL contents of the migration file
    const sql = await fs.readFile(fullPath, "utf8");

    // Start a database transaction
    await run("BEGIN");
    try {
      // Execute migration SQL
      await run(sql);

      // Record that this migration has been applied
      await run(`INSERT INTO migrations (filename) VALUES (?)`, [filename]);

      // Commit transaction if everything succeeded
      await run("COMMIT");
    } catch (err) {
      // Roll back all changes if any step fails
      await run("ROLLBACK");
      throw err;
    }
  }
}
