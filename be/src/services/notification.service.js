"use strict";

const { BadRequestError, NotFoundError } = require("../configs/error.response");
const notificationModel = require("../models/notification.model");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const { isValidObjectId } = require("mongoose");

const createNotification = async ({
  user_id,
  shop_id,
  title,
  message,
  type,
  category = "system",
  priority = "medium",
  related_id,
  related_type,
  action_url,
  action_text,
  expires_at,
  metadata = {},
  emitNotification,
}) => {
  try {
    if (user_id && !isValidObjectId(user_id)) {
      throw new BadRequestError("Invalid user_id");
    }
    if (shop_id && !isValidObjectId(shop_id)) {
      throw new BadRequestError("Invalid shop_id");
    }
    if (related_id && !isValidObjectId(related_id)) {
      throw new BadRequestError("Invalid related_id");
    }

    const validTypes = ["info", "warning", "error", "success"];
    if (!validTypes.includes(type)) {
      throw new BadRequestError("Invalid notification type");
    }

    const validCategories = ["system", "user", "shop", "booking", "payment", "verification"];
    if (!validCategories.includes(category)) {
      throw new BadRequestError("Invalid notification category");
    }

    const validPriorities = ["low", "medium", "high", "urgent"];
    if (!validPriorities.includes(priority)) {
      throw new BadRequestError("Invalid notification priority");
    }

    const notification = await notificationModel.create({
      user_id,
      shop_id,
      title,
      message,
      type,
      category,
      priority,
      related_id,
      related_type,
      action_url,
      action_text,
      expires_at: expires_at ? new Date(expires_at) : undefined,
      metadata,
    });

    if (user_id && emitNotification) {
      const notificationData = {
        _id: notification._id,
        user_id: notification.user_id,
        shop_id: notification.shop_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        priority: notification.priority,
        related_id: notification.related_id,
        related_type: notification.related_type,
        read: notification.read,
        action_url: notification.action_url,
        action_text: notification.action_text,
        createdAt: notification.createdAt,
      };
      emitNotification(user_id, notificationData);
    }

    return notification;
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to create notification");
  }
};

const getUserNotifications = async (req) => {
  try {
    const { userId } = req.user;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      type,
      category,
      priority,
      read,
    } = req.query;

    const query = { user_id: userId };
    if (type) {
      query.type = type;
    }
    if (category) {
      query.category = category;
    }
    if (priority) {
      query.priority = priority;
    }
    if (read !== undefined) {
      query.read = read === "true";
    }

    query.$or = [
      { expires_at: { $exists: false } },
      { expires_at: { $gt: new Date() } }
    ];

    const validSortFields = ["createdAt", "type", "category", "priority", "read"];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestError(`Invalid sortBy. Must be one of: ${validSortFields.join(", ")}`);
    }
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const paginateOptions = {
      model: notificationModel,
      query,
      page,
      limit,
      select: "_id user_id shop_id title message type category priority related_id related_type read action_url action_text createdAt",
      sort,
      populate: [
        { path: "shop_id", select: "name address" }
      ]
    };

    const result = await getPaginatedData(paginateOptions);

    return {
      notifications: result.data,
      metadata: {
        totalItems: result.metadata.total,
        totalPages: result.metadata.totalPages,
        currentPage: result.metadata.page,
        limit: result.metadata.limit,
      },
      message: result.data.length === 0 ? "No notifications found" : undefined,
    };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve notifications");
  }
};

const markNotificationAsRead = async (req) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    if (!isValidObjectId(notificationId)) {
      throw new BadRequestError("Invalid notificationId");
    }

    const notification = await notificationModel.findOneAndUpdate(
      { _id: notificationId, user_id: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError("Notification not found or you are not authorized");
    }

    return {
      notification: {
        _id: notification._id,
        user_id: notification.user_id,
        shop_id: notification.shop_id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        category: notification.category,
        priority: notification.priority,
        related_id: notification.related_id,
        related_type: notification.related_type,
        read: notification.read,
        action_url: notification.action_url,
        action_text: notification.action_text,
        createdAt: notification.createdAt,
      },
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to mark notification as read");
  }
};

