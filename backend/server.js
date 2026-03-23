// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
// CORS: allow configured frontend plus common Vite dev ports
app.use(cors({
  origin: (origin, callback) => {
    const defaultFrontend = 'http://localhost:5173';
    const envFrontend = process.env.FRONTEND_URL;

    const allowedOrigins = [
      defaultFrontend,
      envFrontend,
      'http://localhost:5174'
    ].filter(Boolean);

    // Allow non-browser or same-origin requests (no Origin header)
    if (!origin) {
      return callback(null, true);
    }

    // Allow any of the explicitly listed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Allow other localhost Vite ports in the 517x range during development
    if (/^http:\/\/localhost:517\d$/.test(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const resourceRoutes = require('./routes/resources');
const moduleRoutes = require('./routes/modules');
const aiRoutes = require('./routes/ai');

// Placeholder handler for unimplemented routes
const toBeImplemented = (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Feature to be implemented',
    path: req.originalUrl
  });
};

// ── Active Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/ai', aiRoutes);

// ── Unimplemented Routes (Placeholders) ──────────────────
app.use('/api/sessions', toBeImplemented);
app.use('/api/groups', toBeImplemented);
app.use('/api/posts', toBeImplemented);
app.use('/api/reviews', toBeImplemented);
app.use('/api/session-requests', toBeImplemented);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    success: true,
    message: 'P2P Academic Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'P2P Platform API is running',
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString()
  });
});

// API documentation
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'P2P Platform API Endpoints',
    activeRoutes: {
      auth:      { login: 'POST /api/auth/login', me: 'GET /api/auth/me' },
      users:     'GET /api/users/*',
      resources: 'GET/POST /api/resources/*',
      modules:   'GET /api/modules/*',
      ai:        'GET /api/ai/*'
    },
    placeholderRoutes: ['sessions', 'groups', 'posts', 'reviews', 'session-requests']
  });
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: '/api for documentation'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('=== SERVER ERROR ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('===================');
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({ success: false, message: 'Validation error', errors });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Invalid ID format' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, message: 'Token expired' });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle unhandled promise rejections (don't crash the server)
process.on('unhandledRejection', (err) => {
  console.error('=== UNHANDLED REJECTION ===', err.message);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===', err.message);
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   🎓 Student Collaboration Platform API        ║');
  console.log('╚════════════════════════════════════════════════╝');
  console.log('');
  console.log('🚀 Server Status:    RUNNING');
  console.log('📍 Port:            ', PORT);
  console.log('🌍 Environment:     ', process.env.NODE_ENV || 'development');
  console.log('💾 Database:        ', mongoose.connection.readyState === 1 ? '✅ Connected' : '⏳ Connecting...');
  console.log('');
  console.log('🔗 Active Routes:');
  console.log('   → Auth:          /api/auth/*');
  console.log('   → Users:         /api/users/*');
  console.log('   → Resources:     /api/resources/*');
  console.log('   → Modules:       /api/modules/*');
  console.log('   → AI:            /api/ai/*');
  console.log('');
  console.log('⏳ Placeholder Routes (To Be Implemented):');
  console.log('   → Sessions, Groups, Posts, Reviews');
  console.log('');
  console.log('💡 API Docs:  http://localhost:' + PORT + '/api');
  console.log('💡 Health:    http://localhost:' + PORT + '/api/health');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received: shutting down gracefully');
  server.close(() => {
    mongoose.connection.close(false, () => {
      console.log('✅ Server and DB closed');
      process.exit(0);
    });
  });
});

module.exports = app;