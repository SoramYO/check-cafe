"use strict";
const { showMemoryUsage, getSystemInfo, logServerStart, logServerStop, getTime } = require('./enhanced-console-logger');
const { server } = require("./src/app");

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  showMemoryUsage();
  logServerStart(PORT, "Server");
});

// Crl + C to stop the server
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server Express stopped");
    logServerStop();
    // notify.send('Server Express stopped');
    process.exit(0);
  });
});

const app = require('./src/app');
module.exports = app;