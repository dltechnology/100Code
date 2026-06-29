const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Anthropic = require('@anthropic-ai/sdk');
const db = require('../database/db');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '../uploads')),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    if (allowed.test(path.extname(file.originalname).toLowerCase()) && allowed.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Appetizer', 'Side Dish', 'Salad', 'Soup', 'Dessert', 'Snack', 'Beverage', 'Sauce & Condiment', 'Baked Goods'];

router.post('/', upload.single('photo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }

  const imagePath = req.file.path;
  const imageData = fs.readFileSync(imagePath);

  // Check for exact duplicate image before calling the AI
  const imageHash = crypto.createHash('sha256').update(imageData).digest('hex');
  const existing = db.prepare('SELECT id, title FROM recipes WHERE image_hash = ?').get(imageHash);
  if (existing) {
    fs.unlinkSync(imagePath);
    return res.status(409).json({ duplicate: true, id: existing.id, title: existing.title,
      error: `Duplicate: "${existing.title}" was already added from this photo.` });
  }

  const base64Image = imageData.toString('base64');
  const mimeType = req.file.mimetype;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mimeType, data: base64Image }
            },
            {
              type: 'text',
              text: `You are a recipe extraction assistant. Carefully read this recipe photo and extract all information. Return ONLY valid JSON with this exact structure (no markdown, no extra text):

{
  "title": "Recipe name",
  "category": "One of: ${CATEGORIES.join(', ')}",
  "description": "One or two sentence description of the dish",
  "ingredients": ["ingredient 1 with amount", "ingredient 2 with amount"],
  "instructions": ["Step 1 description", "Step 2 description"],
  "prep_time": "e.g. 15 minutes or null",
  "cook_time": "e.g. 30 minutes or null",
  "servings": "e.g. 4 servings or null",
  "tags": ["tag1", "tag2"]
}

For tags consider: Quick, Vegetarian, Vegan, Gluten-Free, Spicy, Comfort Food, Healthy, Make-Ahead, One-Pan, Grilling, etc.
If any field is unclear or not visible, use null for strings or empty array for arrays.`
            }
          ]
        }
      ]
    });

    const rawText = response.content[0].text.trim();
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No valid JSON returned from AI');

    const recipe = JSON.parse(jsonMatch[0]);

    if (!recipe.title || !recipe.ingredients?.length || !recipe.instructions?.length) {
      return res.status(422).json({ error: 'Could not extract a complete recipe from this image. Please try a clearer photo.' });
    }

    // Check for duplicate title (same recipe photographed differently)
    const titleDupe = db.prepare('SELECT id, title FROM recipes WHERE LOWER(title) = LOWER(?)').get(recipe.title);
    if (titleDupe) {
      fs.unlinkSync(imagePath);
      return res.status(409).json({ duplicate: true, id: titleDupe.id, title: titleDupe.title,
        error: `Duplicate: "${titleDupe.title}" is already in your cookbook.` });
    }

    const relativePath = '/uploads/' + path.basename(req.file.filename);

    const stmt = db.prepare(`
      INSERT INTO recipes (title, category, description, ingredients, instructions, prep_time, cook_time, servings, tags, image_path, image_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      recipe.title,
      recipe.category || 'Dinner',
      recipe.description || null,
      JSON.stringify(recipe.ingredients || []),
      JSON.stringify(recipe.instructions || []),
      recipe.prep_time || null,
      recipe.cook_time || null,
      recipe.servings || null,
      JSON.stringify(recipe.tags || []),
      relativePath,
      imageHash
    );

    res.json({ success: true, id: result.lastInsertRowid, recipe: { id: result.lastInsertRowid, ...recipe, image_path: relativePath } });

  } catch (err) {
    console.error('AI processing error:', err);
    res.status(500).json({ error: 'Failed to process image: ' + err.message });
  }
});

module.exports = router;
