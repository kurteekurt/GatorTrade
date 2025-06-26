const pool = require('../models/db');
const fs = require('fs');
const path = require('path');

exports.getItemById = async (req, res) => {
  const { id } = req.params;

  try {
    const [rows] = await pool.execute(`
      SELECT 
        listings.*, 
        listings.image_url AS listing_image_url,
        users.first_name, 
        users.last_name,
        users.rating,
        users.image_url AS user_image_url
      FROM listings 
      JOIN users ON listings.user_id = users.id 
      WHERE listings.id = ?
    `, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Item not found' });
    }

    const item = rows[0];
    const rating = item.rating != null ? String(item.rating) : null;
    const sellerName = `${item.first_name} ${item.last_name}`;

    res.json({
      ...item,
      sellerName,
      rating,
      listingImage: item.listing_image_url,
      userImage: item.user_image_url
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getRandomItems = async (req, res) => {
  const count = parseInt(req.params.count, 10) || 4;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM listings WHERE status = 'approved' ORDER BY RAND() LIMIT ?`,
      [count]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching random listings:', err);
    res.status(500).json({ error: 'Failed to fetch random listings' });
  }
};

exports.getRecentItems = async (req, res) => {
  const count = parseInt(req.params.count, 10) || 4;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM listings WHERE status = 'approved' ORDER BY created_at DESC LIMIT ?`,
      [count]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching recent listings:', err);
    res.status(500).json({ error: 'Failed to fetch recent listings' });
  }
};

exports.getOldestItems = async (req, res) => {
  const count = parseInt(req.params.count, 10) || 4;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM listings WHERE status = 'approved' ORDER BY created_at ASC LIMIT ?`,
      [count]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching oldest listings:', err);
    res.status(500).json({ error: 'Failed to fetch oldest listings' });
  }
};

exports.getSimilarItems = async (req, res) => {
  const { category, exclude } = req.query;

  try {
    const [rows] = await pool.query(
      `SELECT * FROM listings 
       WHERE category = ? AND id != ? AND status = 'approved' 
       ORDER BY RAND() LIMIT 4`,
      [category, exclude]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching similar items:', err);
    res.status(500).json({ error: 'Failed to fetch similar items' });
  }
};

exports.getItemsByUser = async (req, res) => {
  const { userID } = req.params;

  try {
    const [items] = await pool.execute(`
      SELECT 
        id,
        title,
        image_url,
        price,
        status
      FROM listings
      WHERE user_id = ?
      ORDER BY created_at DESC
    `, [userID]);

    const parsedItems = items.map((item) => ({
      ...item,
      price: item.price !== null ? parseFloat(item.price) : null,
    }));

    res.json({ items: parsedItems });
  } catch (err) {
    console.error('Error fetching items for user:', err);
    res.status(500).json({ error: 'Server error while fetching user items' });
  }
};

exports.toggleItemSoldStatus = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Not logged in' });
  }

  try {
    // Check ownership and get current status
    const [rows] = await pool.execute(
      'SELECT status FROM listings WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You do not own this listing' });
    }

    const currentStatus = rows[0].status;
    const newStatus = currentStatus === 'sold' ? 'approved' : 'sold';

    await pool.execute(
      'UPDATE listings SET status = ? WHERE id = ?',
      [newStatus, itemId]
    );

    res.json({ message: `Listing marked as ${newStatus}`, status: newStatus });
  } catch (err) {
    console.error('Error toggling item status:', err);
    res.status(500).json({ error: 'Server error while updating item status' });
  }
};

exports.deleteItemById = async (req, res) => {
  const itemId = req.params.id;
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Not logged in' });
  }

  try {
    const [rows] = await pool.execute(
      'SELECT image_url FROM listings WHERE id = ? AND user_id = ?',
      [itemId, userId]
    );

    if (rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden: You do not own this listing' });
    }

    const imageUrl = rows[0].image_url;

    await pool.execute('DELETE FROM messages WHERE listing_id = ?', [itemId]);

    await pool.execute('DELETE FROM listings WHERE id = ?', [itemId]);

    if (imageUrl) {
      const imagePath = path.join(__dirname, '..', 'images', imageUrl);
      fs.unlink(imagePath, (err) => {
        if (err && err.code !== 'ENOENT') {
          console.error(`Failed to delete image file: ${imagePath}`, err);
        } else {
          console.log(`Deleted image file: ${imagePath}`);
        }
      });
    }

    res.json({ message: 'Listing, related messages, and image deleted successfully' });
  } catch (err) {
    console.error('Error deleting listing:', err);
    res.status(500).json({ error: 'Server error while deleting listing, messages, or image' });
  }
};

//filtering logic for the price fioltering bar 
exports.searchListings = async (req, res) => {
  let {
    category,
    query,
    minPrice = 0,
    maxPrice = 1000000,
    sortBy = ''
  } = req.query;
  
//Search length limit check added
  if (query && query.length > 40) {
    return res.status(400).json({ error: 'Search query must be 40 characters or fewer.' });
  }

  let sql = `SELECT * FROM listings WHERE status = 'approved' AND price BETWEEN ? AND ?`;
  let params = [Number(minPrice), Number(maxPrice)];

  if (category && category.toLowerCase() !== 'all') {
    sql += ` AND LOWER(category) = ?`;
    params.push(category.toLowerCase());
  }

  if (query && query.trim() !== '') {
    const lowerQuery = query.toLowerCase();
    const hasWildcards = lowerQuery.includes('%');
    const searchTerm = hasWildcards ? lowerQuery : `%${lowerQuery}%`;

    sql += ` AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ?)`;
    params.push(searchTerm, searchTerm);
  }

  switch (sortBy) {
    case 'price_asc':
      sql += ` ORDER BY price ASC`;
      break;
    case 'price_desc':
      sql += ` ORDER BY price DESC`;
      break;
    case 'newest':
    default:
      sql += ` ORDER BY created_at DESC`;
      break;
  }

  try {
    const [results] = await pool.query(sql, params);
    res.json(results);
  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ error: 'Database error' });
  }
};