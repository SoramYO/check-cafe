"use strict";

const jwt = require("jsonwebtoken");
const socketIo = require("socket.io");

const initSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
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
    console.log(`User connected: ${socket.user.userId}`);

    // Lưu socket.id vào userSockets
    userSockets.set(socket.user.userId, socket.id);

    // Gửi sự kiện xác thực thành công
    socket.emit("authenticated", { message: "Connected to notification service" });

    // Xử lý ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.userId}`);
      userSockets.delete(socket.user.userId);
    });
  });

  // Hàm gửi thông báo đến user_id
  const emitNotification = (user_id, notification) => {
    const socketId = userSockets.get(user_id.toString());
    if (socketId) {
      io.to(socketId).emit("notification", notification);
    }
  };

  return { io, emitNotification };
};

module.exports = initSocket;