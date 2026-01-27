import express from 'express';
import router from './routes/tasksRouter.js';
import cors from 'cors';
import db from './db/database.js';

const app = express();
const port = 3000;

const taskRouter = router;

app.use(express.json());

// app.use(cors({ origin: 'http://localhost:5173' }));

// You have to mount routes before you are able to use them
app.use('/tasks', taskRouter);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
