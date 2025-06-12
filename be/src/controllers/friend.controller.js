"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const friendService = require("../services/friend.service");

class FriendController {
  // Gửi lời mời kết bạn
  sendFriendRequest = asyncHandler(async (req, res, next) => {
    const result = await friendService.sendFriendRequest(req);
    
    new CREATED({
      message: "Friend request sent successfully",
      data: result,
    }).send(res);
  });

  // Chấp nhận lời mời kết bạn
  acceptFriendRequest = asyncHandler(async (req, res, next) => {
    const result = await friendService.acceptFriendRequest(req);
    
    new OK({
      message: "Friend request accepted",
      data: result,
    }).send(res);
  });

  // Từ chối lời mời kết bạn
  rejectFriendRequest = asyncHandler(async (req, res, next) => {
    const result = await friendService.rejectFriendRequest(req);
    
    new OK({
      message: "Friend request rejected",
      data: result,
    }).send(res);
  });

  // Hủy kết bạn
  unfriend = asyncHandler(async (req, res, next) => {
    const result = await friendService.unfriend(req);
    
    new OK({
      message: "Unfriended successfully",
      data: result,
    }).send(res);
  });

  // Lấy danh sách bạn bè
  getFriends = asyncHandler(async (req, res, next) => {
    const result = await friendService.getFriends(req);
    
    new OK({
      message: "Friends retrieved successfully",
      data: result,
    }).send(res);
  });

  // Lấy danh sách lời mời kết bạn
  getFriendRequests = asyncHandler(async (req, res, next) => {
    const result = await friendService.getFriendRequests(req);
    
    new OK({
      message: "Friend requests retrieved successfully",
      data: result,
    }).send(res);
  });

  // Tìm kiếm người dùng để kết bạn
  searchUsers = asyncHandler(async (req, res, next) => {
    const result = await friendService.searchUsers(req);
    
    new OK({
      message: "Users retrieved successfully",
      data: result,
    }).send(res);
  });

  // Kiểm tra trạng thái bạn bè với một user
  getFriendshipStatus = asyncHandler(async (req, res, next) => {
    const result = await friendService.getFriendshipStatus(req);
    
    new OK({
      message: "Friendship status retrieved successfully",
      data: result,
    }).send(res);
  });

  // Lấy gợi ý kết bạn
  getFriendSuggestions = asyncHandler(async (req, res, next) => {
    const result = await friendService.getFriendSuggestions(req);
    
    new OK({
      message: "Friend suggestions retrieved successfully",
      data: result,
    }).send(res);
  });
}

module.exports = new FriendController(); 