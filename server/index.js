import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const PORT = process.env.PORT || 3001;
const VERSION = '0.4.0';

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://lucislitonai.github.io',
  'https://djstash.app',
  'https://www.djstash.app',
];

// ─── Auth Config ──────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'setflow-dev-secret-change-me';
const JWT_EXPIRES = '7d';
const SALT_ROUNDS = 10;

// ─── PostgreSQL Setup ─────────────────────────────────────────────────────────

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      email      TEXT UNIQUE NOT NULL,
      name       TEXT NOT NULL,
      hash       TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS tracks (
      id         TEXT NOT NULL,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data       JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id, user_id)
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS artists (
      id         TEXT NOT NULL,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      data       JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (id, user_id)
    );
  `);

  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
  console.log(`SetFlow v${VERSION} — Database ready (${rows[0].count} users)`);
}

// ─── Helper Functions ─────────────────────────────────────────────────────────

function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

function verifyToken(token) {
  try { return jwt.verify(token, JWT_SECRET); }
  catch { return null; }
}

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Token required' });
  const payload = verifyToken(header.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid or expired token' });
  req.user = payload;
  next();
}

// ─── Express + HTTP Server ───────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: ALLOWED_ORIGINS, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '10mb' })); // covers base64 covers

// ─── REST: Auth ───────────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const id = 'u_' + Date.now();
    const displayName = name || email.split('@')[0];

    await pool.query(
      'INSERT INTO users (id, email, name, hash) VALUES ($1, $2, $3, $4)',
      [id, email.toLowerCase(), displayName, hash]
    );

    const user = { id, email: email.toLowerCase(), name: displayName };
    const token = signToken(user);
    console.log('User registered:', user.email);
    res.status(201).json({ token, user });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.hash);
    if (!match) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken(user);
    console.log('User logged in:', user.email);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.get('/api/auth/me', authRequired, async (req, res) => {
  const result = await pool.query('SELECT id, email, name FROM users WHERE email = $1', [req.user.email]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ─── REST: Sync (bulk pull on login) ─────────────────────────────────────────

// Pull all data for user — called once on connect/login
app.get('/api/sync', authRequired, async (req, res) => {
  try {
    const [tracksRes, artistsRes] = await Promise.all([
      pool.query('SELECT data FROM tracks WHERE user_id = $1 ORDER BY updated_at ASC', [req.user.id]),
      pool.query('SELECT data FROM artists WHERE user_id = $1 ORDER BY updated_at ASC', [req.user.id]),
    ]);
    res.json({
      tracks:  tracksRes.rows.map(r => r.data),
      artists: artistsRes.rows.map(r => r.data),
    });
  } catch (e) {
    console.error('Sync pull error:', e);
    res.status(500).json({ error: 'Sync failed' });
  }
});

// Push full snapshot — called on first sync or manual push
app.post('/api/sync', authRequired, async (req, res) => {
  try {
    const { tracks = [], artists = [] } = req.body;
    const uid = req.user.id;

    // Upsert tracks
    for (const t of tracks) {
      if (!t.id) continue;
      await pool.query(`
        INSERT INTO tracks (id, user_id, data, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (id, user_id) DO UPDATE SET data = $3, updated_at = NOW()
      `, [String(t.id), uid, t]);
    }

    // Upsert artists
    for (const a of artists) {
      if (!a.id) continue;
      await pool.query(`
        INSERT INTO artists (id, user_id, data, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (id, user_id) DO UPDATE SET data = $3, updated_at = NOW()
      `, [String(a.id), uid, a]);
    }

    res.json({ ok: true, tracks: tracks.length, artists: artists.length });
  } catch (e) {
    console.error('Sync push error:', e);
    res.status(500).json({ error: 'Sync push failed' });
  }
});

// ─── REST: Tracks (single-item mutations) ─────────────────────────────────────

app.post('/api/tracks', authRequired, async (req, res) => {
  try {
    const track = req.body;
    if (!track?.id) return res.status(400).json({ error: 'Track id required' });
    await pool.query(`
      INSERT INTO tracks (id, user_id, data, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id, user_id) DO UPDATE SET data = $3, updated_at = NOW()
    `, [String(track.id), req.user.id, track]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Track save error:', e);
    res.status(500).json({ error: 'Save failed' });
  }
});

app.delete('/api/tracks/:id', authRequired, async (req, res) => {
  try {
    await pool.query('DELETE FROM tracks WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Track delete error:', e);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ─── REST: Artists ────────────────────────────────────────────────────────────

app.post('/api/artists', authRequired, async (req, res) => {
  try {
    const artist = req.body;
    if (!artist?.id) return res.status(400).json({ error: 'Artist id required' });
    await pool.query(`
      INSERT INTO artists (id, user_id, data, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (id, user_id) DO UPDATE SET data = $3, updated_at = NOW()
    `, [String(artist.id), req.user.id, artist]);
    res.json({ ok: true });
  } catch (e) {
    console.error('Artist save error:', e);
    res.status(500).json({ error: 'Save failed' });
  }
});

// ─── REST: Health ─────────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
    res.json({ status: 'ok', version: VERSION, db: 'postgres', users: parseInt(rows[0].count) });
  } catch (e) {
    res.json({ status: 'degraded', version: VERSION, db: 'error', error: e.message });
  }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  const payload = verifyToken(token);
  if (!payload) return next(new Error('Invalid or expired token'));
  socket.user = payload;
  next();
});

io.on('connection', (socket) => {
  const uid = socket.user.id;
  // Each user gets their own room — only their own tabs sync together
  socket.join(`user:${uid}`);
  console.log('DJ connected', socket.user.email, socket.id);

  // Broadcast track change to other tabs of same user
  socket.on('track:update', (payload) => {
    socket.to(`user:${uid}`).emit('track:update', payload);
  });

  socket.on('track:delete', (payload) => {
    socket.to(`user:${uid}`).emit('track:delete', payload);
  });

  socket.on('artist:update', (payload) => {
    socket.to(`user:${uid}`).emit('artist:update', payload);
  });

  // Full sync broadcast (e.g. after bulk import)
  socket.on('sync:push', async (payload) => {
    try {
      const { tracks = [], artists = [] } = payload;
      // Persist to DB
      for (const t of tracks) {
        if (!t.id) continue;
        await pool.query(`
          INSERT INTO tracks (id, user_id, data, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (id, user_id) DO UPDATE SET data = $3, updated_at = NOW()
        `, [String(t.id), uid, t]);
      }
      for (const a of artists) {
        if (!a.id) continue;
        await pool.query(`
          INSERT INTO artists (id, user_id, data, updated_at)
          VALUES ($1, $2, $3, NOW())
          ON CONFLICT (id, user_id) DO UPDATE SET data = $3, updated_at = NOW()
        `, [String(a.id), uid, a]);
      }
      // Forward to other tabs
      socket.to(`user:${uid}`).emit('sync:data', payload);
    } catch (e) {
      console.error('sync:push error:', e);
    }
  });

  // Legacy events (keep for compatibility)
  socket.on('set:update', (payload) => {
    socket.to(`user:${uid}`).emit('set:update', payload);
  });

  socket.on('disconnect', () => {
    console.log('DJ disconnected', socket.user.email, socket.id);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  await migrate();
  httpServer.listen(PORT, () => {
    console.log(`SetFlow server v${VERSION} on http://localhost:${PORT} (PostgreSQL)`);
  });
}

start().catch((e) => {
  console.error('Failed to start:', e);
  process.exit(1);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully`);
  pool.end().then(() => {
    console.log('Database pool closed');
    httpServer.close((err) => {
      if (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
      }
      process.exit(0);
    });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
