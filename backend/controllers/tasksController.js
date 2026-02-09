import db from '../db/database.js';
import {
  getAllTasks,
  getTaskById,
  createTask,
  updateTaskById,
  deleteTaskById,
} from '../db/tasks.queries.js';

const MAX_LIMIT = 50;

function parseId(raw) {
  const id = Number(raw);

  if (!Number.isInteger(id) || id <= 0) {
    const err = new Error('Invalid task ID');

    err.status = 400;
    throw err;
  }
  return id;
}

function parsePagination(query) {
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), MAX_LIMIT);

  const offset = Math.max(Number(query.offset) || 0, 0);

  return { limit, offset };
}

function parseSearch(query) {
  if (typeof query.search !== 'string') return '';

  const trimmed = query.search.trim();

  return trimmed === '' ? '' : trimmed;
}

export async function getAll(req, res, next) {
  try {
    const { limit, offset } = parsePagination(req.query);
    const search = parseSearch(req.query);

    const tasks = await getAllTasks(limit, offset, search);

    res.json(tasks);
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = parseId(req.params.id);
    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({ err: 'Task not found.' });
    }

    res.json(task);
  } catch (err) {
    next(err);
  }
}

export async function create(req, res, next) {
  try {
    const { title, priority, details } = req.body;

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
    };

    const result = await createTask(payload);

    res.status(201).json({
      id: result.id,
      ...payload,
    });
  } catch (err) {
    next(err);
  }
}

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

export const update = async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    const { title, priority, details } = req.body;

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
    };

    const result = await updateTaskById(id, payload);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ id, ...payload });
  } catch (err) {
    next(err);
  }
};
