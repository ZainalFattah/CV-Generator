import './env.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initializeDatabase } from './db/migrations.js';
import db from './db/database.js';

const app = express();
app.set('trust proxy', 2);
const PORT = process.env.PORT || 3001;

// Initialize Database
initializeDatabase();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 20,
  message: 'Terlalu banyak request, coba lagi dalam 1 menit',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

import chatRouter from './routes/chat.js';
import roastRouter from './routes/roast.js';
import exportRouter from './routes/export.js';

app.use('/api/chat', chatRouter);
app.use('/api/roast', roastRouter);
app.use('/api/export', exportRouter);

// Cleanup task (daily)
setInterval(() => {
    const ttlDays = process.env.SESSION_TTL_DAYS || 7;
    db.prepare(`DELETE FROM sessions WHERE updated_at < ?`)
      .run(Date.now() - ttlDays * 24 * 60 * 60 * 1000);
}, (process.env.CLEANUP_INTERVAL_HOURS || 24) * 60 * 60 * 1000);

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Centralized error middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on port ${PORT}`);
});
