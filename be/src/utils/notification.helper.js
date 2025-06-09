"use strict";

const notificationService = require("../services/notification.service");
const { initSocket } = require("../socket/socket");
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
      const socket = initSocket();
      const emitNotification = socket?.emitNotification;

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
      const socket = initSocket();
      const emitNotification = socket?.emitNotification;

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
      const socket = initSocket();
      const emitNotification = socket?.emitNotification;

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
      const socket = initSocket();
      const emitNotification = socket?.emitNotification;

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
      const socket = initSocket();
      const emitNotification = socket?.emitNotification;

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
    };

    return colorMap[type] || "#7a5545";
  }
}

module.exports = NotificationHelper; 