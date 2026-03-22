// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const connectDB = require('./config/db');
// const userRoutes = require('./routes/users');

// const app = express();

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve uploaded files
// app.use('/uploads', express.static('uploads'));


// // Routes
// app.use('/api/auth', require('./routes/auth'));
// // app.use('/api/users', require('./routes/users'));
// app.use('/api/sessions', require('./routes/sessions'));
// app.use('/api/resources', require('./routes/resources'));
// app.use('/api/groups', require('./routes/groups'));
// app.use('/api/posts', require('./routes/posts'));
// app.use('/api/reviews', require('./routes/reviews'));
// app.use('/api/ai', require('./routes/ai'));
// app.use('/api/users', userRoutes);  // ADD THIS LINE


// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'P2P Platform API is running',
//     timestamp: new Date().toISOString()
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'Route not found'
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({
//     success: false,
//     message: 'Server error',
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log('');
//   console.log('🚀 Server running on port ' + PORT);
//   console.log('📍 Environment: ' + (process.env.NODE_ENV || 'development'));
//   console.log('🌐 API: http://localhost:' + PORT + '/api');
//   console.log('💚 Health Check: http://localhost:' + PORT + '/api/health');
//   console.log('');
// });





// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const path = require('path');
// const connectDB = require('./config/db');

// const app = express();

// // Connect to MongoDB
// connectDB();

// // Middleware
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Serve uploaded files
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Import Routes
// const authRoutes = require('./routes/auth');
// const userRoutes = require('./routes/users');
// const sessionRoutes = require('./routes/sessions');
// const resourceRoutes = require('./routes/resources');
// const groupRoutes = require('./routes/groups');
// const postRoutes = require('./routes/posts');
// const reviewRoutes = require('./routes/reviews');
// const moduleRoutes = require('./routes/modules');
// const aiRoutes = require('./routes/ai');

// // Mount Routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/sessions', sessionRoutes);
// app.use('/api/resources', resourceRoutes);
// app.use('/api/groups', groupRoutes);
// app.use('/api/posts', postRoutes);
// app.use('/api/reviews', reviewRoutes);
// app.use('/api/modules', moduleRoutes);
// app.use('/api/ai', aiRoutes);

// // Root route
// app.get('/', (req, res) => {
//   res.json({ 
//     success: true,
//     message: 'P2P Academic Platform API',
//     version: '1.0.0',
//     timestamp: new Date().toISOString()
//   });
// });

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ 
//     success: true, 
//     message: 'P2P Platform API is running',
//     database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected',
//     timestamp: new Date().toISOString()
//   });
// });

// // API documentation route (optional)
// app.get('/api', (req, res) => {
//   res.json({
//     success: true,
//     message: 'P2P Platform API Endpoints',
//     endpoints: {
//       auth: {
//         register: 'POST /api/auth/register',
//         login: 'POST /api/auth/login',
//         logout: 'POST /api/auth/logout',
//         me: 'GET /api/auth/me'
//       },
//       users: {
//         getAll: 'GET /api/users',
//         getById: 'GET /api/users/:id',
//         update: 'PUT /api/users/:id',
//         delete: 'DELETE /api/users/:id',
//         updateRole: 'PATCH /api/users/:id/role',
//         updateStatus: 'PATCH /api/users/:id/status'
//       },
//       sessions: {
//         getAll: 'GET /api/sessions',
//         getById: 'GET /api/sessions/:id',
//         create: 'POST /api/sessions',
//         update: 'PUT /api/sessions/:id',
//         delete: 'DELETE /api/sessions/:id'
//       },
//       resources: {
//         getAll: 'GET /api/resources',
//         getById: 'GET /api/resources/:id',
//         upload: 'POST /api/resources',
//         update: 'PUT /api/resources/:id',
//         delete: 'DELETE /api/resources/:id',
//         download: 'GET /api/resources/:id/download',
//         myDownloads: 'GET /api/resources/my-downloads',
//         approve: 'POST /api/resources/:id/approve (Admin)',
//         reject: 'POST /api/resources/:id/reject (Admin)'
//       },
//       modules: {
//         getAll: 'GET /api/modules',
//         getById: 'GET /api/modules/:id'
//       },
//       ai: {
//         suggestResources: 'GET /api/ai/suggest-resources',
//         recommendSessions: 'GET /api/ai/recommend-sessions'
//       },
//       groups: {
//         getAll: 'GET /api/groups',
//         create: 'POST /api/groups'
//       },
//       posts: {
//         getAll: 'GET /api/posts',
//         create: 'POST /api/posts'
//       },
//       reviews: {
//         create: 'POST /api/reviews/resource',
//         getByResource: 'GET /api/reviews/resource/:id'
//       }
//     }
//   });
// });

// // 404 handler - must be after all routes
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: `Route ${req.originalUrl} not found`,
//     availableEndpoints: '/api for documentation'
//   });
// });

// // Global error handler - must be last
// app.use((err, req, res, next) => {
//   console.error('=== SERVER ERROR ===');
//   console.error('Error:', err.message);
//   console.error('Stack:', err.stack);
//   console.error('===================');
  
//   // Mongoose validation error
//   if (err.name === 'ValidationError') {
//     const errors = Object.values(err.errors).map(e => e.message);
//     return res.status(400).json({
//       success: false,
//       message: 'Validation error',
//       errors
//     });
//   }

//   // Mongoose duplicate key error
//   if (err.code === 11000) {
//     const field = Object.keys(err.keyValue)[0];
//     return res.status(400).json({
//       success: false,
//       message: `${field} already exists`
//     });
//   }

//   // Mongoose cast error (invalid ObjectId)
//   if (err.name === 'CastError') {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid ID format'
//     });
//   }

//   // JWT errors
//   if (err.name === 'JsonWebTokenError') {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid token'
//     });
//   }

//   if (err.name === 'TokenExpiredError') {
//     return res.status(401).json({
//       success: false,
//       message: 'Token expired'
//     });
//   }

//   // Default error
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Server error',
//     error: process.env.NODE_ENV === 'development' ? err.stack : undefined
//   });
// });

// // Handle unhandled promise rejections
// process.on('unhandledRejection', (err) => {
//   console.error('=== UNHANDLED REJECTION ===');
//   console.error('Error:', err.message);
//   console.error('Stack:', err.stack);
//   console.error('===========================');
//   // Don't crash the server, just log it
// });

// // Handle uncaught exceptions
// process.on('uncaughtException', (err) => {
//   console.error('=== UNCAUGHT EXCEPTION ===');
//   console.error('Error:', err.message);
//   console.error('Stack:', err.stack);
//   console.error('==========================');
//   // Exit process for uncaught exceptions
//   process.exit(1);
// });

// const PORT = process.env.PORT || 5000;

// const server = app.listen(PORT, () => {
//   console.log('');
//   console.log('╔════════════════════════════════════════════════════════╗');
//   console.log('║                                                        ║');
//   console.log('║          🎓 P2P Academic Platform API Server           ║');
//   console.log('║                                                        ║');
//   console.log('╚════════════════════════════════════════════════════════╝');
//   console.log('');
//   console.log('🚀 Server Status:        RUNNING');
//   console.log('📍 Port:                ' + PORT);
//   console.log('🌍 Environment:         ' + (process.env.NODE_ENV || 'development'));
//   console.log('💾 Database:            ' + (mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'));
//   console.log('');
//   console.log('📌 API Endpoints:');
//   console.log('   → Root:              http://localhost:' + PORT);
//   console.log('   → API Docs:          http://localhost:' + PORT + '/api');
//   console.log('   → Health Check:      http://localhost:' + PORT + '/api/health');
//   console.log('');
//   console.log('🔗 Available Routes:');
//   console.log('   → Auth:              /api/auth/*');
//   console.log('   → Users:             /api/users/*');
//   console.log('   → Sessions:          /api/sessions/*');
//   console.log('   → Resources:         /api/resources/*');
//   console.log('   → Modules:           /api/modules/*');
//   console.log('   → Groups:            /api/groups/*');
//   console.log('   → Posts:             /api/posts/*');
//   console.log('   → Reviews:           /api/reviews/*');
//   console.log('   → AI:                /api/ai/*');
//   console.log('');
//   console.log('💡 Tip: Visit http://localhost:' + PORT + '/api for full documentation');
//   console.log('');
//   console.log('════════════════════════════════════════════════════════');
//   console.log('');
// });

// // Graceful shutdown
// process.on('SIGTERM', () => {
//   console.log('');
//   console.log('👋 SIGTERM signal received: closing HTTP server');
//   server.close(() => {
//     console.log('✅ HTTP server closed');
//     mongoose.connection.close(false, () => {
//       console.log('✅ MongoDB connection closed');
//       process.exit(0);
//     });
//   });
// });

// module.exports = app;

//server.js
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

// Placeholder for unimplemented routes
const toBeImplemented = (req, res) => {
  res.status(200).json({
    success: true,
    message: "Feature to be implemented",
    path: req.originalUrl
  });
};

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/ai', aiRoutes);

// Unimplemented Routes (Placeholders)
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

// API documentation route
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'P2P Platform API Endpoints',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me'
      },
      users: {
        getAll: 'GET /api/users',
        getById: 'GET /api/users/:id',
        update: 'PUT /api/users/:id',
        delete: 'DELETE /api/users/:id',
        updateRole: 'PATCH /api/users/:id/role',
        updateStatus: 'PATCH /api/users/:id/status'
      },
      sessions: "To be implemented",
      resources: "To be implemented",
      groups: "To be implemented",
      posts: "To be implemented",
      reviews: "To be implemented",
      modules: "To be implemented",
      ai: "To be implemented"
    }
  });
});



