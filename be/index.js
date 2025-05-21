"use strict";
const { server } = require("./src/app");

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Crl + C to stop the server
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server Express stopped");

    // notify.send('Server Express stopped');
    process.exit(0);
  });
});