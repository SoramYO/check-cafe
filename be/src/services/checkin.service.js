"use strict";

const checkinModel = require("../models/checkin.model");
const checkinLikeModel = require("../models/checkinLike.model");
const checkinCommentModel = require("../models/checkinComment.model");
const friendModel = require("../models/friend.model");
const userModel = require("../models/user.model");
const { getInfoData } = require("../utils");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../configs/error.response");
const mongoose = require("mongoose");
const NotificationHelper = require("../utils/notification.helper");

// Helper function to sanitize MongoDB objects for JSON serialization
const sanitizeForJSON = (obj) => {
  if (obj === null || obj === undefined) {
    return obj;
  }
  
  if (obj instanceof mongoose.Types.ObjectId) {
    return obj.toString();
  }
  
  if (obj instanceof Date) {
    return obj.toISOString();
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForJSON(item));
  }
  
  if (typeof obj === 'object' && obj !== null) {
    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeForJSON(value);
    }
    return sanitized;
  }
  
  return obj;
};

class CheckinService {
  // Tạo checkin mới
  createCheckin = async (req) => {
    console.log("=== CREATE CHECKIN START ===");
    console.log("Request body:", JSON.stringify(req.body, null, 2));
    console.log("Request file:", req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      filename: req.file.filename
    } : "No file");
    console.log("Request user:", req.user);

    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { title, location, visibility, cafeId, tags } = req.body;
      const imageFile = req.file;

      console.log("Extracted parameters:");
      console.log("- userId:", userId);
      console.log("- title:", title);
      console.log("- location:", location);
      console.log("- visibility:", visibility);
      console.log("- cafeId:", cafeId);
      console.log("- tags:", tags);
      console.log("- imageFile exists:", !!imageFile);

      // Validation
      if (!imageFile) {
        console.log("ERROR: No image file provided");
        throw new BadRequestError("Image is required");
      }

      if (!title || title.trim() === '') {
        console.log("ERROR: No title provided");
        throw new BadRequestError("Title is required");
      }

      if (!location) {
        console.log("ERROR: No location provided");
        throw new BadRequestError("Location is required");
      }

      console.log("Validation passed, parsing data...");

      // Parse location và tags nếu được gửi dưới dạng string
      let parsedLocation, parsedTags;
      
      try {
        parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
        console.log("Parsed location:", JSON.stringify(parsedLocation, null, 2));
      } catch (parseError) {
        console.log("ERROR parsing location:", parseError.message);
        throw new BadRequestError("Invalid location format");
      }

