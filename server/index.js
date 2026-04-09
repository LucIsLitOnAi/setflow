import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pg from 'pg';

const PORT = process.env.PORT || 3001;

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
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title      TEXT NOT NULL,
      artist     TEXT NOT NULL DEFAULT 'Unknown',
      bpm        INT,
      energy     INT,
      key        TEXT,
      dur        TEXT,
      genres     JSONB NOT NULL DEFAULT '[]',
      role       TEXT,
      vibe       JSONB NOT NULL DEFAULT '[]',
      lic        TEXT NOT NULL DEFAULT 'unknown',
      lic_note   TEXT NOT NULL DEFAULT '',
      is_own     BOOLEAN NOT NULL DEFAULT FALSE,
      own_artist TEXT,
      cover      TEXT,
      analyzed   BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS sets (
      id         TEXT PRIMARY KEY,
      user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      name       TEXT NOT NULL,
      duration   INT NOT NULL DEFAULT 90,
      set_type   TEXT NOT NULL DEFAULT 'Main Set — Night',
      track_ids  JSONB NOT NULL DEFAULT '[]',
      shared     BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS set_collaborators (
      set_id  TEXT NOT NULL REFERENCES sets(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role    TEXT NOT NULL DEFAULT 'viewer',
      PRIMARY KEY (set_id, user_id)
    );
  `);

  await pool.query(`CREATE INDEX IF NOT EXISTS idx_tracks_user ON tracks(user_id)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_sets_user ON sets(user_id)`);

  const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
  console.log(`Database ready (${rows[0].count} users)`);
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

function dbToTrack(row) {
  return {
    id: row.id, title: row.title, artist: row.artist,
    bpm: row.bpm, energy: row.energy, key: row.key, dur: row.dur,
    genres: row.genres || [], role: row.role, vibe: row.vibe || [],
    lic: row.lic, licNote: row.lic_note, isOwn: row.is_own,
    ownArtist: row.own_artist, cover: row.cover, a: row.analyzed,
    updatedAt: row.updated_at,
  };
}

// ─── Express + HTTP Server ───────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: ALLOWED_ORIGINS, methods: ['GET', 'POST', 'PUT', 'DELETE'] }));
app.use(express.json({ limit: '5mb' }));

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
  const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.user.id]);
  const user = result.rows[0];
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

// ─── REST: Tracks ─────────────────────────────────────────────────────────────

app.get('/api/tracks', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM tracks WHERE user_id = $1 ORDER BY created_at ASC', [req.user.id]
    );
    res.json({ tracks: rows.map(dbToTrack) });
  } catch (e) {
    console.error('GET /api/tracks error:', e);
    res.status(500).json({ error: 'Failed to load tracks' });
  }
});

app.put('/api/tracks/sync', authRequired, async (req, res) => {
  const client = await pool.connect();
  try {
    const { tracks } = req.body;
    if (!Array.isArray(tracks)) return res.status(400).json({ error: 'tracks must be array' });

    await client.query('BEGIN');
    for (const t of tracks) {
      await client.query(`
        INSERT INTO tracks (id,user_id,title,artist,bpm,energy,key,dur,genres,role,vibe,lic,lic_note,is_own,own_artist,cover,analyzed,updated_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,NOW())
        ON CONFLICT (id) DO UPDATE SET
          title=$3,artist=$4,bpm=$5,energy=$6,key=$7,dur=$8,genres=$9,role=$10,
          vibe=$11,lic=$12,lic_note=$13,is_own=$14,own_artist=$15,cover=$16,analyzed=$17,updated_at=NOW()
      `, [
        String(t.id), req.user.id, t.title||'Untitled', t.artist||'Unknown',
        t.bpm||null, t.energy||null, t.key||null, t.dur||null,
        JSON.stringify(t.genres||[]), t.role||null, JSON.stringify(t.vibe||[]),
        t.lic||'unknown', t.licNote||'', t.isOwn||false,
        t.ownArtist||null, t.cover||null, t.a||false,
      ]);
    }
    await client.query('COMMIT');
    res.json({ synced: tracks.length });
  } catch (e) {
    await client.query('ROLLBACK');
    console.error('PUT /api/tracks/sync error:', e);
    res.status(500).json({ error: 'Sync failed' });
  } finally {
    client.release();
  }
});

app.delete('/api/tracks/:id', authRequired, async (req, res) => {
  try {
    await pool.query('DELETE FROM tracks WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id]);
    res.json({ deleted: req.params.id });
  } catch (e) {
    console.error('DELETE /api/tracks error:', e);
    res.status(500).json({ error: 'Delete failed' });
  }
});

// ─── REST: Sets ───────────────────────────────────────────────────────────────

app.get('/api/sets', authRequired, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT s.* FROM sets s
       LEFT JOIN set_collaborators sc ON sc.set_id=s.id AND sc.user_id=$1
       WHERE s.user_id=$1 OR sc.user_id=$1
       ORDER BY s.updated_at DESC`, [req.user.id]
    );
    res.json({ sets: rows.map(r => ({
      id:r.id, name:r.name, duration:r.duration, setType:r.set_type,
      trackIds:r.track_ids, shared:r.shared, updatedAt:r.updated_at,
    }))});
  } catch (e) {
    console.error('GET /api/sets error:', e);
    res.status(500).json({ error: 'Failed to load sets' });
  }
});

