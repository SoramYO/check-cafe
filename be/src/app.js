require("dotenv").config();
const express = require("express");
const app = express();
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const os = require("os");
const router = require("./routes/index");

// cpu thread number : luồng xử lý
// process.env.UV_THREADPOOL_SIZE = os.cpus().length;

// init middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(
  compression({
    level: 6,
    threshold: 100 * 1000, // trên 100kB thì mới compress
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// init DB
require("./dbs/init.mongodb");
// init routes
app.use("/", router);

// handling errors

module.exports = app;
