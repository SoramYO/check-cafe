"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

const notificationSchema = new mongoose.Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User" },
    title: { type: String, trim: true },
    content: { type: String },
    type: { type: String },
    reference_id: { type: Types.ObjectId },
    reference_type: { type: String },
    is_read: { type: Boolean, default: false }
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, notificationSchema);