/**
 * File: tasks.queries.js
 *
 * Purpose:
 * This module contains the database access layer for the "tasks" resource.
 * Its responsibility is to interact directly with SQLite using SQL queries.
 *
 * Architecture Concept: Data Access Layer (DAL)
 *
 * The project separates responsibilities into layers:
 *
 *   Routes → Controllers → Query Layer → Database
 *
 * Controllers should not contain SQL. Instead, they call functions defined
 * here. This keeps database logic centralized and easier to maintain.
 *
 * Benefits of this separation:
 * - SQL logic is isolated from HTTP logic
 * - Queries can be reused across controllers
 * - Database implementation can be replaced more easily later
 *
 * This file communicates directly with the sqlite3 database instance.
 */

import db from './database.js';

/**
 * Fetches a list of tasks with optional search, filtering, pagination, and sorting.
 *
 * Parameters:
 *   limit      → number of rows to return
 *   offset     → number of rows to skip
 *   search     → optional search string
 *   completed  → optional completion filter (0 or 1)
 *
 * This function builds a dynamic SQL query depending on which filters exist.
 *
 * Concept: Dynamic Query Construction
 *
 * Instead of writing many different SQL queries, we assemble the WHERE clause
 * based on the filters provided by the API request.
 */
export function getAllTasks(limit, offset, search, completed) {
  return new Promise((resolve, reject) => {
    /**
     * conditions holds fragments of SQL conditions.
     *
     * Example:
     *   ["title LIKE ?", "completed = ?"]
     *
     * Later they will be combined into:
     *
     *   WHERE title LIKE ? AND completed = ?
     */
    const conditions = [];
    /**
     * params stores values that replace SQL placeholders (?).
     *
     * Using placeholders prevents SQL injection and allows the
     * database driver to safely bind user input.
     */
    const params = [];

    /**
     * Optional search filter.
     *
     * LIKE is a SQL operator used for partial text matching.
     *
     * % acts as a wildcard:
     *   %meeting% matches "team meeting", "meeting notes", etc.
     */
    if (search) {
      conditions.push(`(title LIKE ? OR details LIKE ?)`);

      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    /**
     * Optional completed filter.
     *
     * Only applied if the controller passed a value.
     */
    if (completed !== null) {
      conditions.push(`completed = ?`);
      params.push(completed);
    }

    /**
     * Construct the WHERE clause dynamically.
     *
     * If conditions exist:
     *   WHERE condition1 AND condition2
     *
     * If no conditions exist:
     *   (empty string → no WHERE clause)
     */
    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    /**
     * Main query used to fetch paginated rows.
     *
     * ORDER BY created_date DESC ensures newest tasks appear first.
     *
     * LIMIT and OFFSET implement pagination.
     */
    const dataSql = `
    SELECT 
        id, 
        title, 
        priority, 
        details, 
        created_date, 
        updated_date,
        completed 
        FROM tasks
      ${whereClause}
      ORDER BY created_date DESC
      LIMIT ? OFFSET ?
    `;

    /**
     * Separate query used to count total matching rows.
     *
     * Pagination APIs often return both:
     *   - the current page of results
     *   - the total number of records
     *
     * This allows clients (frontends) to render page numbers
     * or calculate how many pages exist.
     */
    const countSql = `
      SELECT COUNT(*) as total
      FROM tasks
      ${whereClause}
    `;

    /**
     * First execute the count query.
     *
     * db.get returns a single row instead of an array.
     */
    db.get(countSql, params, (countErr, countRow) => {
      if (countErr) return reject(countErr);

      const total = countRow.total;

      /**
       * Then execute the main data query.
       *
       * params are reused, but we append pagination values
       * because the SQL includes LIMIT ? OFFSET ? placeholders.
       */
      db.all(dataSql, [...params, limit, offset], (dataErr, rows) => {
        if (dataErr) return reject(dataErr);

        /**
         * The Promise resolves with both:
         * - rows  → actual data
         * - total → number of matching rows
         */
        resolve({
          rows,
          total,
        });
      });
    });
  });
}

/**
 * Fetches a single task by ID.
 *
 * Returns:
 *   - the task object if found
 *   - undefined if no task exists with that ID
 */
export function getTaskById(id) {
  return new Promise((resolve, reject) => {
    /**
     * ? is a parameter placeholder.
     *
     * This prevents SQL injection because sqlite3
     * safely escapes the value.
     */
    const sql = `
        SELECT 
          id, 
          title, 
          priority, 
          details, 
          created_date, 
          updated_date,
          completed 
        FROM tasks 
        WHERE id = ?
      `;

    // db.get returns a SINGLE row instead of an array
    db.get(sql, [id], (err, row) => {
      if (err) {
        return reject(err);
      }
      // row will be `undefined` if no task matches the ID
      resolve(row);
    });
  });
}

/**
 * Creates a new task.
 *
 * This inserts a new record into the tasks table.
 */
export function createTask({ title, priority, details }) {
  return new Promise((resolve, reject) => {
    /**
     * INSERT statement adds a new row.
     *
     * The ? placeholders are replaced by the values
     * in the params array.
     */
    const sql = `INSERT INTO tasks (title, priority, details) VALUES (?, ?, ?)`;
    const params = [title, priority, details];

    /**
     * db.run executes SQL statements that modify data.
     *
     * Examples:
     * - INSERT
     * - UPDATE
     * - DELETE
     */
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      /**
       * sqlite3 attaches metadata to the statement context.
       *
       * lastID = primary key generated by the INSERT.
       */
      resolve({
        id: this.lastID,
      });
    });
  });
}

/**
 * Deletes a task by ID.
 */
export function deleteTaskById(id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM tasks WHERE id = ?`;

    db.run(sql, [id], function (err) {
      if (err) {
        return reject(err);
      }

      /**
       * changes indicates how many rows were affected.
       *
       * If changes === 0:
       *   no task existed with that ID.
       */
      resolve({
        changes: this.changes,
      });
    });
  });
}

/**
 * Updates an existing task by ID.
 *
 * All fields are replaced with the provided values.
 */
export function updateTaskById(id, { title, priority, details, completed }) {
  return new Promise((resolve, reject) => {
    /**
     * UPDATE modifies an existing row.
     *
     * updated_date is automatically refreshed using
     * SQLite's CURRENT_TIMESTAMP function.
     */
    const sql = `
      UPDATE tasks
      SET title = ?, 
        priority = ?, 
        details = ?, 
        completed = ?,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    /**
     * Values must appear in the same order as the
     * placeholders in the SQL statement.
     */
    const params = [title, priority, details, completed, id];

    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      /**
       * changes indicates whether a row was updated.
       *
       * If 0 → no matching task ID existed.
       */
      resolve({
        changes: this.changes,
      });
    });
  });
}