// 404 handler - must be after all routes
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.method, req.originalUrl);
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: '/api for documentation'
  });
});

// Global error handler - must be last
app.use((err, req, res, next) => {
  console.error('=== SERVER ERROR ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('===================');
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('=== UNHANDLED REJECTION ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('===========================');
  // Don't crash the server, just log it
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('=== UNCAUGHT EXCEPTION ===');
  console.error('Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('==========================');
  // Exit process for uncaught exceptions
  process.exit(1);
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║                                                        ║');
  console.log('║          🎓 P2P Academic Platform API Server           ║');
  console.log('║                                                        ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('🚀 Server Status:        RUNNING');
  console.log('📍 Port:                ' + PORT);
  console.log('🌍 Environment:         ' + (process.env.NODE_ENV || 'development'));
  console.log('💾 Database:            ' + (mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'));
  console.log('');
  console.log('📌 API Endpoints:');
  console.log('   → Root:              http://localhost:' + PORT);
  console.log('   → API Docs:          http://localhost:' + PORT + '/api');
  console.log('   → Health Check:      http://localhost:' + PORT + '/api/health');
  console.log('');
  console.log('🔗 Available Routes:');
  console.log('   → Auth:              /api/auth/*');
  console.log('   → Users:             /api/users/*');
  console.log('   → Sessions:          /api/sessions/*');
  console.log('   → Resources:         /api/resources/*');
  console.log('   → Modules:           /api/modules/*');
  console.log('   → Groups:            /api/groups/*');
  console.log('   → Posts:             /api/posts/*');
  console.log('   → Reviews:           /api/reviews/*');
  console.log('   → AI:                /api/ai/*');
  console.log('');
  console.log('💡 Tip: Visit http://localhost:' + PORT + '/api for full documentation');
  console.log('');
  console.log('════════════════════════════════════════════════════════');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('');
  console.log('👋 SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = app;