const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const db = require('../models/db');

const router = express.Router();

const profileImagesPath = path.join(__dirname, '..', 'images_profiles');
if (!fs.existsSync(profileImagesPath)) {
  fs.mkdirSync(profileImagesPath);
  console.log('📁 Created images_profiles folder');
}
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, 
});


// POST /profile/upload-image
router.post('/upload-image', upload.single('image'), async (req, res) => {
  const userId = req.session?.user?.id;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No active session.' });
  }

  const description = req.body.description?.trim() || null;
  let imageUrl = null;
  let filename, filepath;

  try {
    const [current] = await db.query('SELECT image_url FROM users WHERE id = ?', [userId]);
    const oldImage = current?.[0]?.image_url;

    if (req.file) {
      filename = `user_${userId}_${Date.now()}.jpg`;
      filepath = path.join(profileImagesPath, filename);

      await sharp(req.file.buffer)
        .resize(400, 400, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 70 })
        .toFile(filepath);

      imageUrl = filename;
    }

    let sql = 'UPDATE users SET';
    const fields = [];
    const values = [];

    if (imageUrl) {
      fields.push(' image_url = ?');
      values.push(imageUrl);
    }

    if (description !== null) {
      fields.push(' description = ?');
      values.push(description);
    }

    if (fields.length === 0) {
      return res.status(400).json({ error: 'Nothing to update.' });
    }

    sql += fields.join(',') + ' WHERE id = ?';
    values.push(userId);

    await db.query(sql, values);

    if (imageUrl && oldImage && oldImage !== 'nullPFP.jpg') {
      const oldPath = path.join(profileImagesPath, oldImage);
      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.error('⚠️ Failed to delete old image:', err);
        });
      }
    }

    if (req.session.user && imageUrl) {
      req.session.user.image_url = imageUrl;
    }

    res.json({
      message: 'Profile updated successfully.',
      ...(imageUrl && { imageUrl }),
      ...(description !== null && { description }),
    });

  } catch (err) {
    console.error('Profile update error:', err.message);
    if (filepath && fs.existsSync(filepath)) fs.unlinkSync(filepath); 
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// GET /profile/:id
router.get('/:id', async (req, res) => {
  const userId = parseInt(req.params.id, 10);

  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const [rows] = await db.query(
      'SELECT first_name, last_name, email, rating, created_at, description, image_url FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    res.json({
      profile: {
        name: `${user.first_name} ${user.last_name}`,
        email: user.email,
        rating: user.rating,
        createdAt: user.created_at,
        description: user.description || '',
        imageUrl: user.image_url || ''
      }
    });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({ error: 'Failed to load profile' });
  }
});

module.exports = router;