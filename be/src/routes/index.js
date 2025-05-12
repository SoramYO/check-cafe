"use strict";

const express = require("express");
const router = express.Router();

router.use("/access", require("./access"));
router.use("/admin", require("./admin"));
router.use("/themes", require("./shopTheme"));
router.use("/shops", require("./shop"));

router.use("/reservations", require("./reservation"));
router.use("/owners", require("./showOwner"));
router.use("/notifications", require("./notification"));
router.use("/menu-item-categories", require("./menuItemCategory"));
router.use("/verifications", require("./verification"));
module.exports = router;
