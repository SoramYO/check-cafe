"use strict";

const { Expo } = require("expo-server-sdk");
const userModel = require("../models/user.model");

class ExpoNotificationMiddleware {
  constructor() {
    this.expo = new Expo();
  }

  /**
   * Get singleton instance
   */
  static getInstance() {
    if (!ExpoNotificationMiddleware.instance) {
      ExpoNotificationMiddleware.instance = new ExpoNotificationMiddleware();
    }
    return ExpoNotificationMiddleware.instance;
  }

  /**
   * Validate Expo push token
   * @param {String} token - Expo push token
   * @returns {Boolean}
   */
  isValidExpoPushToken(token) {
    return Expo.isExpoPushToken(token);
  }

  /**
   * Send push notification to specific user
   * @param {String} userId - User ID to send notification to
   * @param {Object} notification - Notification object
   * @param {Object} data - Additional data
   */
  async sendPushNotification(userId, notification, data = {}) {
    try {
      // Get user's Expo push token
      const user = await userModel.findById(userId).select("expo_token").lean();
      if (!user || !user.expo_token) {
        console.log(`No Expo push token found for user ${userId}`);
        return null;
      }

      const token = user.expo_token;
      if (!this.isValidExpoPushToken(token)) {
        console.log(`Invalid Expo push token for user ${userId}`);
        await userModel.findByIdAndUpdate(userId, { $unset: { expo_token: 1 } });
        return null;
      }

      const message = {
        to: token,
        title: notification.title,
        body: notification.content,
        data: {
          notification_id: notification._id?.toString() || "",
          type: notification.type || "",
          reference_id: notification.reference_id?.toString() || "",
          reference_type: notification.reference_type || "",
          timestamp: new Date().toISOString(),
          ...data,
        },
        sound: "default",
        badge: 1,
        channelId: "default",
      };

      const chunks = this.expo.chunkPushNotifications([message]);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending chunk:", error);
        }
      }

      console.log("Expo push notification sent successfully:", tickets[0]);
      return tickets[0];
    } catch (error) {
      console.error("Error sending Expo push notification:", error);
      return null;
    }
  }

  /**
   * Static method for backward compatibility
   */
  static async sendPushNotification(userId, notification, data = {}) {
    const instance = ExpoNotificationMiddleware.getInstance();
    return instance.sendPushNotification(userId, notification, data);
  }

  /**
   * Send push notifications to multiple users
   * @param {Array} userIds - Array of user IDs
   * @param {Object} notification - Notification object
   * @param {Object} data - Additional data
   */
  async sendBulkPushNotifications(userIds, notification, data = {}) {
    try {
      // Get users' Expo push tokens
      const users = await userModel
        .find({ _id: { $in: userIds }, expo_token: { $exists: true, $ne: null } })
        .select("expo_token")
        .lean();

      if (users.length === 0) {
        console.log("No users with Expo push tokens found");
        return [];
      }

      // Filter valid Expo push tokens
      const validTokens = users
        .map(user => user.expo_token)
        .filter(token => this.isValidExpoPushToken(token));

      if (validTokens.length === 0) {
        console.log("No valid Expo push tokens found");
        return [];
      }

      // Create messages for each token
      const messages = validTokens.map(token => ({
        to: token,
        title: notification.title,
        body: notification.content,
        data: {
          notification_id: notification._id?.toString() || "",
          type: notification.type || "",
          reference_id: notification.reference_id?.toString() || "",
          reference_type: notification.reference_type || "",
          timestamp: new Date().toISOString(),
          ...data,
        },
        sound: "default",
        badge: 1,
        channelId: "default",
      }));

      // Chunk messages and send
      const chunks = this.expo.chunkPushNotifications(messages);
      const tickets = [];

      for (const chunk of chunks) {
        try {
          const ticketChunk = await this.expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error("Error sending chunk:", error);
        }
      }

      console.log(`Expo push notifications sent: ${tickets.length}/${validTokens.length}`);

      // Handle failed tickets - remove invalid tokens
      const invalidTokens = [];
      tickets.forEach((ticket, idx) => {
        if (ticket.status === 'error' && 
            (ticket.details?.error === 'DeviceNotRegistered' || 
             ticket.details?.error === 'InvalidCredentials')) {
          invalidTokens.push(validTokens[idx]);
        }
      });

      if (invalidTokens.length > 0) {
        await userModel.updateMany(
          { expo_token: { $in: invalidTokens } },
          { $unset: { expo_token: 1 } }
        );
        console.log(`Removed ${invalidTokens.length} invalid Expo tokens`);
      }

      return tickets;
    } catch (error) {
      console.error("Error sending bulk Expo push notifications:", error);
      return null;
    }
  }

  /**
   * Static method for backward compatibility
   */
  static async sendBulkPushNotifications(userIds, notification, data = {}) {
    const instance = ExpoNotificationMiddleware.getInstance();
    return instance.sendBulkPushNotifications(userIds, notification, data);
  }

  /**
   * Send notification to all users (broadcast)
   * @param {Object} notification - Notification object
   * @param {Object} data - Additional data
   * @param {Array} excludeUserIds - Array of user IDs to exclude (optional)
   */
  async sendBroadcastNotification(notification, data = {}, excludeUserIds = []) {
    try {
      // Get all users with Expo push tokens
      const query = { expo_token: { $exists: true, $ne: null } };
      if (excludeUserIds.length > 0) {
        query._id = { $nin: excludeUserIds };
      }

      const users = await userModel.find(query).select("expo_token").lean();

      if (users.length === 0) {
        console.log("No users with Expo push tokens found for broadcast");
        return [];
      }

      // Use bulk send method
      const userIds = users.map(user => user._id);
      return this.sendBulkPushNotifications(userIds, notification, data);
    } catch (error) {
      console.error("Error sending broadcast notification:", error);
      return null;
    }
  }

  /**
   * Static method for backward compatibility
   */
  static async sendBroadcastNotification(notification, data = {}, excludeUserIds = []) {
    const instance = ExpoNotificationMiddleware.getInstance();
    return instance.sendBroadcastNotification(notification, data, excludeUserIds);
  }

  /**
   * Check receipt status of sent notifications
   * @param {Array} receiptIds - Array of receipt IDs from tickets
   */
  async checkReceiptStatus(receiptIds) {
    try {
      const receiptIdChunks = this.expo.chunkPushNotificationReceiptIds(receiptIds);
      const receipts = [];

      for (const chunk of receiptIdChunks) {
        try {
          const receiptChunk = await this.expo.getPushNotificationReceiptsAsync(chunk);
          receipts.push(receiptChunk);
        } catch (error) {
          console.error("Error getting receipt chunk:", error);
        }
      }

      return receipts;
    } catch (error) {
      console.error("Error checking receipt status:", error);
      return null;
    }
  }

  /**
   * Static method for backward compatibility
   */
  static async checkReceiptStatus(receiptIds) {
    const instance = ExpoNotificationMiddleware.getInstance();
    return instance.checkReceiptStatus(receiptIds);
  }
}

module.exports = ExpoNotificationMiddleware; 