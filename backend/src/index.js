import 'dotenv/config'; // nạp .env vào process.env (phải đứng trước khi import db.js)
import express from 'express';
import cors from 'cors';
import pool, { initDb } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

// Health check — useful for load balancers / platform health probes.
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// List the latest messages.
app.get('/api/messages', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, author, content, created_at FROM messages ORDER BY id DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Create a new message.
app.post('/api/messages', async (req, res) => {
  const { author, content } = req.body || {};
  if (!author || !content) {
    return res.status(400).json({ error: 'author and content are required' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO messages (author, content) VALUES (?, ?)',
      [String(author).slice(0, 100), String(content).slice(0, 1000)]
    );
    res.status(201).json({ id: result.insertId, author, content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save message' });
  }
});

const PORT = process.env.PORT || 4000;

initDb()
  .then(() => {
    app.listen(PORT, () => console.log(`Backend listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
