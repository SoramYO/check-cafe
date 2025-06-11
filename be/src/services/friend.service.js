"use strict";

const friendModel = require("../models/friend.model");
const userModel = require("../models/user.model");
const { getInfoData } = require("../utils");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../configs/error.response");
const mongoose = require("mongoose");
const NotificationHelper = require("../utils/notification.helper");

class FriendService {
  // Gửi lời mời kết bạn
  sendFriendRequest = async (req) => {
    try {
      // Extract parameters from req
      const requesterId = req.user.userId;
      const { userId: recipientId } = req.body;

      // Validation
      if (!recipientId) {
        throw new BadRequestError("User ID is required");
      }

      // Kiểm tra không thể gửi lời mời cho chính mình
      if (requesterId.toString() === recipientId.toString()) {
        throw new BadRequestError("Cannot send friend request to yourself");
      }

      // Kiểm tra recipient tồn tại
      const recipient = await userModel.findById(recipientId);
      if (!recipient) {
        throw new NotFoundError("User not found");
      }

      // Kiểm tra xem đã có mối quan hệ nào chưa
      const existingRelationship = await friendModel.findOne({
        $or: [
          { requester_id: requesterId, recipient_id: recipientId },
          { requester_id: recipientId, recipient_id: requesterId }
        ]
      });

      if (existingRelationship) {
        if (existingRelationship.status === 'accepted') {
          throw new BadRequestError("Already friends");
        } else if (existingRelationship.status === 'pending') {
          throw new BadRequestError("Friend request already sent");
        } else if (existingRelationship.status === 'blocked') {
          throw new BadRequestError("Cannot send friend request");
        }
      }

      // Tạo friend request
      const friendRequest = await friendModel.create({
        requester_id: requesterId,
        recipient_id: recipientId,
        status: 'pending',
      });

      // Lấy thông tin requester để gửi thông báo
      const requester = await userModel.findById(requesterId).select('full_name');
      
      // Gửi thông báo cho recipient
      try {
        await NotificationHelper.sendFriendRequestNotification({
          recipient_id: recipientId,
          requester_name: requester.full_name,
          request_id: friendRequest._id.toString(),
        });
      } catch (notificationError) {
        console.error("Error sending friend request notification:", notificationError);
        // Không throw error để không ảnh hưởng đến flow chính
      }

      return getInfoData({
        fields: ["_id", "requester_id", "recipient_id", "status", "createdAt"],
        object: friendRequest,
      });

    } catch (error) {
      throw error;
    }
  };

  // Chấp nhận lời mời kết bạn
  acceptFriendRequest = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { requestId } = req.params;

      // Tìm friend request
      const friendRequest = await friendModel.findById(requestId);
      if (!friendRequest) {
        throw new NotFoundError("Friend request not found");
      }

      // Kiểm tra quyền (chỉ recipient mới có thể accept)
      if (friendRequest.recipient_id.toString() !== userId.toString()) {
        throw new ForbiddenError("You can only accept friend requests sent to you");
      }

      // Kiểm tra status
      if (friendRequest.status !== 'pending') {
        throw new BadRequestError("Friend request is not pending");
      }

      // Cập nhật status
      friendRequest.status = 'accepted';
      friendRequest.accepted_at = new Date();
      await friendRequest.save();

      // Lấy thông tin accepter để gửi thông báo
      const accepter = await userModel.findById(userId).select('full_name');
      
      // Gửi thông báo cho requester
      try {
        await NotificationHelper.sendFriendAcceptedNotification({
          requester_id: friendRequest.requester_id.toString(),
          accepter_name: accepter.full_name,
          request_id: friendRequest._id.toString(),
        });
      } catch (notificationError) {
        console.error("Error sending friend accepted notification:", notificationError);
        // Không throw error để không ảnh hưởng đến flow chính
      }

