const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Adjust for production
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// State in memory (MVP)
let rooms = {};

io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  socket.on('join-room', ({ roomId, djName }) => {
    socket.join(roomId);
    if (!rooms[roomId]) {
      rooms[roomId] = {
        tracks: [],
        vinylRecords: [],
        locks: {}
      };
    }
    console.log(`DJ ${djName} joined room: ${roomId}`);
    
    // Send current state to new user
    socket.emit('init-state', rooms[roomId]);
  });

  socket.on('update-tracks', ({ roomId, tracks }) => {
    if (rooms[roomId]) {
      rooms[roomId].tracks = tracks;
      socket.to(roomId).emit('tracks-updated', tracks);
    }
  });

  socket.on('update-vinyl', ({ roomId, vinylRecords }) => {
    if (rooms[roomId]) {
      rooms[roomId].vinylRecords = vinylRecords;
      socket.to(roomId).emit('vinyl-updated', vinylRecords);
    }
  });

  socket.on('acquire-lock', ({ roomId, trackId, djName }) => {
    if (rooms[roomId]) {
      // Basic lock logic: only one person can lock a track
      if (!rooms[roomId].locks[trackId]) {
        rooms[roomId].locks[trackId] = { djName, timestamp: Date.now() };
        io.in(roomId).emit('lock-acquired', { trackId, djName });
      }
    }
  });

  socket.on('release-lock', ({ roomId, trackId }) => {
    if (rooms[roomId] && rooms[roomId].locks[trackId]) {
      delete rooms[roomId].locks[trackId];
      io.in(roomId).emit('lock-released', trackId);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Fallback for SPA (if needed)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

server.listen(PORT, () => {
  console.log(`SetFlow Backend running on port ${PORT}`);
});
