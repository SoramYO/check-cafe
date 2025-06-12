"use strict";

const express = require("express");
const { checkAuth } = require("../../auth/checkAuth");
const router = express.Router();
const friendController = require("../../controllers/friend.controller");

// Tất cả friend routes cần authentication
router.use(checkAuth);

// Gửi lời mời kết bạn
router.post("/request", friendController.sendFriendRequest);

// Chấp nhận lời mời kết bạn
router.patch("/request/:requestId/accept", friendController.acceptFriendRequest);

// Từ chối lời mời kết bạn
router.patch("/request/:requestId/reject", friendController.rejectFriendRequest);

// Lấy danh sách bạn bè
router.get("/", friendController.getFriends);

// Lấy danh sách lời mời kết bạn
router.get("/requests", friendController.getFriendRequests);

// Tìm kiếm người dùng để kết bạn
router.get("/search", friendController.searchUsers);

// Lấy gợi ý kết bạn
router.get("/suggestions", friendController.getFriendSuggestions);

// Kiểm tra trạng thái bạn bè với một user
router.get("/status/:userId", friendController.getFriendshipStatus);

// Hủy kết bạn
router.delete("/:userId", friendController.unfriend);

module.exports = router; 