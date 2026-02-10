import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Determines the absolute path of this file so database paths
// are reliable regardless of where the server is started from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Builds and resolves paths so they work no matter where the app is started from
const dbPath = path.resolve(__dirname, "tasks.sqlite");

// Open the DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to the database", err);
    return;
  }

  console.log("Database connected");
});

export default db;
