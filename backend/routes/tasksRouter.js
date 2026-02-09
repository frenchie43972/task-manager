import express from 'express';
import {
  getAll,
  getById,
  create,
  remove,
  update,
} from '../controllers/tasksController.js';

const router = express.Router();

router.get('/', getAll);

router.get('/:id', getById);

router.post('/', create);

router.delete('/:id', remove);

router.put('/:id', update);

export default router;
