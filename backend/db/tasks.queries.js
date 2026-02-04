import db from './database.js';

/*
  This function exists for ONE reason:
  It fetches multiple task rows from the database.
  Because MANY rows are expected, intentionally use db.all().
*/
export function getAllTasks(limit, offset) {
  return new Promise((resolve, reject) => {
    // IMPORTANT CONCEPT:
    // Every ? in the SQL string MUST have a matching value
    // in the params array, in the SAME ORDER.
    const sql = `
      SELECT 
        id, 
        title, 
        priority, 
        details, 
        created_date, 
        updated_date 
      FROM tasks
      ORDER BY created_date 
      LIMIT ? OFFSET ?
    `;

    const params = [limit, offset];

    db.all(sql, params, (err, rows) => {
      // Database errors should not know about HTTP
      // reject and let the controller decide how to respond
      if (err) {
        return reject(err);
      }

      resolve(rows);
    });
  });
}

/*
  Fetch exactly ONE task by its ID.
  We expect at most one row.
  That is why db.get() is used instead of db.all().
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

    // db.get() returns:
    // - a single row object if found
    // - undefined if no row matches
    db.get(sql, [id], (err, row) => {
      if (err) {
        return reject(err);
      }
      resolve(row);
    });
  });
}

/*
  Insert a new task into the database.
  This is a WRITE operation, not a read.
  db.run() is used for commands that change state.
*/
export function createTask({ title, priority, details }) {
  return new Promise((resolve, reject) => {
    const sql = `INSERT INTO tasks (title, priority, details) VALUES (?, ?, ?)`;

    const params = [title, priority, details];

    /*
      db.run() does NOT return rows.
      Instead, SQLite exposes metadata through `this`:
      - this.lastID   -> the ID of the newly inserted row
      - this.changes  -> how many rows were affected
    */
    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      resolve({
        id: this.lastID,
      });
    });
  });
}

/*
  Delete a task by ID.
  - This changes database state.
  - db.run() is required.
*/
export function deleteTaskById(id) {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM tasks WHERE id = ?`;

    db.run(sql, [id], function (err) {
      if (err) {
        return reject(err);
      }

      /*
        this.changes tells us how many rows were affected.
        - 0 means no task matched that ID
        - 1 means one task was deleted
      */
      resolve({
        changes: this.changes,
      });
    });
  });
}

/*
  Update an existing task.
  - This changes state, so db.run() is required.
  - We rely on this.changes to know if anything was updated.
*/
export function updateTaskById(id, { title, priority, details }) {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE tasks
      SET title = ?, priority = ?, details = ?, updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const params = [title, priority, details, id];

    db.run(sql, params, function (err) {
      if (err) {
        return reject(err);
      }

      /*
        this.changes:
        - 0 means no task matched the ID
        - 1 means the task was updated
      */
      resolve({
        changes: this.changes,
      });
    });
  });
}
