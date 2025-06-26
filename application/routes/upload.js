const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../models/db');
const router = express.Router();

// Ensure images folder exists
const imagesPath = path.join(__dirname, '..', 'images');
if (!fs.existsSync(imagesPath)) {
  fs.mkdirSync(imagesPath);
  console.log('📁 Created missing images folder at:', imagesPath);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

router.post('/', upload.single('image'), async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No active session.' });
  }

  const title = req.body.title?.trim();
  const description = req.body.description?.trim();
  const price = parseFloat(req.body.price);
  const category = req.body.category;
  const preferredLocation = req.body.location || null;
  const itemCondition = req.body.condition || null;
  const status = 'pending';

  if (!req.file || !title || !description || isNaN(price) || price < 0 || price > 99999999.99 || !category) {
    return res.status(400).json({ error: 'Missing or invalid fields.' });
  }

  const resizedFilename = Date.now() + '.jpg';
  const resizedPath = path.join(imagesPath, resizedFilename);

  try {
    await sharp(req.file.buffer)
      .resize(600, 600, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 70 })
      .toFile(resizedPath);

    const imagePath = resizedFilename;

    const [result] = await db.query(
      `INSERT INTO listings 
      (title, description, price, category, image_url, user_id, status, preferred_location, item_condition) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, price, category, imagePath, userId, status, preferredLocation, itemCondition]
    );

    res.json({
      message: 'Listing uploaded successfully',
      id: result.insertId,
      image: imagePath
    });
  } catch (err) {
    console.error('❌ Image processing or DB error:', err.message);
    if (fs.existsSync(resizedPath)) fs.unlinkSync(resizedPath);
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

module.exports = router;