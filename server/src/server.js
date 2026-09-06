import express from 'express';
import http from 'node:http';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config.js';
import { setupWebSocket } from './websocket.js';
import { safeLog } from './security.js';

const app = express();

app.use(helmet({
  crossOriginResourcePolicy: false
}));
app.use(cors({
  origin: config.corsOrigin,
  credentials: true
}));
app.use(express.json());

const httpServer = http.createServer(app);
const { roomManager } = setupWebSocket(httpServer);

// Health check endpoint
app.get('/health', (req, res) => {
  const stats = roomManager.getStats();
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    activeRooms: stats.activeRooms,
    connectedUsers: stats.connectedUsers,
    memoryUsageMB: Math.round(process.memoryUsage().rss / (1024 * 1024))
  });
});

// App configuration metadata endpoint
app.get('/api/config', (req, res) => {
  res.json({
    allowedTTLs: config.allowedTTLs,
    defaultTTL: config.defaultTTL,
    maxParticipants: config.maxParticipants,
    maxMessageLength: config.maxMessageLength
  });
});

// Pre-check room existence
app.get('/api/room/:roomId', (req, res) => {
  const { roomId } = req.params;
  const room = roomManager.getRoom(roomId);
  if (!room) {
    return res.status(404).json({
      exists: false,
      message: 'Room not found or expired'
    });
  }

  const now = Date.now();
  const remainingSeconds = Math.max(0, Math.floor((room.expiresAt - now) / 1000));

  res.json({
    exists: true,
    roomId: room.id,
    userCount: room.users.size,
    maxParticipants: room.maxParticipants,
    expiresAt: room.expiresAt,
    remainingSeconds
  });
});

// Start HTTP & WebSocket Server
httpServer.listen(config.port, () => {
  safeLog.info(`GoneChat Server running on port ${config.port}`, {
    port: config.port,
    nodeEnv: process.env.NODE_ENV || 'development'
  });
});

export { app, httpServer, roomManager };
