import express from 'express';
import {
  getAllTasks,
  getTaskById,
  createTask,
  deleteTask,
  updateTask,
} from '../controllers/tasksController.js';

const router = express.Router();

router.get('/', getAllTasks);

router.get('/:id', getTaskById);

router.post('/', createTask);

router.delete('/:id', deleteTask);

router.put('/:id', updateTask);

export default router;
