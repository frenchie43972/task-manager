import db from '../db/database.js';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
} from '../db/tasks.queries.js';

// Upper bound for pagination size to prevent large queries
const MAX_LIMIT = 50;

/**
 * Parses and validates an ID from route params.
 *
 * Ensures:
 * - value is a number
 * - value is an integer
 * - value is greater than 0
 *
 * Throws an error instead of returning a response so it can be
 * handled by Express error middleware.
 */
function parseId(raw) {
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error('Invalid task ID');

    err.status = 400;
    throw err;
  }
  return id;
}

/**
 * Parses pagination values from query parameters.
 *
 * Applies:
 * - default values
 * - numeric coercion
 * - minimum and maximum bounds
 */
function parsePagination(query) {
  // Number(query.limit) may be NaN; `|| 10` provides a default
  // Math.max ensures at least 1
  // Math.min enforces MAX_LIMIT
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), MAX_LIMIT);

  // Offset must be 0 or greater
  const offset = Math.max(Number(query.offset) || 0, 0);

  return { limit, offset };
}

/**
 * Normalizes the search query parameter.
 *
 * Guarantees a string return value.
 */
function parseSearch(query) {
  if (typeof query.search !== 'string') return '';

  const trimmed = query.search.trim();

  // Empty strings are treated as no search
  return trimmed === '' ? '' : trimmed;
}

function parseCompleted(query) {
  if (query.completed === undefined) return null;

  const value = Number(query.completed);

  if (value !== 0 && value !== 1) {
    const err = new Error('Invalid completed filter');

    err.status = 400;
    throw err;
  }

  return value;
}

/**
 * GET /tasks
 *
 * Returns a paginated list of tasks.
 */
export async function getAll(req, res, next) {
  try {
    // Extract validated pagination values
    const { limit, offset } = parsePagination(req.query);
    // Extract normalized search string
    const search = parseSearch(req.query);

    const completed = parseCompleted(req.query);

    // Fetch tasks from the database layer
    const result = await getAllTasks(limit, offset, search, completed);

    // Respond with data and pagination metadata
    res.json({
      data: result.rows,
      total: result.total,
      limit,
      offset,
    });
  } catch (err) {
    // Pass errors to centralized error handler ./middleware/errorHandler.js
    next(err);
  }
}

/**
 * GET /tasks/:id
 *
 * Returns a single task by ID.
 */
export async function getById(req, res, next) {
  try {
    // Validate and parse ID from route params
    const id = parseId(req.params.id);
    const task = await getTaskById(id);

    // If no row was returned, task does not exist
    if (!task) {
      return res.status(404).json({ err: 'Task not found.' });
    }

    res.json({ data: task });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /tasks
 *
 * Creates a new task.
 */
export async function create(req, res, next) {
  try {
    const { title, priority, details } = req.body;

    // Input validation
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }

    // Normalized payload sent to database layer
    const payload = {
      title: title.trim(),
      priority,
      details: typeof details === 'string' ? details : '',
    };

    const result = await createTask(payload);

    // 201 Created with new resource data
    res.status(201).json({
      data: {
        id: result.id,
        ...payload,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /tasks/:id
 *
 * Deletes a task by ID.
 */
export async function remove(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const result = await deleteTaskById(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /tasks/:id
 *
 * Updates an existing task.
 */
export const update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { title, priority, details, completed } = req.body;

    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!priority) {
      return res.status(400).json({ error: 'Priority is required' });
    }

    const payload = {
      title: title.trim(),
      priority,
      details: typeof details === 'string' ? details : '',
      completed: completed ? 1 : 0,
    };

    const result = await updateTaskById(id, payload);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({
      data: {
        id,
        ...payload,
      },
    });
  } catch (err) {
    next(err);
  }
};
