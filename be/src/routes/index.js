"use strict";

const express = require("express");
const router = express.Router();

router.use("/access", require("./access"));
router.use("/customer", require("./customer"));
router.use("/admin", require("./admin"));
router.use("/themes", require("./shopTheme"));
router.use("/shops", require("./shop"));

module.exports = router;
