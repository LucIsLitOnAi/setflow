import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://lucislitonai.github.io',
];

// ─── Auth Config ──────────────────────────────────────────────────────────────

const JWT_SECRET = process.env.JWT_SECRET || 'setflow-dev-secret-change-me';
const JWT_EXPIRES = '7d';
const SALT_ROUNDS = 10;

const users = new Map();

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

app.use(cors({ origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }));
app.use(express.json());

// ─── REST Endpoints ───────────────────────────────────────────────────────────

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (users.has(email.toLowerCase())) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = { id: 'u_' + Date.now(), email: email.toLowerCase(), name: name || email.split('@')[0], hash, createdAt: new Date().toISOString() };
    users.set(user.email, user);

    const token = signToken(user);
    console.log('User registered:', user.email);
    res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = users.get(email.toLowerCase());
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

app.get('/api/auth/me', authRequired, (req, res) => {
  const user = users.get(req.user.email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user: { id: user.id, email: user.email, name: user.name } });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.2.0' });
});

app.get('/api/sets', authRequired, (req, res) => {
  res.json({ sets: [] });
});

app.post('/api/sets', authRequired, (req, res) => {
  res.status(501).json({ message: 'not implemented yet' });
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
  console.log('DJ connected', socket.user.email, socket.id);

  socket.on('set:update', (payload) => {
    socket.broadcast.emit('set:update', payload);
  });

  socket.on('set:lock', (payload) => {
    socket.broadcast.emit('set:lock', payload);
  });

  socket.on('disconnect', () => {
    console.log('DJ disconnected', socket.user.email, socket.id);
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────

httpServer.listen(PORT, () => {
  console.log(`SetFlow server running on http://localhost:${PORT}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────

function shutdown(signal) {
  console.log(`\n${signal} received — shutting down gracefully`);
  httpServer.close((err) => {
    if (err) { console.error('Error during shutdown:', err); process.exit(1); }
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
