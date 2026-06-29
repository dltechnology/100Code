const express = require('express');
const router = express.Router();
const db = require('../database/db');

function parseRecipe(row) {
  if (!row) return null;
  return {
    ...row,
    ingredients: JSON.parse(row.ingredients || '[]'),
    instructions: JSON.parse(row.instructions || '[]'),
    tags: JSON.parse(row.tags || '[]')
  };
}

// GET all recipes (with optional category filter and search)
router.get('/', (req, res) => {
  const { category, search, limit = 50, offset = 0 } = req.query;
  let query = 'SELECT * FROM recipes WHERE 1=1';
  const params = [];

  if (category && category !== 'All') {
    query += ' AND category = ?';
    params.push(category);
  }
  if (search) {
    query += ' AND (title LIKE ? OR description LIKE ?)';
    params.push(`%${search}%`, `%${search}%`);
  }

  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(parseInt(limit), parseInt(offset));

  const rows = db.prepare(query).all(...params);
  const total = db.prepare('SELECT COUNT(*) as count FROM recipes WHERE 1=1' +
    (category && category !== 'All' ? ' AND category = ?' : '') +
    (search ? ' AND (title LIKE ? OR description LIKE ?)' : '')
  ).get(...params.slice(0, -2)).count;

  res.json({ recipes: rows.map(parseRecipe), total });
});

// GET categories with counts
router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT category, COUNT(*) as count FROM recipes GROUP BY category ORDER BY count DESC').all();
  res.json(rows);
});

// GET single recipe
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM recipes WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Recipe not found' });
  res.json(parseRecipe(row));
});

// PUT update recipe
router.put('/:id', (req, res) => {
  const { title, category, description, ingredients, instructions, prep_time, cook_time, servings, tags } = req.body;
  const existing = db.prepare('SELECT id FROM recipes WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Recipe not found' });

  db.prepare(`
    UPDATE recipes SET title=?, category=?, description=?, ingredients=?, instructions=?,
    prep_time=?, cook_time=?, servings=?, tags=?, updated_at=CURRENT_TIMESTAMP WHERE id=?
  `).run(
    title, category, description,
    JSON.stringify(ingredients), JSON.stringify(instructions),
    prep_time, cook_time, servings, JSON.stringify(tags),
    req.params.id
  );

  res.json({ success: true });
});

// DELETE recipe
router.delete('/:id', (req, res) => {
  const result = db.prepare('DELETE FROM recipes WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Recipe not found' });
  res.json({ success: true });
});

module.exports = router;
