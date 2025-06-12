"use strict";

const notificationService = require("../services/notification.service");
const { getSocketInstance } = require("../socket/socket");
const ExpoNotificationMiddleware = require("../middlewares/expo-notification.middleware");

class NotificationHelper {
  /**
   * Send notification for reservation updates
   * @param {Object} params
   * @param {String} params.user_id - User ID to send notification to
   * @param {Object} params.reservation - Reservation object
   * @param {String} params.status - New reservation status
   * @param {String} params.shop_name - Shop name
   */
  static async sendReservationNotification({ user_id, reservation, status, shop_name }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const statusMessages = {
        Confirmed: "xác nhận",
        Cancelled: "hủy",
        Completed: "hoàn thành",
        CheckedIn: "check-in",
      };

      const booking_data = {
        reservation_id: reservation._id,
        shop_name,
        status_text: statusMessages[status] || status.toLowerCase(),
      };

      const notification = await notificationService.createBookingNotification({
        user_id,
        booking_data,
        emitNotification,
      });

      // Send push notification
      await ExpoNotificationMiddleware.sendPushNotification(user_id, notification);

      return notification;
    } catch (error) {
      console.error("Error sending reservation notification:", error);
      throw error;
    }
  }

  /**
   * Send promotion notification to users
   * @param {Object} params
   * @param {Array} params.user_ids - Array of user IDs
   * @param {Object} params.promotion - Promotion object
   */
  static async sendPromotionNotification({ user_ids = [], promotion }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const promotion_data = {
        promotion_id: promotion._id,
        message: promotion.message || `Khuyến mãi mới: ${promotion.title}`,
      };

      const notifications = [];
      for (const user_id of user_ids) {
        const notification = await notificationService.createPromotionNotification({
          user_id,
          promotion_data,
          emitNotification,
        });
        notifications.push(notification);
      }

      // Send bulk push notifications
      await ExpoNotificationMiddleware.sendBulkPushNotifications(user_ids, {
        title: "Khuyến mãi mới",
        content: promotion_data.message,
        type: "promotion",
      });

      return notifications;
    } catch (error) {
      console.error("Error sending promotion notifications:", error);
      throw error;
    }
  }

  /**
   * Send system notification
   * @param {Object} params
   * @param {String} params.user_id - User ID to send notification to
   * @param {String} params.title - Notification title
   * @param {String} params.content - Notification content
   * @param {String} params.reference_id - Reference ID (optional)
   * @param {String} params.reference_type - Reference type (optional)
   */
  static async sendSystemNotification({ user_id, title, content, reference_id, reference_type }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const system_data = {
        title,
        content,
        reference_id,
        reference_type,
      };

      const notification = await notificationService.createSystemNotification({
        user_id,
        system_data,
        emitNotification,
      });

      // Send push notification
      await ExpoNotificationMiddleware.sendPushNotification(user_id, notification);

      return notification;
    } catch (error) {
      console.error("Error sending system notification:", error);
      throw error;
    }
  }

  /**
   * Send reminder notification
   * @param {Object} params
   * @param {String} params.user_id - User ID to send notification to
   * @param {String} params.content - Reminder content
   * @param {String} params.reference_id - Reference ID (optional)
   * @param {String} params.reference_type - Reference type (optional)
   */
  static async sendReminderNotification({ user_id, content, reference_id, reference_type }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const reminder_data = {
        content,
        reference_id,
        reference_type,
      };

      return await notificationService.createReminderNotification({
        user_id,
        reminder_data,
        emitNotification,
      });
    } catch (error) {
      console.error("Error sending reminder notification:", error);
      throw error;
    }
  }

  /**
   * Send bulk notifications to multiple users
   * @param {Object} params
   * @param {Array} params.user_ids - Array of user IDs
   * @param {String} params.title - Notification title
   * @param {String} params.content - Notification content
   * @param {String} params.type - Notification type
   * @param {String} params.reference_id - Reference ID (optional)
   * @param {String} params.reference_type - Reference type (optional)
   */
  static async sendBulkNotifications({ user_ids = [], title, content, type, reference_id, reference_type }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const notifications = [];
      for (const user_id of user_ids) {
        const notification = await notificationService.createNotification({
          user_id,
          title,
          content,
          type,
          reference_id,
          reference_type,
          emitNotification,
        });
        notifications.push(notification);
      }

      return notifications;
    } catch (error) {
      console.error("Error sending bulk notifications:", error);
      throw error;
    }
  }

  /**
   * Send friend request notification
   * @param {Object} params
   * @param {String} params.recipient_id - User ID to send notification to
   * @param {String} params.requester_name - Name of the person sending request
   * @param {String} params.request_id - Friend request ID
   */
  static async sendFriendRequestNotification({ recipient_id, requester_name, request_id }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const friend_data = {
        requester_name,
        request_id,
      };

      const notification = await notificationService.createFriendRequestNotification({
        user_id: recipient_id,
        friend_data,
        emitNotification,
      });

      // Send push notification
      await ExpoNotificationMiddleware.sendPushNotification(recipient_id, notification);

      return notification;
    } catch (error) {
      console.error("Error sending friend request notification:", error);
      throw error;
    }
  }

  /**
   * Send friend accepted notification
   * @param {Object} params
   * @param {String} params.requester_id - User ID of person who sent the request
   * @param {String} params.accepter_name - Name of the person accepting request
   * @param {String} params.request_id - Friend request ID
   */
  static async sendFriendAcceptedNotification({ requester_id, accepter_name, request_id }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const friend_data = {
        accepter_name,
        request_id,
      };

      const notification = await notificationService.createFriendAcceptedNotification({
        user_id: requester_id,
        friend_data,
        emitNotification,
      });

      // Send push notification
      await ExpoNotificationMiddleware.sendPushNotification(requester_id, notification);

      return notification;
    } catch (error) {
      console.error("Error sending friend accepted notification:", error);
      throw error;
    }
  }

  /**
   * Send checkin notification to friends
   * @param {Object} params
   * @param {Array} params.friend_ids - Array of friend user IDs
   * @param {String} params.friend_name - Name of the person checking in
   * @param {String} params.location_name - Name of the checkin location
   * @param {String} params.checkin_id - Checkin ID
   */
  static async sendFriendCheckinNotification({ friend_ids = [], friend_name, location_name, checkin_id }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const checkin_data = {
        friend_name,
        location_name,
        checkin_id,
      };

      const notifications = [];
      for (const friend_id of friend_ids) {
        const notification = await notificationService.createFriendCheckinNotification({
          user_id: friend_id,
          checkin_data,
          emitNotification,
        });
        notifications.push(notification);
      }

      // Send bulk push notifications
      await ExpoNotificationMiddleware.sendBulkPushNotifications(friend_ids, {
        title: "Bạn bè check-in",
        content: `${friend_name} đã check-in tại ${location_name || 'một địa điểm'}`,
        type: "friend_checkin",
      });

      return notifications;
    } catch (error) {
      console.error("Error sending friend checkin notifications:", error);
      throw error;
    }
  }

  /**
   * Send checkin like notification
   * @param {Object} params
   * @param {String} params.checkin_owner_id - User ID of checkin owner
   * @param {String} params.liker_name - Name of the person who liked
   * @param {String} params.checkin_id - Checkin ID
   */
  static async sendCheckinLikeNotification({ checkin_owner_id, liker_name, checkin_id }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const like_data = {
        liker_name,
        checkin_id,
      };

      const notification = await notificationService.createCheckinLikeNotification({
        user_id: checkin_owner_id,
        like_data,
        emitNotification,
      });

      // Send push notification
      await ExpoNotificationMiddleware.sendPushNotification(checkin_owner_id, notification);

      return notification;
    } catch (error) {
      console.error("Error sending checkin like notification:", error);
      throw error;
    }
  }

  /**
   * Send checkin comment notification
   * @param {Object} params
   * @param {String} params.checkin_owner_id - User ID of checkin owner
   * @param {String} params.commenter_name - Name of the person who commented
   * @param {String} params.comment_preview - Preview of the comment (truncated)
   * @param {String} params.checkin_id - Checkin ID
   */
  static async sendCheckinCommentNotification({ checkin_owner_id, commenter_name, comment_preview, checkin_id }) {
    try {
      const socketInstance = getSocketInstance();
      const emitNotification = socketInstance?.emitNotification;

      const comment_data = {
        commenter_name,
        comment_preview,
        checkin_id,
      };

      const notification = await notificationService.createCheckinCommentNotification({
        user_id: checkin_owner_id,
        comment_data,
        emitNotification,
      });

      // Send push notification
      await ExpoNotificationMiddleware.sendPushNotification(checkin_owner_id, notification);

      return notification;
    } catch (error) {
      console.error("Error sending checkin comment notification:", error);
      throw error;
    }
  }

  /**
   * Get notification icon based on type (for mobile app)
   * @param {String} type - Notification type
   * @returns {String} Icon name
   */
  static getNotificationIcon(type) {
    const iconMap = {
      booking: "calendar-check",
      promotion: "tag",
      reminder: "clock-alert",
      update: "update",
      review: "star",
      system: "cog",
      RESERVATION_CREATED: "calendar-plus",
      RESERVATION_CONFIRMED: "calendar-check",
      RESERVATION_CANCELLED: "calendar-remove",
      RESERVATION_COMPLETED: "check-circle",
      CHECK_IN: "location-enter",
      FRIEND_REQUEST: "account-plus",
      FRIEND_ACCEPTED: "account-check",
      FRIEND_CHECKIN: "map-marker-check",
      CHECKIN_LIKE: "heart",
      CHECKIN_COMMENT: "comment",
    };

    return iconMap[type] || "bell";
  }

  /**
   * Get notification color based on type (for mobile app)
   * @param {String} type - Notification type
   * @returns {String} Color hex code
   */
  static getNotificationColor(type) {
    const colorMap = {
      booking: "#4ECDC4",
      promotion: "#FF6B6B",
      reminder: "#FFD93D",
      update: "#6BCF7F",
      review: "#A8E6CF",
      system: "#95A5A6",
      RESERVATION_CREATED: "#3498DB",
      RESERVATION_CONFIRMED: "#2ECC71",
      RESERVATION_CANCELLED: "#E74C3C",
      RESERVATION_COMPLETED: "#27AE60",
      CHECK_IN: "#F39C12",
      FRIEND_REQUEST: "#9B59B6",
      FRIEND_ACCEPTED: "#2ECC71",
      FRIEND_CHECKIN: "#3498DB",
      CHECKIN_LIKE: "#E91E63",
      CHECKIN_COMMENT: "#FF9800",
    };

    return colorMap[type] || "#7a5545";
  }
}

module.exports = NotificationHelper; 