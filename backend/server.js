/**
 * EventHub - Main Server Entry Point
 * Sets up Express, Socket.io, MongoDB, middleware, and routes
 */
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { initSocket } = require('./socket/socketHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();
const server = http.createServer(app);

// ─── Allowed origins ─────────────────────────────
const allowedOrigins = [
  'http://localhost:3000',
  'https://event-hub-blush-seven.vercel.app',
];

app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow Postman / server requests
    if(!allowedOrigins.includes(origin)){
      return callback(new Error('Not allowed by CORS'));
    }
    return callback(null, true);
  },
  credentials: true,
}));
initSocket(io);

// Attach io instance to every request so controllers can emit events
app.use((req, res, next) => {
  req.io = io;
  next();
});

// ─── Security Middleware ─────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ─── Express CORS ───────────────────────────────
app.use(cors({
  origin: function(origin, callback){
    if(!origin) return callback(null, true); // allow non-browser requests like Postman
    if(allowedOrigins.indexOf(origin) === -1){
      return callback(new Error('Not allowed by CORS'), false);
    }
    return callback(null, true);
  },
  credentials: true,
}));

// ─── General Middleware ─────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

// ─── API Routes ─────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'EventHub API is running 🚀', env: process.env.NODE_ENV });
});

// Root route
app.get("/", (req, res) => {
  res.send("EventHub API is running 🚀");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ───────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── Database & Server Start ────────────────────
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ FULL ERROR:', err);
    process.exit(1);
  });

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
  server.close(() => process.exit(1));
});

module.exports = { app, io };