app.post('/api/sets', authRequired, async (req, res) => {
  try {
    const { name, duration, setType, trackIds } = req.body;
    const id = 'set_' + Date.now();
    await pool.query(
      `INSERT INTO sets (id,user_id,name,duration,set_type,track_ids) VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, req.user.id, name||'Untitled Set', duration||90, setType||'Main Set — Night', JSON.stringify(trackIds||[])]
    );
    res.status(201).json({ id, name });
  } catch (e) {
    console.error('POST /api/sets error:', e);
    res.status(500).json({ error: 'Failed to create set' });
  }
});

app.put('/api/sets/:id', authRequired, async (req, res) => {
  try {
    const { name, duration, setType, trackIds, shared } = req.body;
    await pool.query(
      `UPDATE sets SET name=COALESCE($3,name), duration=COALESCE($4,duration),
       set_type=COALESCE($5,set_type), track_ids=COALESCE($6,track_ids),
       shared=COALESCE($7,shared), updated_at=NOW()
       WHERE id=$1 AND user_id=$2`,
      [req.params.id, req.user.id, name, duration, setType, trackIds?JSON.stringify(trackIds):null, shared]
    );
    res.json({ updated: req.params.id });
  } catch (e) {
    console.error('PUT /api/sets error:', e);
    res.status(500).json({ error: 'Update failed' });
  }
});

// ─── REST: Health ─────────────────────────────────────────────────────────────

app.get('/api/health', async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT COUNT(*) AS count FROM users');
    res.json({ status:'ok', version:'0.4.0', db:'postgres', users:parseInt(rows[0].count) });
  } catch (e) {
    res.json({ status:'degraded', version:'0.4.0', db:'error', error:e.message });
  }
});

// ─── Socket.io ────────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET','POST'] },
});

const userRooms = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error('Authentication required'));
  const payload = verifyToken(token);
  if (!payload) return next(new Error('Invalid or expired token'));
  socket.user = payload;
  next();
});

io.on('connection', (socket) => {
  const userId = socket.user.id;
  console.log('DJ connected:', socket.user.email, socket.id);

  socket.join(`user:${userId}`);
  userRooms.set(socket.id, { userId, rooms: new Set([`user:${userId}`]) });

  // ── Track sync ──
  socket.on('track:update', (track) => {
    socket.to(`user:${userId}`).emit('track:update', track);
    const info = userRooms.get(socket.id);
    if (info) for (const r of info.rooms) if (r.startsWith('set:')) socket.to(r).emit('track:update', track);
  });

  socket.on('track:delete', (trackId) => {
    socket.to(`user:${userId}`).emit('track:delete', trackId);
  });

  socket.on('tracks:bulk', (tracks) => {
    socket.to(`user:${userId}`).emit('tracks:bulk', tracks);
  });

  // ── Set collaboration ──
  socket.on('set:join', (setId) => {
    const room = `set:${setId}`;
    socket.join(room);
    const info = userRooms.get(socket.id);
    if (info) info.rooms.add(room);
    socket.to(room).emit('set:presence', { userId, name: socket.user.name, action: 'joined' });
    console.log(`${socket.user.email} joined set:${setId}`);
  });

  socket.on('set:leave', (setId) => {
    const room = `set:${setId}`;
    socket.leave(room);
    const info = userRooms.get(socket.id);
    if (info) info.rooms.delete(room);
    socket.to(room).emit('set:presence', { userId, name: socket.user.name, action: 'left' });
  });

  socket.on('set:update', (payload) => {
    if (payload.setId) socket.to(`set:${payload.setId}`).emit('set:update', payload);
    socket.to(`user:${userId}`).emit('set:update', payload);
  });

  socket.on('set:lock', (payload) => {
    if (payload.setId) socket.to(`set:${payload.setId}`).emit('set:lock', { ...payload, lockedBy: socket.user.name });
  });

  socket.on('set:unlock', (payload) => {
    if (payload.setId) socket.to(`set:${payload.setId}`).emit('set:unlock', payload);
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    const info = userRooms.get(socket.id);
    if (info) for (const r of info.rooms) if (r.startsWith('set:')) socket.to(r).emit('set:presence', { userId, name: socket.user.name, action: 'left' });
    userRooms.delete(socket.id);
    console.log('DJ disconnected:', socket.user.email, socket.id);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

async function start() {
  await migrate();
  httpServer.listen(PORT, () => {
    console.log(`SetFlow server v0.4.0 on http://localhost:${PORT} (PostgreSQL)`);
  });
}

start().catch((e) => { console.error('Failed to start:', e); process.exit(1); });

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully`);
  pool.end().then(() => {
    console.log('Database pool closed');
    httpServer.close((err) => { if (err) { console.error('Error during shutdown:', err); process.exit(1); } process.exit(0); });
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
