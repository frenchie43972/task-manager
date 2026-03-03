import db from './database.js';

/**
 * Fetches a list of tasks with optional search, pagination, and sorting.
 *
 * This function returns a Promise so callers can use `await`.
 */
export function getAllTasks(limit, offset, search, completed) {
  return new Promise((resolve, reject) => {
    const conditions = [];
    const params = [];

    if (search) {
      conditions.push(`(title LIKE ? OR details LIKE ?)`);

      const pattern = `%${search}%`;
      params.push(pattern, pattern);
    }

    if (completed !== null) {
      conditions.push(`completed = ?`);
      params.push(completed);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

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

    const countSql = `
      SELECT COUNT(*) as total
      FROM tasks
      ${whereClause}
    `;

    // First get the total count
    db.get(countSql, params, (countErr, countRow) => {
      if (countErr) return reject(countErr);

      const total = countRow.total;

      // Then get the paginated rows

      /**
       * db.all executes the query and returns ALL matching rows.
       *
       * The callback is async-style:
       *   - err is non-null if something failed
       *   - rows is the query result if successful
       */
      db.all(dataSql, [...params, limit, offset], (dataErr, rows) => {
        if (dataErr) return reject(dataErr);

        // Resolves the Promise → caller receives rows
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
export function updateTaskById(id, { title, priority, details, completed }) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tasks
      SET title = ?, 
        priority = ?, 
        details = ?, 
        completed = ?,
        updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    // Order matters: values match the ? placeholders top to bottom
    const params = [title, priority, details, completed, id];

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
