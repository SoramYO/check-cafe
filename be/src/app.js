"use strict";

require("dotenv").config();
const express = require("express");
const http = require("http");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const cors = require("cors");
const os = require("os");
const router = require("./routes/index");
const { swaggerUi, swaggerSetup } = require("./configs/swagger.config");
const { initSocket } = require("./socket/socket");

// process.env.UV_THREADPOOL_SIZE = os.cpus().length;

// init app
const app = express();
const server = http.createServer(app);

// init Socket.IO
const { io, emitNotification } = initSocket(server);
app.locals.emitNotification = emitNotification;

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(
  compression({
    level: 6,
    threshold: 100 * 1000, // trên 100kB thì mới compress
  })
);

// CORS configuration
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3002", // Frontend URL
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, // Allow cookies and authentication headers
    maxAge: 86400, // Cache preflight requests for 24 hours
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init DB
require("./dbs/init.mongodb");

// init routes
app.use("/api/v1", router);

// swagger
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", (req, res) => {
  res.send(swaggerSetup(req, res));
});

// handling errors
app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  const statusCode = error.status || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "Internal Server Error",
    stack: error.stack,
  });
});

module.exports = { app, server };