import 'dotenv/config';
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import cors from 'cors';

const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://lucislitonai.github.io',
];

// ─── Express + HTTP Server ───────────────────────────────────────────────────

const app = express();
const httpServer = createServer(app);

app.use(cors({ origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] }));
app.use(express.json());

// ─── REST Endpoints ───────────────────────────────────────────────────────────

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.1.0' });
});

app.get('/api/sets', (_req, res) => {
  // TODO: load sets from persistence layer
  res.json({ sets: [] });
});

app.post('/api/sets', (_req, res) => {
  // TODO: persist set
  res.status(501).json({ message: 'not implemented yet' });
});

// ─── Socket.io ────────────────────────────────────────────────────────────────

const io = new Server(httpServer, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST'] },
});

io.on('connection', (socket) => {
  console.log('DJ connected', socket.id);

  // Broadcast set changes to all other clients in the session
  socket.on('set:update', (payload) => {
    socket.broadcast.emit('set:update', payload);
  });

  // Broadcast track lock (prevent simultaneous edits)
  socket.on('set:lock', (payload) => {
    socket.broadcast.emit('set:lock', payload);
  });

  socket.on('disconnect', () => {
    console.log('DJ disconnected', socket.id);
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
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));
