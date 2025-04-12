"use strict";

const express = require("express");
const router = express.Router();

router.use("/access", require("./access"));
router.use("/user", require("./user"));
router.use("/admin", require("./admin"));

module.exports = router;
