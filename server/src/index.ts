import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server as SocketIOServer } from 'socket.io';
import { config } from './config/index.js';
import router from './routes/index.js';
import { setupSocketIO } from './socket/chatSocket.js';

const app = express();
const server = http.createServer(app);

// Configure CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

// Attach Socket.IO
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

setupSocketIO(io);

// Mount API routes
app.use('/api', router);

// Default root response
app.get('/', (req, res) => {
  res.json({
    name: 'UniAssist AI Server',
    status: 'running',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Start Server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 UniAssist AI Server running on http://localhost:${PORT}`);
  console.log(`💬 Socket.IO real-time engine initialized`);
});
