"use strict";

const express = require("express");
const router = express.Router();

router.use("/access", require("./access"));
router.use("/customer", require("./customer"));
router.use("/admin", require("./admin"));
router.use("/themes", require("./shopTheme"));
router.use("/shops", require("./shop"));
router.use("/categories", require("./category"));
router.use("/advertisements", require("./advertisement"));
router.use("/reservations", require("./reservation"));
router.use("/owners", require("./showOwner"));

module.exports = router;
