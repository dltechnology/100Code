const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'recipes.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    description TEXT,
    ingredients TEXT NOT NULL,
    instructions TEXT NOT NULL,
    prep_time TEXT,
    cook_time TEXT,
    servings TEXT,
    tags TEXT,
    image_path TEXT,
    image_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_category ON recipes(category);
  CREATE INDEX IF NOT EXISTS idx_created_at ON recipes(created_at);
`);

// Add image_hash column to existing databases that predate this field
try {
  db.exec('ALTER TABLE recipes ADD COLUMN image_hash TEXT');
} catch (_) { /* column already exists */ }

module.exports = db;
