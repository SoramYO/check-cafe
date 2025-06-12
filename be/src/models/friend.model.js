"use strict";

const mongoose = require("mongoose");
const { Types } = mongoose;

const DOCUMENT_NAME = "Friend";
const COLLECTION_NAME = "Friends";

const friendSchema = new mongoose.Schema(
  {
    requester_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "blocked"],
      default: "pending",
    },
    accepted_at: {
      type: Date,
    },
  },
  { 
    timestamps: true, 
    collection: COLLECTION_NAME 
  }
);

// Đảm bảo không có duplicate friend request
friendSchema.index({ requester_id: 1, recipient_id: 1 }, { unique: true });

// Index cho tìm kiếm bạn bè của một user
friendSchema.index({ requester_id: 1, status: 1 });
friendSchema.index({ recipient_id: 1, status: 1 });

// Index cho tìm kiếm pending requests
friendSchema.index({ recipient_id: 1, status: 1, createdAt: -1 });

// Middleware để set accepted_at khi status thành accepted
friendSchema.pre("save", function(next) {
  if (this.status === "accepted" && !this.accepted_at) {
    this.accepted_at = new Date();
  }
  next();
});

module.exports = mongoose.model(DOCUMENT_NAME, friendSchema); 