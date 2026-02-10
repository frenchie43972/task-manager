import express from "express";
import router from "./routes/tasksRouter.js";
import cors from "cors";
import db from "./db/database.js";

import { runMigrations } from "./db/migrate.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const port = 3000;

const taskRouter = router;

await runMigrations();

app.use(express.json());

app.use(cors({ origin: "http://localhost:5173" }));

// You have to mount routes before you are able to use them
app.use("/tasks", taskRouter);

// IMPORTANT:
// error-handling middleware must be last
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
