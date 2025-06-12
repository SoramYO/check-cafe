"use strict";

const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");

let socketInstance = null;

const initSocket = (server) => {
  // Get CORS origins from environment variable, with fallback
  const allowedOrigins = process.env.SOCKET_CORS_ORIGINS 
    ? process.env.SOCKET_CORS_ORIGINS.split(',').map(origin => origin.trim())
    : [
        process.env.CLIENT_URL || "http://localhost:5173",
        "http://localhost:3002",
        "https://api.checkafe.online",
        "https://checkafe-admin.onrender.com"
      ];

  const io = socketIo(server, {
    cors: {
      origin: function (origin, callback) {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        
        // Allow any localhost origin for development
        if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
          return callback(null, true);
        }
        
        // Check against allowed origins
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }
        
        // Allow for development and testing
        if (process.env.NODE_ENV !== 'production') {
          return callback(null, true);
        }
        
        return callback(new Error('Not allowed by CORS'), false);
      },
      methods: ["GET", "POST"],
      credentials: true,
      allowEIO3: true // Support for older Socket.IO clients
    },
    // Additional configuration for better mobile support
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000,
    upgradeTimeout: 30000,
    allowRequest: (req, callback) => {
      // Allow all connections in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      callback(null, true);
    }
  });

  // Lưu trữ mapping user_id -> socket.id
  const userSockets = new Map();

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token required"));
    }

    try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_SIGNATURE);
      socket.user = decoded; 
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.userId} from ${socket.handshake.address}`);

    // Lưu socket.id vào userSockets
    userSockets.set(socket.user.userId, socket.id);

    // Gửi sự kiện xác thực thành công
    socket.emit("authenticated", { 
      message: "Connected to notification service",
      userId: socket.user.userId,
      timestamp: new Date().toISOString()
    });

    // Handle ping/pong for connection health
    socket.on('ping', () => {
      socket.emit('pong');
    });

    // Xử lý ngắt kết nối
    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.user.userId}, reason: ${reason}`);
      userSockets.delete(socket.user.userId);
    });

    // Handle connection errors
    socket.on("error", (error) => {
      console.error(`Socket error for user ${socket.user.userId}:`, error);
    });
  });

  // Hàm gửi thông báo đến user_id
  const emitNotification = (user_id, notification) => {
    const socketId = userSockets.get(user_id.toString());
    if (socketId) {
      io.to(socketId).emit("notification", notification);
      console.log(`Notification sent to user ${user_id}`);
      return true;
    } else {
      console.log(`User ${user_id} not connected to socket`);
      return false;
    }
  };

  // Function to broadcast to all connected users
  const broadcastNotification = (notification) => {
    io.emit("broadcast_notification", notification);
    console.log(`Broadcast notification sent to ${userSockets.size} connected users`);
  };

  // Function to get connected users count
  const getConnectedUsersCount = () => {
    return userSockets.size;
  };

  // Function to check if user is connected
  const isUserConnected = (user_id) => {
    return userSockets.has(user_id.toString());
  };

  // Lưu instance để có thể truy cập từ bất kỳ đâu
  socketInstance = { 
    io, 
    emitNotification, 
    broadcastNotification, 
    getConnectedUsersCount, 
    isUserConnected 
  };

  return socketInstance;
};

// Function để lấy socket instance hiện tại
const getSocketInstance = () => {
  return socketInstance;
};

module.exports = { initSocket, getSocketInstance };