      try {
        parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);
        console.log("Parsed tags:", JSON.stringify(parsedTags, null, 2));
      } catch (parseError) {
        console.log("ERROR parsing tags:", parseError.message);
        throw new BadRequestError("Invalid tags format");
      }

      // Validate location structure
      if (!parsedLocation.latitude || !parsedLocation.longitude) {
        console.log("ERROR: Location missing latitude or longitude");
        console.log("Location object:", JSON.stringify(parsedLocation, null, 2));
        throw new BadRequestError("Location must include latitude and longitude");
      }

      console.log("Location validation passed");

      const imageUrl = imageFile.path; // URL từ Cloudinary
      const imagePublicId = imageFile.filename; // Public ID từ Cloudinary

      console.log("Image details:");
      console.log("- imageUrl:", imageUrl);
      console.log("- imagePublicId:", imagePublicId);

      console.log("Creating checkin in database...");

      let newCheckin;
      try {
        newCheckin = await checkinModel.create({
          user_id: userId,
          title: title.trim(),
          image: imageUrl,
          imagePublicId,
          location: {
            type: "Point",
            coordinates: [parsedLocation.longitude, parsedLocation.latitude],
            address: parsedLocation.address,
            name: parsedLocation.name,
          },
          visibility: visibility || "friends",
          cafe_id: cafeId || null,
          tags: parsedTags,
        });
        console.log("Checkin created successfully:", newCheckin._id);
      } catch (dbError) {
        console.error("Database error creating checkin:", dbError);
        console.error("Database error details:", {
          message: dbError.message,
          code: dbError.code,
          name: dbError.name,
          stack: dbError.stack
        });
        throw new BadRequestError(`Failed to create checkin: ${dbError.message}`);
      }

      // Populate user info
      console.log("Populating checkin data...");
      let populatedCheckin;
      try {
        populatedCheckin = await checkinModel
          .findById(newCheckin._id)
          .populate('user_id', 'full_name avatar')
          .populate('cafe_id', 'name address');

        console.log("Populated checkin:", JSON.stringify(populatedCheckin, null, 2));
      } catch (populateError) {
        console.error("Error populating checkin data:", populateError);
        console.error("Populate error details:", {
          message: populateError.message,
          stack: populateError.stack,
          checkinId: newCheckin._id
        });
        // Continue with unpopulated data if populate fails
        populatedCheckin = newCheckin;
      }

      // Gửi thông báo cho bạn bè khi checkin (chỉ với visibility friends hoặc public)
      if (populatedCheckin.visibility === 'friends' || populatedCheckin.visibility === 'public') {
        console.log("Sending notifications to friends...");
        try {
          // Lấy danh sách bạn bè
          const friends = await friendModel.find({
            $or: [
              { requester_id: userId, status: 'accepted' },
              { recipient_id: userId, status: 'accepted' }
            ]
          });

          console.log("Found friends:", friends.length);

          const friendIds = friends.map(friend =>
            friend.requester_id.toString() === userId.toString()
              ? friend.recipient_id.toString()
              : friend.requester_id.toString()
          );

          console.log("Friend IDs:", friendIds);

          if (friendIds.length > 0) {
            const locationName = populatedCheckin.location?.name ||
              populatedCheckin.location?.address ||
              populatedCheckin.cafe_id?.name ||
              'một địa điểm';

            console.log("Sending notification with location name:", locationName);

            // Wrap notification in try-catch to prevent it from breaking the main flow
            try {
              await NotificationHelper.sendFriendCheckinNotification({
                friend_ids: friendIds,
                friend_name: populatedCheckin.user_id.full_name,
                location_name: locationName,
                checkin_id: populatedCheckin._id,
              });
              console.log("Notification sent successfully");
            } catch (notificationError) {
              console.error("Error in sendFriendCheckinNotification:", notificationError);
              console.error("Notification error details:", {
                message: notificationError.message,
                stack: notificationError.stack,
                friend_ids: friendIds,
                friend_name: populatedCheckin.user_id.full_name,
                location_name: locationName,
                checkin_id: populatedCheckin._id,
              });
              // Don't throw error to prevent breaking the main checkin flow
            }
          }
        } catch (notificationError) {
          console.error("Error in friend notification flow:", notificationError);
          console.error("Friend notification error details:", {
            message: notificationError.message,
            stack: notificationError.stack,
            userId: userId,
            visibility: populatedCheckin.visibility
          });
          // Không throw error để không ảnh hưởng đến flow chính
        }
      }

      console.log("Preparing response data...");
      let responseData;
      try {
        responseData = getInfoData({
          fields: ["_id", "title", "image", "location", "visibility", "cafe_id", "tags", "likes_count", "comments_count", "createdAt", "user_id"],
          object: populatedCheckin,
        });
        console.log("Response data:", JSON.stringify(responseData, null, 2));
      } catch (transformError) {
        console.error("Error transforming response data:", transformError);
        console.error("Transform error details:", {
          message: transformError.message,
          stack: transformError.stack,
          populatedCheckin: JSON.stringify(populatedCheckin, null, 2)
        });
        // Fallback to basic response if transformation fails
        responseData = {
          _id: populatedCheckin._id,
          title: populatedCheckin.title,
          image: populatedCheckin.image,
          location: populatedCheckin.location,
          visibility: populatedCheckin.visibility,
          cafe_id: populatedCheckin.cafe_id,
          tags: populatedCheckin.tags,
          likes_count: populatedCheckin.likes_count,
          comments_count: populatedCheckin.comments_count,
          createdAt: populatedCheckin.createdAt,
          user_id: populatedCheckin.user_id,
        };
      }

      // Sanitize response for JSON serialization
      const sanitizedResponseData = sanitizeForJSON(responseData);
      console.log("Sanitized response data:", JSON.stringify(sanitizedResponseData, null, 2));

      console.log("=== CREATE CHECKIN SUCCESS ===");

      return sanitizedResponseData;

    } catch (error) {
      console.error("=== CREATE CHECKIN ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }
  };

  // Lấy feed checkin (bản thân và bạn bè)
  getCheckinFeed = async (req) => {
    console.log("=== GET CHECKIN FEED START ===");
    console.log("Request query:", JSON.stringify(req.query, null, 2));
    console.log("Request user:", req.user);

    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { page = 1, limit = 20, cafeId, tags } = req.query;

      console.log("Extracted parameters:");
      console.log("- userId:", userId);
      console.log("- page:", page);
      console.log("- limit:", limit);
      console.log("- cafeId:", cafeId);
      console.log("- tags:", tags);

      // Validate pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      console.log("Parsed pagination:");
      console.log("- pageNum:", pageNum);
      console.log("- limitNum:", limitNum);

      if (pageNum < 1) {
        console.log("ERROR: Invalid page number");
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limitNum < 1 || limitNum > 100) {
        console.log("ERROR: Invalid limit");
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      console.log("Pagination validation passed");

      // Lấy danh sách ID của bạn bè
      console.log("Finding friends...");
      const friends = await friendModel.find({
        $or: [
          { requester_id: userId, status: 'accepted' },
          { recipient_id: userId, status: 'accepted' }
        ]
      });

      console.log("Found friends count:", friends.length);

      const friendIds = friends.map(friend =>
        friend.requester_id.toString() === userId.toString()
          ? friend.recipient_id
          : friend.requester_id
      );

      // Thêm chính mình vào danh sách
      friendIds.push(new mongoose.Types.ObjectId(userId));

      console.log("Friend IDs (including self):", friendIds.map(id => id.toString()));

      const query = {
        user_id: { $in: friendIds },
        is_active: true,
        $or: [
          { visibility: 'public' },
          { visibility: 'friends', user_id: { $in: friendIds } },
          { visibility: 'private', user_id: userId }
        ]
      };

      console.log("Base query:", JSON.stringify(query, null, 2));

      // Áp dụng filters
      if (cafeId) {
        query.cafe_id = cafeId;
        console.log("Added cafe filter:", cafeId);
      }
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
        console.log("Added tags filter:", tagArray);
      }

      console.log("Final query:", JSON.stringify(query, null, 2));

      const skip = (pageNum - 1) * limitNum;
      console.log("Skip:", skip, "Limit:", limitNum);

      console.log("Executing database query...");
      const checkins = await checkinModel
        .find(query)
        .populate('user_id', 'full_name avatar')
        .populate('cafe_id', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      console.log("Found checkins count:", checkins.length);

      console.log("Counting total documents...");
      const total = await checkinModel.countDocuments(query);
      console.log("Total documents:", total);

      console.log("Preparing response...");
      const response = {
        checkins: checkins.map(checkin => getInfoData({
          fields: ["_id", "title", "image", "location", "visibility", "cafe_id", "tags", "likes_count", "comments_count", "createdAt", "user_id"],
          object: checkin,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        }
      };

      // Sanitize response for JSON serialization
      const sanitizedResponse = sanitizeForJSON(response);
      console.log("Sanitized response:", JSON.stringify(sanitizedResponse, null, 2));

      console.log("Response pagination:", JSON.stringify(sanitizedResponse.pagination, null, 2));
      console.log("=== GET CHECKIN FEED SUCCESS ===");

      return sanitizedResponse;

    } catch (error) {
      console.error("=== GET CHECKIN FEED ERROR ===");
      console.error("Error type:", error.constructor.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      throw error;
    }
  };

  // Lấy checkin của một user cụ thể
  getUserCheckins = async (req) => {
    try {
      // Extract parameters from req
      const currentUserId = req.user.userId;
      const { userId: targetUserId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Validate pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      if (pageNum < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      // Kiểm tra user tồn tại
      const targetUser = await userModel.findById(targetUserId);
      if (!targetUser) {
        throw new NotFoundError("User not found");
      }

      // Kiểm tra quyền xem checkin
      let query = {
        user_id: targetUserId,
        is_active: true,
      };

      if (targetUserId.toString() !== currentUserId.toString()) {
        // Kiểm tra mối quan hệ bạn bè
        const friendship = await friendModel.findOne({
          $or: [
            { requester_id: currentUserId, recipient_id: targetUserId, status: 'accepted' },
            { requester_id: targetUserId, recipient_id: currentUserId, status: 'accepted' }
          ]
        });

        if (friendship) {
          // Là bạn bè, có thể xem public và friends
          query.$or = [
            { visibility: 'public' },
            { visibility: 'friends' }
          ];
        } else {
          // Không phải bạn bè, chỉ xem public
          query.visibility = 'public';
        }
      }

      const skip = (pageNum - 1) * limitNum;

      const checkins = await checkinModel
        .find(query)
        .populate('user_id', 'full_name avatar')
        .populate('cafe_id', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await checkinModel.countDocuments(query);

      return {
        checkins: checkins.map(checkin => getInfoData({
          fields: ["_id", "title", "image", "location", "visibility", "cafe_id", "tags", "likes_count", "comments_count", "createdAt", "user_id"],
          object: checkin,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        }
      };

    } catch (error) {
      throw error;
    }
  };

  // Lấy checkin gần vị trí hiện tại
  getNearbyCheckins = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { lat: latitude, lng: longitude, radius = 5000, page = 1, limit = 20 } = req.query;

      // Validation
      if (!latitude || !longitude) {
        throw new BadRequestError("Latitude and longitude are required");
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusNum = parseInt(radius) || 5000;
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      if (isNaN(lat) || isNaN(lng)) {
        throw new BadRequestError("Invalid latitude or longitude");
      }

      if (pageNum < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      if (radiusNum < 1 || radiusNum > 50000) {
        throw new BadRequestError("Radius must be between 1 and 50000 meters");
      }

      // Lấy danh sách bạn bè
      const friends = await friendModel.find({
        $or: [
          { requester_id: userId, status: 'accepted' },
          { recipient_id: userId, status: 'accepted' }
        ]
      });

      const friendIds = friends.map(friend =>
        friend.requester_id.toString() === userId.toString()
          ? friend.recipient_id
          : friend.requester_id
      );
      friendIds.push(new mongoose.Types.ObjectId(userId));

      const query = {
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [lng, lat]
            },
            $maxDistance: radiusNum
          }
        },
        is_active: true,
        $or: [
          { visibility: 'public' },
          { visibility: 'friends', user_id: { $in: friendIds } },
          { visibility: 'private', user_id: userId }
        ]
      };

      const skip = (pageNum - 1) * limitNum;

      const checkins = await checkinModel
        .find(query)
        .populate('user_id', 'full_name avatar')
        .populate('cafe_id', 'name address')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);


      return checkins.map(checkin => getInfoData({
        fields: ["_id", "title", "image", "location", "visibility", "cafe_id", "tags", "likes_count", "comments_count", "createdAt", "user_id"],
        object: checkin,
      }));

    } catch (error) {
      throw error;
    }
  };

  // Like/Unlike checkin
  likeCheckin = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { checkinId } = req.params;

      // Validation
      if (!mongoose.isValidObjectId(checkinId)) {
        throw new BadRequestError("Invalid checkin ID");
      }

      // Kiểm tra checkin tồn tại
      const checkin = await checkinModel.findById(checkinId);
      if (!checkin) {
        throw new NotFoundError("Checkin not found");
      }

      if (!checkin.is_active) {
        throw new BadRequestError("Checkin is not active");
      }

      // Kiểm tra đã like chưa
      const existingLike = await checkinLikeModel.findOne({
        user_id: userId,
        checkin_id: checkinId,
      });

      let isLiked = false;

      if (existingLike) {
        // Unlike - thực hiện parallel để tăng performance
        await Promise.all([
          checkinLikeModel.findByIdAndDelete(existingLike._id),
          checkinModel.findByIdAndUpdate(
            checkinId,
            { $inc: { likes_count: -1 } },
            { new: true }
          )
        ]);
      } else {
        // Like - thực hiện parallel để tăng performance
        await Promise.all([
          checkinLikeModel.create({
            user_id: userId,
            checkin_id: checkinId,
          }),
          checkinModel.findByIdAndUpdate(
            checkinId,
            { $inc: { likes_count: 1 } },
            { new: true }
          )
        ]);
        
        isLiked = true;

        // Gửi thông báo cho chủ checkin khi có người like (không gửi cho chính mình)
        if (checkin.user_id.toString() !== userId.toString()) {
          try {
            // Lấy thông tin người like
            const liker = await userModel.findById(userId).select('full_name');

            console.log("Sending like notification to checkin owner:", checkin.user_id.toString());

            // Wrap notification in try-catch to prevent it from breaking the main flow
            try {
              await NotificationHelper.sendCheckinLikeNotification({
                checkin_owner_id: checkin.user_id.toString(),
                liker_name: liker.full_name,
                checkin_id: checkinId,
              });
              console.log("Like notification sent successfully");
            } catch (notificationError) {
              console.error("Error in sendCheckinLikeNotification:", notificationError);
              console.error("Like notification error details:", {
                message: notificationError.message,
                stack: notificationError.stack,
                checkin_owner_id: checkin.user_id.toString(),
                liker_name: liker.full_name,
                checkin_id: checkinId,
              });
              // Don't throw error to prevent breaking the main like flow
            }
          } catch (notificationError) {
            console.error("Error in like notification flow:", notificationError);
            console.error("Like notification error details:", {
              message: notificationError.message,
              stack: notificationError.stack,
              userId: userId,
              checkinId: checkinId,
              checkinOwnerId: checkin.user_id.toString()
            });
            // Không throw error để không ảnh hưởng đến flow chính
          }
        }
      }

      return { isLiked };

    } catch (error) {
      console.error("Error in likeCheckin:", error);
      throw error;
    }
  };

  // Lấy bình luận của một checkin
  getCheckinComments = async (req) => {
    try {
      // Extract parameters from req
      const { checkinId } = req.params;
      const { page = 1, limit = 20 } = req.query;

      // Validate pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      if (pageNum < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      // Validation
      if (!mongoose.isValidObjectId(checkinId)) {
        throw new BadRequestError("Invalid checkin ID");
      }

      // Kiểm tra checkin tồn tại
      const checkin = await checkinModel.findById(checkinId);
      if (!checkin) {
        throw new NotFoundError("Checkin not found");
      }

      if (!checkin.is_active) {
        throw new BadRequestError("Checkin is not active");
      }

      const skip = (pageNum - 1) * limitNum;

      const comments = await checkinCommentModel
        .find({ checkin_id: checkinId })
        .populate('user_id', 'full_name avatar')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum);

      const total = await checkinCommentModel.countDocuments({ checkin_id: checkinId });

      return {
        comments: comments.map(comment => getInfoData({
          fields: ["_id", "comment", "createdAt", "user_id"],
          object: comment,
        })),
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        }
      };

    } catch (error) {
      throw error;
    }
  };

  // Comment checkin
  commentCheckin = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { checkinId } = req.params;
      const { comment } = req.body;

      // Validation
      if (!mongoose.isValidObjectId(checkinId)) {
        throw new BadRequestError("Invalid checkin ID");
      }

      if (!comment || comment.trim() === '') {
        throw new BadRequestError("Comment is required");
      }

      // Kiểm tra checkin tồn tại
      const checkin = await checkinModel.findById(checkinId);
      if (!checkin) {
        throw new NotFoundError("Checkin not found");
      }

      if (!checkin.is_active) {
        throw new BadRequestError("Checkin is not active");
      }

      // Tạo comment trước
      const newComment = await checkinCommentModel.create({
        user_id: userId,
        checkin_id: checkinId,
        comment: comment.trim(),
      });

      // Tăng comments_count - nếu fail cũng không critical
      try {
        await checkinModel.findByIdAndUpdate(
          checkinId,
          { $inc: { comments_count: 1 } },
          { new: true }
        );
      } catch (countError) {
        console.error("Error updating comments_count:", countError);
        // Log lỗi nhưng không throw để không ảnh hưởng đến việc tạo comment
        // Có thể implement background job để sync lại count sau
      }

      // Populate user info
      const populatedComment = await checkinCommentModel
        .findById(newComment._id)
        .populate('user_id', 'full_name avatar');

      // Gửi thông báo cho chủ checkin khi có người comment (không gửi cho chính mình)
      if (checkin.user_id.toString() !== userId.toString()) {
        // Chạy notification async để không block response
        setImmediate(async () => {
          try {
            // Lấy thông tin người comment
            const commenter = await userModel.findById(userId).select('full_name');

            // Tạo preview của comment (tối đa 50 ký tự)
            const commentPreview = comment.trim().length > 50
              ? comment.trim().substring(0, 50) + "..."
              : comment.trim();

            console.log("Sending comment notification to checkin owner:", checkin.user_id.toString());

            // Wrap notification in try-catch to prevent it from breaking the main flow
            try {
              await NotificationHelper.sendCheckinCommentNotification({
                checkin_owner_id: checkin.user_id.toString(),
                commenter_name: commenter.full_name,
                comment_preview: commentPreview,
                checkin_id: checkinId,
              });
              console.log("Comment notification sent successfully");
            } catch (notificationError) {
              console.error("Error in sendCheckinCommentNotification:", notificationError);
              console.error("Comment notification error details:", {
                message: notificationError.message,
                stack: notificationError.stack,
                checkin_owner_id: checkin.user_id.toString(),
                commenter_name: commenter.full_name,
                comment_preview: commentPreview,
                checkin_id: checkinId,
              });
              // Don't throw error to prevent breaking the main comment flow
            }
          } catch (notificationError) {
            console.error("Error in comment notification flow:", notificationError);
            console.error("Comment notification error details:", {
              message: notificationError.message,
              stack: notificationError.stack,
              userId: userId,
              checkinId: checkinId,
              checkinOwnerId: checkin.user_id.toString()
            });
          }
        });
      }

      return getInfoData({
        fields: ["_id", "comment", "createdAt", "user_id"],
        object: populatedComment,
      });

    } catch (error) {
      console.error("Error in commentCheckin:", error);
      throw error;
    }
  };

  // Xóa checkin
  deleteCheckin = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { checkinId } = req.params;

      // Validation
      if (!mongoose.isValidObjectId(checkinId)) {
        throw new BadRequestError("Invalid checkin ID");
      }

      // Kiểm tra checkin tồn tại và quyền sở hữu
      const checkin = await checkinModel.findById(checkinId);
      if (!checkin) {
        throw new NotFoundError("Checkin not found");
      }

      if (checkin.user_id.toString() !== userId.toString()) {
        throw new ForbiddenError("You can only delete your own checkins");
      }

      if (!checkin.is_active) {
        throw new BadRequestError("Checkin is already deleted");
      }

      // Soft delete checkin
      await checkinModel.findByIdAndUpdate(
        checkinId,
        { is_active: false },
        { new: true }
      );

      // Optional: Cleanup related data asynchronously (không block response)
      setImmediate(async () => {
        try {
          // Soft delete related likes và comments nếu cần
          await Promise.all([
            checkinLikeModel.updateMany(
              { checkin_id: checkinId },
              { is_active: false }
            ),
            checkinCommentModel.updateMany(
              { checkin_id: checkinId },
              { is_active: false }
            )
          ]);
        } catch (cleanupError) {
          console.error("Error cleaning up related checkin data:", cleanupError);
          // Log error nhưng không affect main operation
        }
      });

      return { message: "Checkin deleted successfully" };

    } catch (error) {
      console.error("Error in deleteCheckin:", error);
      throw error;
    }
  };

  // Báo cáo checkin
  reportCheckin = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { checkinId } = req.params;
      const { reason } = req.body;

      // Validation
      if (!mongoose.isValidObjectId(checkinId)) {
        throw new BadRequestError("Invalid checkin ID");
      }

      if (!reason || reason.trim() === '') {
        throw new BadRequestError("Reason is required");
      }

      // Kiểm tra checkin tồn tại
      const checkin = await checkinModel.findById(checkinId);
      if (!checkin) {
        throw new NotFoundError("Checkin not found");
      }

      if (!checkin.is_active) {
        throw new BadRequestError("Checkin is not active");
      }

      // TODO: Implement report system
      // Có thể tạo model Report để lưu báo cáo

      return { message: "Checkin reported successfully" };

    } catch (error) {
      throw error;
    }
  };
}

module.exports = new CheckinService(); 