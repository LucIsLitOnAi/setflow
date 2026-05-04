const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve static frontend files
const path = require('path');
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));
console.log('Serving frontend from:', frontendPath);

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

let globalState = {
  tracks: [],
  vinylRecords: []
};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.emit('init-state', globalState);

  socket.on('sync-tracks', (tracks) => {
    globalState.tracks = tracks;
    socket.broadcast.emit('tracks-updated', tracks);
  });

  socket.on('sync-vinyl', (vinyl) => {
    globalState.vinylRecords = vinyl;
    socket.broadcast.emit('vinyl-updated', vinyl);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.post('/create-checkout-session', async (req, res) => {
  const { priceId } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${req.headers.origin}/?success=true`,
      cancel_url: `${req.headers.origin}/?canceled=true`,
    });
    res.json({ url: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Fallback for SPA
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

server.listen(PORT, () => {
  console.log(`SetFlow Backend running on port ${PORT}`);
});
