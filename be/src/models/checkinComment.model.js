"use strict";

const mongoose = require("mongoose");
const { Types } = mongoose;

const DOCUMENT_NAME = "CheckinComment";
const COLLECTION_NAME = "CheckinComments";

const checkinCommentSchema = new mongoose.Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkin_id: {
      type: Types.ObjectId,
      ref: "Checkin",
      required: true,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { 
    timestamps: true, 
    collection: COLLECTION_NAME 
  }
);

// Index cho tìm kiếm theo checkin và thời gian
checkinCommentSchema.index({ checkin_id: 1, createdAt: -1 });

// Index cho tìm kiếm theo user
checkinCommentSchema.index({ user_id: 1, createdAt: -1 });

module.exports = mongoose.model(DOCUMENT_NAME, checkinCommentSchema); 