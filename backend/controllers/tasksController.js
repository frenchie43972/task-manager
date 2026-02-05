import db from "../db/database.js";
import {
  getAllTasks as getAllTasksQuery,
  getTaskById as getTaskByIdQuery,
  createTask as createTaskQuery,
  deleteTaskById as deleteTaskByIdQuery,
  updateTaskById as updateTaskByIdQuery,
} from "../db/tasks.queries.js";

export const getAllTasks = async (req, res, next) => {
  // Read query params from the URL: /tasks?limit=10&offset=0
  // These arrive as strings, so we must convert them to numbers.
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = parseInt(req.query.offset, 10) || 0;

  const search = req.query.search || "";

  try {
    // The controller no longer cares HOW tasks are fetched,
    // only that it receives an array of tasks.
    const tasks = await getAllTasksQuery(limit, offset, search);

    res.json(tasks);
  } catch (err) {
    // HTTP-level error handling taken care of by the handler response
    next(err);
  }
};

export const getTaskById = async (req, res, next) => {
  const id = Number(req.params.id);

  // Guards early against invalid input
  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const task = await getTaskByIdQuery(id);

    // if db.get() returns undefined, throw this error
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }
    res.json(task);
  } catch (err) {
    next(err);
  }
};

export const createTask = async (req, res, next) => {
  const { title, priority, details } = req.body;

  // These two checks define what is REQUIRED at the HTTP boundary
  if (!title || !priority) {
    return res.status(400).json({ error: "Title and priority are required" });
  }

  try {
    const result = await createTaskQuery({
      title,
      priority,
      details: details || "",
    });

    /*
      I now know explicitly what is returning:
      - The ID of the newly created task
      - Not a random side effect of SQLite
    */
    res.status(201).json({
      id: result.id,
      title,
      priority,
      details: details || "",
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTask = async (req, res, next) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return res.status(400).json({ error: "Invalid task ID" });
  }

  try {
    const result = await deleteTaskByIdQuery(id);

    // If no rows were deleted, the task did not exist
    if (result.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (req, res, next) => {
  const { id } = req.params;
  const { title, priority, details } = req.body;

  if (!title || !priority) {
    return res.status(400).json({ error: "Title and priority are required" });
  }

  try {
    const result = await updateTaskByIdQuery(id, {
      title,
      priority,
      details: details || "",
    });

    if (result.changes === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json({
      id,
      title,
      priority,
      details: details || "",
    });
  } catch (err) {
    next(err);
  }
};
