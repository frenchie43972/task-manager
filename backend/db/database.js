import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Determines the absolute path of this file so database paths
// are reliable regardless of where the server is started from
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Builds and resolves paths so they work no matter where the app is started from
const dbPath = path.resolve(__dirname, 'tasks.sqlite');
const schemaPath = path.resolve(__dirname, 'schema.sql');

// Open the DB
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.log('Failed to connect to the database', err);
  }

  console.log('Database connected');

  // reads the schma file from the dis using fs (file system path)
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // This will execute the schema to crate table(s) if they do not exist
  db.exec(schema, (schemaErr) => {
    if (schemaErr) {
      console.error('Failed to apply the database schema', schemaErr);
    } else {
      console.log('Database schema applied');
    }
  });
});

export default db;
