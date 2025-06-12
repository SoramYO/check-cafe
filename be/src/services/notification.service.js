"use strict";

const { BadRequestError, NotFoundError } = require("../configs/error.response");
const notificationModel = require("../models/notification.model");
const { NOTIFICATION_TYPE } = require("../constants/enum");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const { isValidObjectId } = require("mongoose");

const createNotification = async ({
  user_id,
  title,
  content,
  type,
  reference_id,
  reference_type = "Reservation",
  emitNotification,
}) => {
  try {
    if (!isValidObjectId(user_id) || !isValidObjectId(reference_id)) {
      throw new BadRequestError("Invalid user_id or reference_id");
    }
    if (!Object.values(NOTIFICATION_TYPE).includes(type)) {
      throw new BadRequestError("Invalid notification type");
    }

    const notification = await notificationModel.create({
      user_id,
      title,
      content,
      type,
      reference_id,
      reference_type,
    });

    // Gửi thông báo qua Socket.IO
    const notificationData = {
      _id: notification._id,
      user_id: notification.user_id,
      title: notification.title,
      content: notification.content,
      type: notification.type,
      reference_id: notification.reference_id,
      reference_type: notification.reference_type,
      is_read: notification.is_read,
      created_at: notification.created_at,
    };
    emitNotification(user_id, notificationData);

    return notificationData;
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
      sortBy = "created_at",
      sortOrder = "desc",
      type,
      is_read,
    } = req.query;

    // Xây dựng query
    const query = { user_id: userId };
    if (type && Object.values(NOTIFICATION_TYPE).includes(type)) {
      query.type = type;
    }
    if (is_read !== undefined) {
      query.is_read = is_read === "true";
    }

    // Xây dựng sort
    const validSortFields = ["created_at", "type", "is_read"];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestError(`Invalid sortBy. Must be one of: ${validSortFields.join(", ")}`);
    }
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Phân trang
    const paginateOptions = {
      model: notificationModel,
      query,
      page,
      limit,
      select: "_id user_id title content type reference_id reference_type is_read created_at",
      sort,
    };

    const result = await getPaginatedData(paginateOptions);
    console.log('🔍 Debug - Get notifications result:', result);

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
      { is_read: true },
      { new: true }
    );

    if (!notification) {
      throw new NotFoundError("Notification not found or you are not authorized");
    }

    return {
      notification: {
        _id: notification._id,
        user_id: notification.user_id,
        title: notification.title,
        content: notification.content,
        type: notification.type,
        reference_id: notification.reference_id,
        reference_type: notification.reference_type,
        is_read: notification.is_read,
        created_at: notification.created_at,
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
      { user_id: userId, is_read: false },
      { is_read: true }
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
      is_read: false,
    });

    return { unread_count: count };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to get unread count");
  }
};

// Utility functions for creating specific notification types
const createBookingNotification = async ({ user_id, booking_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Cập nhật đặt chỗ",
    content: `Đặt chỗ của bạn tại ${booking_data.shop_name} đã được ${booking_data.status_text}`,
    type: NOTIFICATION_TYPE.BOOKING,
    reference_id: booking_data.reservation_id,
    reference_type: "Reservation",
    emitNotification,
  });
};

const createPromotionNotification = async ({ user_id, promotion_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Khuyến mãi mới",
    content: promotion_data.message,
    type: NOTIFICATION_TYPE.PROMOTION,
    reference_id: promotion_data.promotion_id,
    reference_type: "Promotion",
    emitNotification,
  });
};

const createSystemNotification = async ({ user_id, system_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: system_data.title,
    content: system_data.content,
    type: NOTIFICATION_TYPE.SYSTEM,
    reference_id: system_data.reference_id,
    reference_type: system_data.reference_type || "System",
    emitNotification,
  });
};

const createReminderNotification = async ({ user_id, reminder_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Nhắc nhở",
    content: reminder_data.content,
    type: NOTIFICATION_TYPE.REMINDER,
    reference_id: reminder_data.reference_id,
    reference_type: reminder_data.reference_type || "Reminder",
    emitNotification,
  });
};

const createFriendRequestNotification = async ({ user_id, friend_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Yêu cầu kết bạn",
    content: `${friend_data.requester_name} muốn kết bạn với bạn`,
    type: NOTIFICATION_TYPE.FRIEND_REQUEST,
    reference_id: friend_data.request_id,
    reference_type: "FriendRequest",
    emitNotification,
  });
};

const createFriendAcceptedNotification = async ({ user_id, friend_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Kết bạn thành công",
    content: `${friend_data.accepter_name} đã chấp nhận lời mời kết bạn của bạn`,
    type: NOTIFICATION_TYPE.FRIEND_ACCEPTED,
    reference_id: friend_data.request_id,
    reference_type: "FriendRequest",
    emitNotification,
  });
};

const createFriendCheckinNotification = async ({ user_id, checkin_data, emitNotification }) => {
  return await createNotification({
    user_id,
    title: "Bạn bè check-in",
    content: `${checkin_data.friend_name} đã check-in tại ${checkin_data.location_name || 'một địa điểm'}`,
    type: NOTIFICATION_TYPE.FRIEND_CHECKIN,
    reference_id: checkin_data.checkin_id,
    reference_type: "Checkin",
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
  // Utility functions
  createBookingNotification,
  createPromotionNotification,
  createSystemNotification,
  createReminderNotification,
  createFriendRequestNotification,
  createFriendAcceptedNotification,
  createFriendCheckinNotification,
};