"use strict";

const express = require("express");
const router = express.Router();
const adminService = require("../services/admin.service");

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

// ===== PUBLIC POST ROUTES =====
router.get("/posts", async (req, res) => {
  try {
    const { page = 1, limit = 5, search } = req.query;
    const result = await adminService.getPosts({ page, limit, status: "published", search });
    if (result.code === "200") {
      res.status(200).json({ status: 200, data: result.metadata });
    } else {
      res.status(Number(result.code) || 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/posts/:id", async (req, res) => {
  try {
    const result = await adminService.getPostById(req.params.id);
    if (result.code === "200" && result.metadata.post.status === "published") {
      res.status(200).json({ status: 200, data: result.metadata });
    } else if (result.code === "200") {
      res.status(404).json({ status: 404, message: "Post not found or not published" });
    } else {
      res.status(Number(result.code) || 500).json(result);
    }
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

router.get("/posts/slug/:url", async (req, res) => {
  try {
    const postModel = require("../models/post.model");
    const post = await postModel.findOne({ url: req.params.url, status: "published" }).lean();
    if (!post) {
      return res.status(404).json({ status: 404, message: "Post not found" });
    }
    res.status(200).json({ status: 200, data: { post } });
  } catch (error) {
    res.status(500).json({ status: 500, message: error.message });
  }
});

module.exports = router;
