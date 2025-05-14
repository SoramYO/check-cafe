"use strict";

const express = require("express");
const router = express.Router();

router.use("/access", require("./access"));
router.use("/user", require("./user"));
router.use("/admin", require("./admin"));
router.use("/themes", require("./shopTheme"));
router.use("/shops", require("./shop"));
router.use("/reviews", require("./review"));
router.use("/reservations", require("./reservation"));
router.use("/owners", require("./showOwner"));
router.use("/notifications", require("./notification"));
router.use("/menu-item-categories", require("./menuItemCategory"));
router.use("/verifications", require("./verification"));
router.use("/advertisements", require("./advertisement"));
module.exports = router;
