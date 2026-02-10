import sqlite3 from "sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Converts the current module's URL (ES modules use URLs, not file paths)
// into a standard filesystem path string
const __filename = fileURLToPath(import.meta.url);

// Extracts the directory name from the full file path
// This recreates __dirname, which does not exist in ES modules by default
const __dirname = path.dirname(__filename);

// Builds an absolute path to the SQLite database file
// path.resolve ensures the result is an absolute path,
// regardless of where the app is started from
const dbPath = path.resolve(__dirname, "tasks.sqlite");

// Creates (or opens) a SQLite database connection
// If the file does not exist, SQLite will create it
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Failed to connect to the database", err);
    return;
  }

  console.log("Database connected");
});

export default db;
