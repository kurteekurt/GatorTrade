const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { sendNotificationEmail } = require('./email');

// Send message
router.post('/', async (req, res) => {
  try {
    let { sender_id, receiver_id, content, listing_id } = req.body;

    sender_id = parseInt(sender_id, 10);
    receiver_id = parseInt(receiver_id, 10);
    listing_id = parseInt(listing_id, 10);

    const [listingRows] = await db.query(
      'SELECT user_id FROM listings WHERE id = ?',
      [listing_id]
    );

    if (listingRows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const sellerId = listingRows[0].user_id;

    const validParticipants =
      (sender_id === sellerId && receiver_id !== sellerId) ||
      (receiver_id === sellerId && sender_id !== sellerId);

    if (!validParticipants) {
      console.warn("Unauthorized sender/receiver for this listing");
      return res.status(403).json({ error: 'Unauthorized: You are not allowed to message on this listing.' });
    }

    const [result] = await db.query(
      'INSERT INTO messages (sender_id, receiver_id, content, listing_id, timestamp) VALUES (?, ?, ?, ?, NOW())',
      [sender_id, receiver_id, content, listing_id]
    );

    console.log("Message inserted successfully.");

    // Check if this is the first message in this thread
    const [existingMessages] = await db.query(
      `SELECT COUNT(*) as count FROM messages 
       WHERE listing_id = ? 
         AND (
           (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
         )`,
      [listing_id, sender_id, receiver_id, receiver_id, sender_id]
    );

    const isFirstMessage = existingMessages[0].count === 1;

    if (isFirstMessage) {
      const [receiverRows] = await db.query('SELECT email FROM users WHERE id = ?', [receiver_id]);
      const [senderRows] = await db.query('SELECT first_name, last_name FROM users WHERE id = ?', [sender_id]);

      if (receiverRows.length && senderRows.length) {
        const toEmail = receiverRows[0].email;
        const senderName = `${senderRows[0].first_name} ${senderRows[0].last_name}`;
        const snippet = content.slice(0, 100);

        try {
          await sendNotificationEmail(toEmail, senderName, snippet);
          console.log("First message — email notification sent.");
        } catch (emailErr) {
          console.error("Failed to send email notification:", emailErr);
        }
      }
    } else {
      console.log("ℹMessage is part of an ongoing thread — no email sent.");
    }

    res.json({ message: 'Message sent' });
  } catch (err) {
    console.error("DB INSERT ERROR:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get message history between two users
router.get('/:user1/:user2/:listingId', async (req, res) => {
  const { user1, user2, listingId } = req.params;

  try {
    const [listingRows] = await db.query(
      'SELECT user_id FROM listings WHERE id = ?',
      [listingId]
    );

    if (listingRows.length === 0) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    const sellerId = listingRows[0].user_id;

    const validParticipants =
      (Number(user1) === sellerId && Number(user2) !== sellerId) ||
      (Number(user2) === sellerId && Number(user1) !== sellerId);

    if (!validParticipants) {
      return res.status(403).json({ error: 'Unauthorized access to messages' });
    }

    const [results] = await db.query(
      `SELECT * FROM messages 
       WHERE listing_id = ?
         AND (
           (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
         )
       ORDER BY timestamp ASC`,
      [listingId, user1, user2, user2, user1]
    );

    res.json(results);
  } catch (err) {
    console.error("❌ Message fetch failed:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.get('/threads', async (req, res) => {
  const userId = req.session?.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Not logged in' });
  }

  try {
    const [threads] = await db.query(`
      SELECT 
        m.id AS message_id,
        m.content,
        m.timestamp,
        m.sender_id,
        m.receiver_id,
        l.id AS listing_id,
        l.title AS listing_title,
        u.id AS other_user_id,
        u.first_name,
        u.last_name,
        u.image_url,
        CASE 
          WHEN m.sender_id = l.user_id THEN m.sender_id 
          ELSE m.receiver_id 
        END AS seller_id,
        CASE 
          WHEN m.sender_id = l.user_id THEN m.receiver_id 
          ELSE m.sender_id 
        END AS buyer_id
      FROM messages m
      JOIN (
        SELECT 
          listing_id,
          CASE 
            WHEN sender_id = ? THEN receiver_id 
            ELSE sender_id 
          END AS other_user_id,
          MAX(timestamp) AS latest
        FROM messages
        WHERE sender_id = ? OR receiver_id = ?
        GROUP BY listing_id, other_user_id
      ) grouped ON (
        m.listing_id = grouped.listing_id AND
        (
          (m.sender_id = ? AND m.receiver_id = grouped.other_user_id) OR
          (m.receiver_id = ? AND m.sender_id = grouped.other_user_id)
        )
        AND m.timestamp = grouped.latest
      )
      JOIN users u ON u.id = grouped.other_user_id
      JOIN listings l ON l.id = m.listing_id
      ORDER BY m.timestamp DESC
    `, [userId, userId, userId, userId, userId]);

    res.json(threads);
  } catch (err) {
    console.error("Failed to load threads:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

router.delete('/thread', async (req, res) => {
  const userId = req.session?.user?.id;
  const { listing_id, other_user_id } = req.body;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Not logged in' });
  }

  if (!listing_id || !other_user_id) {
    return res.status(400).json({ error: 'Missing listing_id or other_user_id' });
  }

  try {
    const [results] = await db.query(
      `DELETE FROM messages
       WHERE listing_id = ?
         AND (
           (sender_id = ? AND receiver_id = ?)
           OR (sender_id = ? AND receiver_id = ?)
         )`,
      [listing_id, userId, other_user_id, other_user_id, userId]
    );

    res.json({
      message: 'Thread deleted successfully',
      affectedRows: results.affectedRows
    });
  } catch (err) {
    console.error("Failed to delete thread:", err);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;