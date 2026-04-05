/**
 * Socket.io Handler
 * Manages real-time connections, rooms, and event broadcasting
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const connectedUsers = new Map(); // userId -> socketId

const initSocket = (io) => {
  // Authenticate socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('User not found'));

      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    connectedUsers.set(userId, socket.id);

    // Join personal room (for direct notifications)
    socket.join(userId);
    // Join role room
    socket.join(socket.user.role);

    console.log(`🔌 User connected: ${socket.user.name} (${socket.user.role})`);

    // ── Event: join event room (for real-time updates about specific event)
    socket.on('join_event', (eventId) => {
      socket.join(`event:${eventId}`);
    });

    socket.on('leave_event', (eventId) => {
      socket.leave(`event:${eventId}`);
    });

    // ── Event: typing / ping (keep-alive)
    socket.on('ping', () => {
      socket.emit('pong', { time: Date.now() });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(userId);
      console.log(`🔌 User disconnected: ${socket.user.name}`);
    });
  });

  // Helper to emit to specific user by ID
  io.emitToUser = (userId, event, data) => {
    io.to(userId.toString()).emit(event, data);
  };

  return io;
};

module.exports = { initSocket, connectedUsers };