const deleteNotification = async (req) => {
  try {
    const { notificationId } = req.params;
    const { userId } = req.user;

    if (!isValidObjectId(notificationId)) {
      throw new BadRequestError("Invalid notificationId");
    }

    const notification = await notificationModel.findOneAndDelete({
      _id: notificationId,
      user_id: userId,
    });

    if (!notification) {
      throw new NotFoundError("Notification not found or you are not authorized");
    }

    return { message: "Notification deleted successfully" };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to delete notification");
  }
};

const markAllNotificationsAsRead = async (req) => {
  try {
    const { userId } = req.user;

    const result = await notificationModel.updateMany(
      { user_id: userId, read: false },
      { read: true }
    );

    return {
      message: `${result.modifiedCount} notifications marked as read`,
      modifiedCount: result.modifiedCount,
    };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to mark all notifications as read");
  }
};

const getUnreadCount = async (req) => {
  try {
    const { userId } = req.user;

    const count = await notificationModel.countDocuments({
      user_id: userId,
      read: false,
      $or: [
        { expires_at: { $exists: false } },
        { expires_at: { $gt: new Date() } }
      ]
    });

    return { unread_count: count };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to get unread count");
  }
};

const createBookingNotification = async ({ user_id, booking_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Cập nhật đặt chỗ",
    message: `Đặt chỗ của bạn tại ${booking_data.shop_name} đã được ${booking_data.status_text}`,
    type: "info",
    category: "booking",
    priority: "medium",
    related_id: booking_data.reservation_id,
    related_type: "booking",
    emitNotification,
  });
};

const createPromotionNotification = async ({ user_id, promotion_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Khuyến mãi mới",
    message: promotion_data.message,
    type: "success",
    category: "payment",
    priority: "medium",
    related_id: promotion_data.promotion_id,
    related_type: "payment",
    emitNotification,
  });
};

const createSystemNotification = async ({ user_id, system_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: system_data.title,
    message: system_data.content,
    type: system_data.type || "info",
    category: "system",
    priority: system_data.priority || "medium",
    related_id: system_data.reference_id,
    related_type: system_data.reference_type || "system",
    emitNotification,
  });
};

const createReminderNotification = async ({ user_id, reminder_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Nhắc nhở",
    message: reminder_data.content,
    type: "warning",
    category: "system",
    priority: "medium",
    related_id: reminder_data.reference_id,
    related_type: reminder_data.reference_type || "system",
    emitNotification,
  });
};

const createFriendRequestNotification = async ({ user_id, friend_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Yêu cầu kết bạn",
    message: `${friend_data.requester_name} muốn kết bạn với bạn`,
    type: "info",
    category: "user",
    priority: "medium",
    related_id: friend_data.request_id,
    related_type: "user",
    emitNotification,
  });
};

const createFriendAcceptedNotification = async ({ user_id, friend_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Kết bạn thành công",
    message: `${friend_data.accepter_name} đã chấp nhận lời mời kết bạn của bạn`,
    type: "success",
    category: "user",
    priority: "medium",
    related_id: friend_data.request_id,
    related_type: "user",
    emitNotification,
  });
};

const createFriendCheckinNotification = async ({ user_id, checkin_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Bạn bè check-in",
    message: `${checkin_data.friend_name} đã check-in tại ${checkin_data.location_name || 'một địa điểm'}`,
    type: "info",
    category: "user",
    priority: "low",
    related_id: checkin_data.checkin_id,
    related_type: "user",
    emitNotification,
  });
};

const createCheckinLikeNotification = async ({ user_id, like_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Ai đó đã thích bài viết của bạn",
    message: `${like_data.liker_name} đã thích bài check-in của bạn`,
    type: "success",
    category: "user",
    priority: "low",
    related_id: like_data.checkin_id,
    related_type: "user",
    emitNotification,
  });
};

const createCheckinCommentNotification = async ({ user_id, comment_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Bình luận mới",
    message: `${comment_data.commenter_name} đã bình luận: "${comment_data.comment_preview}"`,
    type: "info",
    category: "user",
    priority: "low",
    related_id: comment_data.checkin_id,
    related_type: "user",
    emitNotification,
  });
};

module.exports = {
  createNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getUnreadCount,
  deleteNotification,
  createBookingNotification,
  createPromotionNotification,
  createSystemNotification,
  createReminderNotification,
  createFriendRequestNotification,
  createFriendAcceptedNotification,
  createFriendCheckinNotification,
  createCheckinLikeNotification,
  createCheckinCommentNotification,
};