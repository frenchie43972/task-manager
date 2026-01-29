import db from "../db/database.js";
import { error } from "console";

/*
  GET /tasks
  Returns all notes from the database
*/
export function getAllTasks(req, res) {
  const sql = `SELECT id, title, priority, details, created_date, updated_date FROM tasks`;

  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: "Failed to fetch tasks" });

      return;
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
      res.status(500).json({ error: "Failed to fetch task(s)" });

      return;
    }
    if (!row) {
      res.status(404).json({ error: "Task not found" });

      return;
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

  const safeDetails = details || null;

  if (!title || !priority) {
    res
      .status(400)
      .json({ error: "title, priority, and details are required" });

    return;
  }

  const sql = `INSERT INTO tasks (title, priority, details) VALUES (?, ?, ?)`;

  db.run(sql, [title, priority, safeDetails], function (err) {
    if (err) {
      res.status(500).json({ error: "Failed to create task" });

      return;
    }

    res.status(201).json({
      id: this.lastID,
      title,
      priority,
      details,
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
      res.status(500).json({ error: "Failed to delete task" });

      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Task noty found" });

      return;
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

  const sql = `
      UPDATE tasks
      SET title = ?, priority = ?, details = ? updated_date = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

  db.run(sql, [title, priority, details, id], function (err) {
    if (err) {
      res.status(500).json({ error: "Failed to update task" });

      return;
    }

    if (this.changes === 0) {
      res.status(404).json({ error: "Task not found" });

      return;
    }

    res.status(200).json({
      id,
      title,
      details,
    });
  });
}
