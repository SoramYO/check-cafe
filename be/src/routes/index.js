"use strict";

const express = require("express");
const router = express.Router();

// Health check endpoint
router.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    service: "CheckCafe Backend",
    version: "1.0.0"
  });
});

router.use("/access", require("./access"));
router.use("/user", require("./user"));
router.use("/admin", require("./admin"));
router.use("/themes", require("./shopTheme"));
router.use("/amenities", require("./shopAmenity"));
router.use("/shops", require("./shop"));
router.use("/reviews", require("./review"));
router.use("/reservations", require("./reservation"));
router.use("/owners", require("./showOwner"));
router.use("/notifications", require("./notification"));
router.use("/menu-item-categories", require("./menuItemCategory"));
router.use("/verifications", require("./verification"));
router.use("/advertisements", require("./advertisement"));
router.use("/packages", require("./package"));
router.use("/user-packages", require("./userPackage"));
router.use("/discounts", require("./discount"));
router.use("/payments", require("./payment"));
router.use("/analytics", require("./analytics"));
router.use("/checkins", require("./checkin"));
router.use("/friends", require("./friend"));

module.exports = router;
