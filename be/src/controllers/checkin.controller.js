"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const checkinService = require("../services/checkin.service");

class CheckinController {
  // Upload checkin với ảnh
  uploadCheckin = asyncHandler(async (req, res, next) => {
    const result = await checkinService.createCheckin(req);
    
    new CREATED({
      message: "Checkin created successfully",
      data: result,
    }).send(res);
  });

  // Lấy feed checkin (bản thân và bạn bè)
  getCheckins = asyncHandler(async (req, res, next) => {
    console.log("=== CONTROLLER GET CHECKINS START ===");
    
    try {
      console.log("Calling checkinService.getCheckinFeed...");
      const result = await checkinService.getCheckinFeed(req);
      console.log("Service returned result:", JSON.stringify(result, null, 2));
      
      console.log("Creating OK response...");
      const response = new OK({
        message: "Checkins retrieved successfully",
        data: result,
      });
      console.log("Response object created:", JSON.stringify(response, null, 2));
      
      console.log("Sending response...");
      response.send(res);
      console.log("=== CONTROLLER GET CHECKINS SUCCESS ===");
    } catch (error) {
      console.error("=== CONTROLLER GET CHECKINS ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      throw error;
    }
  });

  // Lấy checkin của một user cụ thể
  getUserCheckins = asyncHandler(async (req, res, next) => {
    const result = await checkinService.getUserCheckins(req);
    
    new OK({
      message: "User checkins retrieved successfully",
      data: result,
    }).send(res);
  });

  // Lấy checkin gần vị trí hiện tại
  getNearbyCheckins = asyncHandler(async (req, res, next) => {
    const result = await checkinService.getNearbyCheckins(req);
    
    new OK({
      message: "Nearby checkins retrieved successfully",
      data: result,
    }).send(res);
  });

  // Like/Unlike checkin
  likeCheckin = asyncHandler(async (req, res, next) => {
    const result = await checkinService.likeCheckin(req);
    
    new OK({
      message: result.isLiked ? "Checkin liked" : "Checkin unliked",
      data: result,
    }).send(res);
  });

  // Get Comments of a checkin
  getCheckinComments = asyncHandler(async (req, res, next) => {
    const result = await checkinService.getCheckinComments(req);
    
    new OK({
      message: "Checkin comments retrieved successfully",
      data: result,
    }).send(res);
  });

  // Comment on checkin
  commentCheckin = asyncHandler(async (req, res, next) => {
    const result = await checkinService.commentCheckin(req);
    
    new CREATED({
      message: "Comment added successfully",
      data: result,
    }).send(res);
  });

  // Xóa checkin
  deleteCheckin = asyncHandler(async (req, res, next) => {
    const result = await checkinService.deleteCheckin(req);
    
    new OK({
      message: "Checkin deleted successfully",
      data: result,
    }).send(res);
  });

  // Báo cáo checkin
  reportCheckin = asyncHandler(async (req, res, next) => {
    const result = await checkinService.reportCheckin(req);
    
    new OK({
      message: "Checkin reported successfully",
      data: result,
    }).send(res);
  });
}

module.exports = new CheckinController(); 