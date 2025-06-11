"use strict";

const express = require("express");
const { checkAuth } = require("../../auth/checkAuth");
const router = express.Router();
const checkinController = require("../../controllers/checkin.controller");
const uploadCloud = require("../../configs/cloudinary.config");

// Tất cả checkin routes cần authentication
router.use(checkAuth);

// Upload checkin với ảnh
router.post("/", uploadCloud.single("image"), checkinController.uploadCheckin);

// Lấy feed checkin (bản thân và bạn bè)
router.get("/", checkinController.getCheckins);

// Lấy checkin gần vị trí hiện tại
router.get("/nearby", checkinController.getNearbyCheckins);

// Lấy checkin của một user cụ thể
router.get("/user/:userId", checkinController.getUserCheckins);

// Like/Unlike checkin
router.post("/:checkinId/like", checkinController.likeCheckin);

// Comment on checkin
router.post("/:checkinId/comment", checkinController.commentCheckin);

// Báo cáo checkin
router.post("/:checkinId/report", checkinController.reportCheckin);

// Xóa checkin
router.delete("/:checkinId", checkinController.deleteCheckin);

module.exports = router; 