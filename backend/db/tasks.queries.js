import db from "./database.js";

/**
 * Fetches a list of tasks with optional search, pagination, and sorting.
 *
 * This function returns a Promise so callers can use `await`.
 */
export function getAllTasks(limit, offset, search) {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT 
        id, 
        title, 
        priority, 
        details, 
        created_date, 
        updated_date 
      FROM tasks
    `;

    // Array of values that will replace the `?` placeholders in SQL
    const params = [];

    if (search) {
      // Add WHERE clause only if a search term is provided
      sql += `WHERE title LIKE ? OR details LIKE ?`;

      // %term% allows partial matches in SQL LIKE
      const pattern = `%${search}%`;
      // These values map to the two ? placeholders above
      params.push(pattern, pattern);
    }

    sql += `
      ORDER BY created_date DESC
      LIMIT ? OFFSET ?
    `;

    // These values replace the LIMIT ? and OFFSET ? placeholders
    params.push(limit, offset);

    /**
     * db.all executes the query and returns ALL matching rows.
     *
     * The callback is async-style:
     *   - err is non-null if something failed
     *   - rows is the query result if successful
     */
    db.all(sql, params, (err, rows) => {
      if (err) {
        // Rejects the Promise → caller's await throws an error
        return reject(err);
      }

      // Resolves the Promise → caller receives rows
      resolve(rows);
    });
  });
}

/**
 * Fetches a single task by ID.
 */
export function getTaskById(id) {
  return new Promise((resolve, reject) => {
    const sql = `
        SELECT 
          id, 
          title, 
          priority, 
          details, 
          created_date, 
          updated_date 
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
 */
export function createTask({ title, priority, details }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tasks (title, priority, details) VALUES (?, ?, ?)`;
    // These values replace the ? placeholders in order
    const params = [title, priority, details];

    /**
     * db.run is used for INSERT/UPDATE/DELETE queries.
     *
     * The callback's `this` is bound to the SQL statement context.
     */
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      // lastID is the auto-generated primary key from the INSERT
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

      // changes = number of rows affected (0 or 1 here)
      resolve({
        changes: this.changes,
      });
    });
  });
}

/**
 * Updates an existing task by ID.
 */
export function updateTaskById(id, { title, priority, details }) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tasks
      SET title = ?, priority = ?, details = ?, updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    // Order matters: values match the ? placeholders top to bottom
    const params = [title, priority, details, id];

    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      // changes indicates whether a row was actually updated
      resolve({
        changes: this.changes,
      });
    });
  });
}
