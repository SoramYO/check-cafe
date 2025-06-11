"use strict";

const mongoose = require("mongoose");
const { Types } = mongoose;

const DOCUMENT_NAME = "CheckinLike";
const COLLECTION_NAME = "CheckinLikes";

const checkinLikeSchema = new mongoose.Schema(
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
  },
  { 
    timestamps: true, 
    collection: COLLECTION_NAME 
  }
);

// Đảm bảo một user chỉ like một checkin một lần
checkinLikeSchema.index({ user_id: 1, checkin_id: 1 }, { unique: true });

// Index cho tìm kiếm theo checkin
checkinLikeSchema.index({ checkin_id: 1, createdAt: -1 });

module.exports = mongoose.model(DOCUMENT_NAME, checkinLikeSchema); 