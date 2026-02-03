import db from "../db/database.js";

/*
  GET /tasks
  Returns all notes from the database
*/
export function getAllTasks(req, res) {
  // Parse pagination parameters from the query string
  const limit = Number(req.query.limit) || 20;
  const offset = Number(req.query.offset) || 0;

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
  `;

  db.all(sql, [limit, offset], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
    res.json(rows);
  });
}

/*
  GET tasks/:id
  Returns one or more note by id
*/
export function getTaskById(req, res) {
  const { id } = req.params;

  const sql = `SELECT id, title, priority, details, created_date, updated_date FROM tasks WHERE id = ?`;

  db.get(sql, [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: "Failed to fetch task(s)" });
    }
    if (!row) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(row);
  });
}

/*
  POST /tasks
  Creates a task after input validation
*/
export function createTask(req, res) {
  const { title, priority, details } = req.body;

  const safeDetails = details || "";

  if (!title || !priority) {
    return res
      .status(400)
      .json({ error: "title, priority, and details are required" });
  }

  const sql = `INSERT INTO tasks (title, priority, details) VALUES (?, ?, ?)`;

  db.run(sql, [title, priority, safeDetails], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    db.get("SELECT * FROM tasks WHERE id = ?", [this.lastID], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.status(201).json(row);
    });
  });
}

/*
  DELETE /tasks/:id
  Deletes a task by its id
*/
export function deleteTask(req, res) {
  const { id } = req.params;

  const sql = `DELETE FROM tasks WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: "Failed to delete task" });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Task noty found" });
    }

    res.status(204).send();
  });
}

/*
  PUT /tasks/:id
  Update an existing task's title, body, and updated_date.
*/
export function updateTask(req, res) {
  const { id } = req.params;
  const { title, priority, details } = req.body;

  if (!title || !priority) {
    return res.status(400).json({ error: "title and priority are required" });
  }

  const safeDetails = details ?? "";

  const sql = `
      UPDATE tasks
      SET title = ?, priority = ?, details = ?, updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

  db.run(sql, [title, priority, safeDetails, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(row);
    });
  });
}
