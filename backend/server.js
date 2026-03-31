require('dotenv').config();
const express = require('express');
const compression = require('compression');
const mongoose = require('mongoose');
const cors = require('cors');
const { createServer } = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const umbrellaRoutes = require('./routes/umbrellas');
const rentalRoutes = require('./routes/rentals');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || '*',
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Make io available globally
global.io = io;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(compression());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI).catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/umbrellas', umbrellaRoutes);
app.use('/api/rentals', rentalRoutes);

// Keep-alive: pinged every 5 min by UptimeRobot to prevent Railway cold starts
app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});