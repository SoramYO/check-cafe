"use strict";

const mongoose = require("mongoose");
const os = require("os");
const process = require("process");

const _SECOND = 5000
// Count the number of connections
const countConnect = () => {
  const numConnect = mongoose.connections.length;
  console.log(`Number of connections: ${numConnect}`);
  return numConnect;
};

// Check over load connect
const checkOverLoadConnect = () => {
  setInterval(() => {
    const numConnect = mongoose.connections.length;
    const numCores = os.cpus().length;
    const memoryUsage = process.memoryUsage().rss;
    // example maximum number of connections based on the number of cores

    const maxConnections = numCores * 5

    const percentMemoryUsage = memoryUsage / os.totalmem() * 100;

    console.log(`Number of connections: ${numConnect}`);
    console.log(`Memory usage: ${memoryUsage / 1024 / 1024} MB, ${percentMemoryUsage.toFixed(2)}%`);

    if(numConnect > maxConnections) {
      console.log(`Overload connections: ${numConnect}`);
      // notify.send(....)
    }

  }, _SECOND); // Moniter every 5 seconds
}

module.exports = { countConnect };