      return getInfoData({
        fields: ["_id", "requester_id", "recipient_id", "status", "accepted_at"],
        object: friendRequest,
      });

    } catch (error) {
      throw error;
    }
  };

  // Từ chối lời mời kết bạn
  rejectFriendRequest = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { requestId } = req.params;

      // Tìm friend request
      const friendRequest = await friendModel.findById(requestId);
      if (!friendRequest) {
        throw new NotFoundError("Friend request not found");
      }

      // Kiểm tra quyền (chỉ recipient mới có thể reject)
      if (friendRequest.recipient_id.toString() !== userId.toString()) {
        throw new ForbiddenError("You can only reject friend requests sent to you");
      }

      // Kiểm tra status
      if (friendRequest.status !== 'pending') {
        throw new BadRequestError("Friend request is not pending");
      }

      // Xóa friend request
      await friendModel.findByIdAndDelete(requestId);

      return { message: "Friend request rejected" };

    } catch (error) {
      throw error;
    }
  };

  // Hủy kết bạn
  unfriend = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { userId: targetUserId } = req.params;

      console.log("Unfriend request received:", { userId, targetUserId });

      // Tìm mối quan hệ bạn bè
      const friendship = await friendModel.findOne({
        $or: [
          { requester_id: userId, recipient_id: targetUserId, status: 'accepted' },
          { requester_id: targetUserId, recipient_id: userId, status: 'accepted' }
        ]
      });

      if (!friendship) {
        throw new NotFoundError("Friendship not found");
      }

      // Xóa mối quan hệ
      await friendModel.findByIdAndDelete(friendship._id);

      return { message: "Unfriended successfully" };

    } catch (error) {
      console.error("Error in unfriend:", error);
      throw error;
    }
  };

  // Lấy danh sách bạn bè
  getFriends = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
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

      const skip = (pageNum - 1) * limitNum;

      // Tìm tất cả mối quan hệ bạn bè đã accept
      const friendships = await friendModel
        .find({
          $or: [
            { requester_id: userId, status: 'accepted' },
            { recipient_id: userId, status: 'accepted' }
          ]
        })
        .sort({ accepted_at: -1 })
        .skip(skip)
        .limit(limitNum);

      // Lấy ID của những người bạn
      const friendIds = friendships.map(friendship => 
        friendship.requester_id.toString() === userId.toString() 
          ? friendship.recipient_id 
          : friendship.requester_id
      );

      // Populate thông tin user
      const friends = await userModel
        .find({ _id: { $in: friendIds } })
        .select('full_name avatar email');

      const total = await friendModel.countDocuments({
        $or: [
          { requester_id: userId, status: 'accepted' },
          { recipient_id: userId, status: 'accepted' }
        ]
      });

      return {
        friends: friends.map(friend => getInfoData({
          fields: ["_id", "full_name", "avatar", "email"],
          object: friend,
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

  // Lấy danh sách lời mời kết bạn
  getFriendRequests = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { type = 'received' } = req.query;

      let query = {};
      let populateField = '';

      if (type === 'received') {
        query = { recipient_id: userId, status: 'pending' };
        populateField = 'requester_id';
      } else if (type === 'sent') {
        query = { requester_id: userId, status: 'pending' };
        populateField = 'recipient_id';
      } else {
        throw new BadRequestError("Type must be 'received' or 'sent'");
      }

      const requests = await friendModel
        .find(query)
        .populate(populateField, 'full_name avatar email')
        .sort({ createdAt: -1 });

      return requests.map(request => ({
        _id: request._id,
        user: getInfoData({
          fields: ["_id", "full_name", "avatar", "email"],
          object: request[populateField],
        }),
        createdAt: request.createdAt,
      }));

    } catch (error) {
      throw error;
    }
  };

  // Tìm kiếm người dùng để kết bạn
  searchUsers = async (req) => {
    try {
      // Extract parameters from req
      const currentUserId = req.user.userId;
      const { q: query, page = 1, limit = 20 } = req.query;

      // Validation
      if (!query || query.trim() === '') {
        throw new BadRequestError("Search query is required");
      }

      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 20;

      if (pageNum < 1) {
        throw new BadRequestError("Page must be greater than 0");
      }

      if (limitNum < 1 || limitNum > 100) {
        throw new BadRequestError("Limit must be between 1 and 100");
      }

      const skip = (pageNum - 1) * limitNum;

      // Tìm kiếm user theo tên hoặc email
      const users = await userModel
        .find({
          $and: [
            { _id: { $ne: currentUserId } }, // Loại trừ chính mình
            {
              $or: [
                              { full_name: { $regex: query.trim(), $options: 'i' } },
              { email: { $regex: query.trim(), $options: 'i' } }
              ]
            }
          ]
        })
        .select('full_name avatar email')
        .skip(skip)
        .limit(limitNum);

      const total = await userModel.countDocuments({
        $and: [
          { _id: { $ne: currentUserId } },
          {
            $or: [
              { full_name: { $regex: query.trim(), $options: 'i' } },
              { email: { $regex: query.trim(), $options: 'i' } }
            ]
          }
        ]
      });

      return {
        users: users.map(user => getInfoData({
          fields: ["_id", "full_name", "avatar", "email"],
          object: user,
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

  // Kiểm tra trạng thái bạn bè với một user
  getFriendshipStatus = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { userId: targetUserId } = req.params;

      if (userId.toString() === targetUserId.toString()) {
        return { status: 'self' };
      }

      const relationship = await friendModel.findOne({
        $or: [
          { requester_id: userId, recipient_id: targetUserId },
          { requester_id: targetUserId, recipient_id: userId }
        ]
      });

      if (!relationship) {
        return { status: 'none' };
      }

      let status = relationship.status;
      let role = null;

      if (status === 'pending') {
        // Xác định ai là người gửi, ai là người nhận
        role = relationship.requester_id.toString() === userId.toString() 
          ? 'requester' 
          : 'recipient';
      }

      return { status, role };

    } catch (error) {
      throw error;
    }
  };

  // Lấy gợi ý kết bạn
  getFriendSuggestions = async (req) => {
    try {
      // Extract parameters from req
      const userId = req.user.userId;
      const { limit = 10 } = req.query;

      const limitNum = parseInt(limit) || 10;

      if (limitNum < 1 || limitNum > 50) {
        throw new BadRequestError("Limit must be between 1 and 50");
      }

      // Lấy danh sách bạn bè hiện tại
      const currentFriends = await friendModel.find({
        $or: [
          { requester_id: userId, status: 'accepted' },
          { recipient_id: userId, status: 'accepted' }
        ]
      });

      const friendIds = currentFriends.map(friendship => 
        friendship.requester_id.toString() === userId.toString() 
          ? friendship.recipient_id 
          : friendship.requester_id
      );

      // Thêm chính mình vào danh sách loại trừ
      friendIds.push(new mongoose.Types.ObjectId(userId));

      // Lấy danh sách pending requests để loại trừ
      const pendingRequests = await friendModel.find({
        $or: [
          { requester_id: userId, status: 'pending' },
          { recipient_id: userId, status: 'pending' }
        ]
      });

      const pendingUserIds = pendingRequests.map(request => 
        request.requester_id.toString() === userId.toString() 
          ? request.recipient_id 
          : request.requester_id
      );

      // Gợi ý: users không phải bạn bè và không có pending request
      const suggestions = await userModel
        .find({
          _id: { 
            $nin: [...friendIds, ...pendingUserIds] 
          }
        })
        .select('full_name avatar email')
        .limit(limitNum);

      return suggestions.map(user => getInfoData({
        fields: ["_id", "full_name", "avatar", "email"],
        object: user,
      }));

    } catch (error) {
      throw error;
    }
  };
}

module.exports = new FriendService(); 