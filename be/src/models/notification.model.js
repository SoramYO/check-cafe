"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["info", "warning", "error", "success"],
      default: "info",
    },
    category: {
      type: String,
      enum: ["system", "user", "shop", "booking", "payment", "verification"],
      default: "system",
    },
    read: {
      type: Boolean,
      default: false,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Optional - for user-specific notifications
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: false, // Optional - for shop-specific notifications
    },
    related_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, // Optional - for related entity (booking, payment, etc.)
    },
    related_type: {
      type: String,
      enum: ["booking", "payment", "verification", "user", "shop"],
      required: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    expires_at: {
      type: Date,
      required: false, // Optional - for time-limited notifications
    },
    action_url: {
      type: String,
      required: false, // Optional - URL to navigate when clicked
    },
    action_text: {
      type: String,
      required: false, // Optional - text for action button
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
notificationSchema.index({ user_id: 1, read: 1, createdAt: -1 });
notificationSchema.index({ shop_id: 1, read: 1, createdAt: -1 });
notificationSchema.index({ type: 1, category: 1, createdAt: -1 });
notificationSchema.index({ read: 1, createdAt: -1 });
notificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });

// Static method to create system notification
notificationSchema.statics.createSystemNotification = function(data) {
  return this.create({
    ...data,
    category: "system",
    user_id: null,
    shop_id: null,
  });
};

// Static method to create user notification
notificationSchema.statics.createUserNotification = function(userId, data) {
  return this.create({
    ...data,
    user_id: userId,
    category: data.category || "user",
  });
};

// Static method to create shop notification
notificationSchema.statics.createShopNotification = function(shopId, data) {
  return this.create({
    ...data,
    shop_id: shopId,
    category: data.category || "shop",
  });
};

// Instance method to mark as read
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  return this.save();
};

// Instance method to check if expired
notificationSchema.methods.isExpired = function() {
  if (!this.expires_at) return false;
  return new Date() > this.expires_at;
};

module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);