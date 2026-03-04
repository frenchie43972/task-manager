/**
 * File: tasks.controller.js
 *
 * Purpose:
 * This file contains the HTTP controller logic for the "tasks" resource.
 * Controllers act as the layer between the HTTP request/response cycle
 * (Express routes) and the database/data-access layer.
 *
 * Responsibilities:
 * - Parse and validate incoming request data (params, query, body)
 * - Call database query functions
 * - Format the HTTP response
 * - Pass errors to centralized error middleware
 *
 * Architecture Concept:
 * This project follows a layered structure:
 *
 *   Route → Controller → Query/Data Layer → Database
 *
 * Routes determine *which controller function runs*.
 * Controllers handle *request logic and validation*.
 * Query functions perform *database operations*.
 *
 * This separation keeps business logic out of route files
 * and database logic out of controllers.
 */
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
 * Allowed priority values for tasks.
 *
 * Concept: Whitelisting / Input validation.
 *
 * Instead of accepting arbitrary strings, we restrict the values
 * to a predefined set. This prevents inconsistent data such as:
 *
 *   "high", "HIGH", "urgent", etc.
 *
 * Using a constant also keeps validation logic centralized and reusable.
 */

const ALLOWED_PRIORITIES = ['High', 'Medium', 'Low'];

/**
 * Parses and validates an ID from route parameters.
 *
 * Example route:
 *   GET /tasks/:id
 *
 * req.params.id arrives as a string. This function:
 *
 * 1. Converts it to a number
 * 2. Ensures it is an integer
 * 3. Ensures it is greater than zero
 *
 * If validation fails, an Error is thrown with a status code.
 *
 * Concept: Centralized validation helper.
 *
 * Throwing errors allows Express error middleware to handle
 * responses consistently instead of repeating error responses
 * in every controller.
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
 * Example request:
 *   GET /tasks?limit=10&offset=20
 *
 * limit  → how many records to return
 * offset → how many records to skip
 *
 * This function:
 * - Converts values to numbers
 * - Applies defaults
 * - Enforces safe bounds
 *
 * Concept: Pagination
 *
 * Pagination prevents returning the entire dataset at once,
 * which improves performance and reduces network load.
 */
function parsePagination(query) {
  /**
   * Number(query.limit) may return NaN if the value is invalid.
   * `|| 10` provides a default.
   *
   * Math.max ensures the value is at least 1.
   * Math.min ensures the value does not exceed MAX_LIMIT.
   */
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), MAX_LIMIT);

  /**
   * Offset must never be negative.
   * Default is 0 (start at the beginning).
   */
  const offset = Math.max(Number(query.offset) || 0, 0);

  return { limit, offset };
}

/**
 * Normalizes the search query parameter.
 *
 * Example:
 *   GET /tasks?search=meeting
 *
 * This function guarantees a string result and removes
 * unnecessary whitespace.
 *
 * Returning an empty string signals the query layer
 * that no search filter should be applied.
 */
function parseSearch(query) {
  if (typeof query.search !== 'string') return '';

  const trimmed = query.search.trim();

  // Empty strings are treated as no search
  return trimmed === '' ? '' : trimmed;
}

/**
 * Parses a completed filter from query parameters.
 *
 * Example:
 *   GET /tasks?completed=1
 *
 * Convention used here:
 *   1 → completed
 *   0 → not completed
 *
 * Returning `null` means "no filter applied".
 */
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
 *
 * Request example:
 *   GET /tasks?limit=10&offset=0&search=meeting
 *
 * Flow:
 * 1. Parse and validate query parameters
 * 2. Call the database query function
 * 3. Return structured JSON
 */
export async function getAll(req, res, next) {
  try {
    // Extract validated pagination values
    const { limit, offset } = parsePagination(req.query);
    // Extract normalized search string
    const search = parseSearch(req.query);

    // Optional filter for completed tasks
    const completed = parseCompleted(req.query);

    /**
     * Call the database query layer.
     *
     * Separation of concerns:
     * The controller does not know SQL details.
     * It only passes parameters to the query function.
     */
    const result = await getAllTasks(limit, offset, search, completed);

    /**
     * Response structure includes:
     * - data: task rows
     * - total: total number of rows matching query
     * - limit/offset: pagination metadata
     */
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
 *
 * Example request body:
 * {
 *   "title": "Buy groceries",
 *   "priority": "High",
 *   "details": "Milk, eggs, bread"
 * }
 */
export async function create(req, res, next) {
  try {
    const { title, priority, details } = req.body;

    /**
     * Input validation.
     *
     * APIs should validate all external input to prevent:
     * - malformed data
     * - inconsistent database state
     */
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (
      typeof priority !== 'string' ||
      !ALLOWED_PRIORITIES.includes(priority)
    ) {
      return res
        .status(400)
        .json({ error: 'Priority must be High, Medium, or Low' });
    }

    /**
     * Normalize payload before sending to database.
     *
     * Example:
     * - Trim whitespace from title
     * - Ensure details is always a string
     */
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

    /**
     * Many SQL drivers return a "changes" count.
     *
     * If changes === 0:
     * - No row matched the ID
     * - The resource does not exist
     */
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

    if (
      typeof priority !== 'string' ||
      !ALLOWED_PRIORITIES.includes(priority)
    ) {
      return res
        .status(400)
        .json({ error: 'Priority must be High, Medium, or Low' });
    }

    /**
     * Normalize update payload.
     *
     * completed is stored as an integer (0 or 1)
     * because many SQL databases use numeric booleans.
     */
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
