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

class CheckinService {
  // Tạo checkin mới
  createCheckin = async (req) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Extract parameters from req
      const userId = req.user.userId;
      const { title, location, visibility, cafeId, tags } = req.body;
      const imageFile = req.file;

      // Validation
      if (!imageFile) {
        throw new BadRequestError("Image is required");
      }

      if (!title || title.trim() === '') {
        throw new BadRequestError("Title is required");
      }

      if (!location) {
        throw new BadRequestError("Location is required");
      }

      // Parse location và tags nếu được gửi dưới dạng string
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
      const parsedTags = typeof tags === 'string' ? JSON.parse(tags) : (tags || []);

      // Validate location structure
      if (!parsedLocation.latitude || !parsedLocation.longitude) {
        throw new BadRequestError("Location must include latitude and longitude");
      }

      const imageUrl = imageFile.path; // URL từ Cloudinary
      const imagePublicId = imageFile.filename; // Public ID từ Cloudinary

      const newCheckin = await checkinModel.create([{
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
      }], { session });

      await session.commitTransaction();

      // Populate user info
      const populatedCheckin = await checkinModel
        .findById(newCheckin[0]._id)
        .populate('user_id', 'full_name avatar')
        .populate('cafe_id', 'name address');

      // Gửi thông báo cho bạn bè khi checkin (chỉ với visibility friends hoặc public)
      if (populatedCheckin.visibility === 'friends' || populatedCheckin.visibility === 'public') {
        try {
          // Lấy danh sách bạn bè
          const friends = await friendModel.find({
            $or: [
              { requester_id: userId, status: 'accepted' },
              { recipient_id: userId, status: 'accepted' }
            ]
          });

          const friendIds = friends.map(friend =>
            friend.requester_id.toString() === userId.toString()
              ? friend.recipient_id.toString()
              : friend.requester_id.toString()
          );

          if (friendIds.length > 0) {
            const locationName = populatedCheckin.location?.name || 
                               populatedCheckin.location?.address || 
                               populatedCheckin.cafe_id?.name || 
                               'một địa điểm';

            await NotificationHelper.sendFriendCheckinNotification({
              friend_ids: friendIds,
              friend_name: populatedCheckin.user_id.full_name,
              location_name: locationName,
              checkin_id: populatedCheckin._id.toString(),
            });
          }
        } catch (notificationError) {
          console.error("Error sending checkin notification to friends:", notificationError);
          // Không throw error để không ảnh hưởng đến flow chính
        }
      }

      return getInfoData({
        fields: ["_id", "title", "image", "location", "visibility", "cafe_id", "tags", "likes_count", "comments_count", "createdAt", "user_id"],
        object: populatedCheckin,
      });

    } catch (error) {
      await session.abortTransaction();
      console.error("Error creating checkin:", error);
      throw error;

    } finally {
      session.endSession();
    }
  };

  // Lấy feed checkin (bản thân và bạn bè)
  getCheckinFeed = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { page = 1, limit = 20, cafeId, tags } = req.query;

      // Validate pagination
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      if (pageNum < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      // Lấy danh sách ID của bạn bè
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

      // Thêm chính mình vào danh sách
      friendIds.push(new mongoose.Types.ObjectId(userId));

      const query = {
        user_id: { $in: friendIds },
        is_active: true,
        $or: [
          { visibility: 'public' },
          { visibility: 'friends', user_id: { $in: friendIds } },
          { visibility: 'private', user_id: userId }
        ]
      };

      // Áp dụng filters
      if (cafeId) {
        query.cafe_id = cafeId;
      }
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
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

        console.log("Nearby checkins query:", checkins);

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
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Extract parameters from req
      const userId = req.user.userId;
      const { checkinId } = req.params;

      // Validation
      if (!mongoose.isValidObjectId(checkinId)) {
        throw new BadRequestError("Invalid checkin ID");
      }

      // Kiểm tra checkin tồn tại
      const checkin = await checkinModel.findById(checkinId).session(session);
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
      }).session(session);

      let isLiked = false;

      if (existingLike) {
        // Unlike
        await checkinLikeModel.findByIdAndDelete(existingLike._id).session(session);
        await checkinModel.findByIdAndUpdate(
          checkinId,
          { $inc: { likes_count: -1 } },
          { session }
        );
      } else {
        // Like
        await checkinLikeModel.create([{
          user_id: userId,
          checkin_id: checkinId,
        }], { session });
        await checkinModel.findByIdAndUpdate(
          checkinId,
          { $inc: { likes_count: 1 } },
          { session }
        );
        isLiked = true;
      }

      await session.commitTransaction();

      return { isLiked };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };

  // Comment checkin
  commentCheckin = async (req) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

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
      const checkin = await checkinModel.findById(checkinId).session(session);
      if (!checkin) {
        throw new NotFoundError("Checkin not found");
      }

      if (!checkin.is_active) {
        throw new BadRequestError("Checkin is not active");
      }

      // Tạo comment
      const [newComment] = await checkinCommentModel.create([{
        user_id: userId,
        checkin_id: checkinId,
        comment: comment.trim(),
      }], { session });

      // Tăng comments_count
      await checkinModel.findByIdAndUpdate(
        checkinId,
        { $inc: { comments_count: 1 } },
        { session }
      );

      await session.commitTransaction();

      // Populate user info
      const populatedComment = await checkinCommentModel
        .findById(newComment._id)
        .populate('user_id', 'full_name avatar');

      return getInfoData({
        fields: ["_id", "comment", "createdAt", "user_id"],
        object: populatedComment,
      });

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  };

  // Xóa checkin
  deleteCheckin = async (req) => {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      // Extract parameters from req
      const userId = req.user.userId;
      const { checkinId } = req.params;

      // Validation
      if (!mongoose.isValidObjectId(checkinId)) {
        throw new BadRequestError("Invalid checkin ID");
      }

      // Kiểm tra checkin tồn tại và quyền sở hữu
      const checkin = await checkinModel.findById(checkinId).session(session);
      if (!checkin) {
        throw new NotFoundError("Checkin not found");
      }

      if (checkin.user_id.toString() !== userId.toString()) {
        throw new ForbiddenError("You can only delete your own checkins");
      }

      if (!checkin.is_active) {
        throw new BadRequestError("Checkin is already deleted");
      }

      // Soft delete
      await checkinModel.findByIdAndUpdate(
        checkinId,
        { is_active: false },
        { session }
      );

      await session.commitTransaction();

      return { message: "Checkin deleted successfully" };

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
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