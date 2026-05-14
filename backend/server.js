const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
const frontendPath = path.resolve(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Mock API Routes for Mosaic
app.post('/api/upload', (req, res) => {
  console.log('[API/Upload] Received metadata:', req.body);
  const mockId = `img_${Math.random().toString(36).substring(2, 15)}`;
  setTimeout(() => {
    res.json({ success: true, id: mockId, message: 'Upload successful (mock)' });
  }, 500);
});

app.post('/api/style', (req, res) => {
  console.log('[API/Style] Received Style Generation Request:', JSON.stringify(req.body, null, 2));
  setTimeout(() => {
    res.json({
      success: true,
      message: 'Mosaic generation started successfully.',
      jobId: `job_${Math.random().toString(36).substring(2, 15)}`,
      mockUrl: 'https://example.com/mock-mosaic-result.jpg'
    });
  }, 2500);
});


// Data structure
const rooms = {};

io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] DJ connected: ${socket.id}`);

  // Join room
  socket.on('join-room', (roomId, djName) => {
    socket.join(roomId);
    
    if (!rooms[roomId]) {
      rooms[roomId] = {
        tracks: [],
        djs: [],
        lock: null,
        createdAt: new Date(),
      };
    }
    
    rooms[roomId].djs.push({ id: socket.id, name: djName });
    
    // Broadcast to room
    io.to(roomId).emit('dj-joined', {
      id: socket.id,
      name: djName,
      djCount: rooms[roomId].djs.length,
      timestamp: new Date().toISOString(),
    });
    
    // Send state to new DJ
    socket.emit('sync-state', {
      tracks: rooms[roomId].tracks,
      djs: rooms[roomId].djs,
      lock: rooms[roomId].lock,
    });
    
    console.log(`[${roomId}] ${djName} joined (${rooms[roomId].djs.length} DJs)`);
  });

  // Update tracks
  socket.on('update-tracks', (roomId, tracks) => {
    if (!rooms[roomId]) return;
    rooms[roomId].tracks = tracks;
    io.to(roomId).emit('tracks-updated', tracks);
    console.log(`[${roomId}] Tracks updated (${tracks.length} items)`);
  });

  // Request lock
  socket.on('request-lock', (roomId, djId) => {
    if (!rooms[roomId]) return;
    const now = Date.now();
    
    if (!rooms[roomId].lock || rooms[roomId].lock.expiresAt < now) {
      rooms[roomId].lock = {
        owner: djId,
        expiresAt: now + 30000, // 30 second timeout
      };
      io.to(roomId).emit('lock-acquired', { owner: djId });
      console.log(`[${roomId}] Lock acquired by ${djId}`);
    } else {
      socket.emit('lock-denied', { owner: rooms[roomId].lock.owner });
      console.log(`[${roomId}] Lock denied for ${djId} (held by ${rooms[roomId].lock.owner})`);
    }
  });

  // Release lock
  socket.on('release-lock', (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].lock = null;
      io.to(roomId).emit('lock-released');
      console.log(`[${roomId}] Lock released`);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    Object.keys(rooms).forEach((roomId) => {
      if (rooms[roomId]) {
        const djIndex = rooms[roomId].djs.findIndex(d => d.id === socket.id);
        if (djIndex >= 0) {
          const djName = rooms[roomId].djs[djIndex].name;
          rooms[roomId].djs.splice(djIndex, 1);
          io.to(roomId).emit('dj-left', { djCount: rooms[roomId].djs.length });
          console.log(`[${roomId}] ${djName} left (${rooms[roomId].djs.length} remaining)`);
          
          // Clean up empty room
          if (rooms[roomId].djs.length === 0) {
            delete rooms[roomId];
            console.log(`[${roomId}] Room deleted (empty)`);
          }
        }
      }
    });
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🎵 SetFlow Server running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
