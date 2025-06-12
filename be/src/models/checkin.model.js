"use strict";

const mongoose = require("mongoose");
const { Types } = mongoose;

const DOCUMENT_NAME = "Checkin";
const COLLECTION_NAME = "Checkins";

const checkinSchema = new mongoose.Schema(
  {
    user_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    image: {
      type: String,
      required: true,
    },
    imagePublicId: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      name: {
        type: String,
      },
    },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "friends",
    },
    cafe_id: {
      type: Types.ObjectId,
      ref: "Shop",
    },
    tags: [{
      type: String,
      trim: true,
    }],
    likes_count: {
      type: Number,
      default: 0,
    },
    comments_count: {
      type: Number,
      default: 0,
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

// Index cho tìm kiếm địa lý
checkinSchema.index({ "location": "2dsphere" });

// Index cho tìm kiếm theo user và thời gian
checkinSchema.index({ user_id: 1, createdAt: -1 });

// Index cho tìm kiếm theo cafe
checkinSchema.index({ cafe_id: 1, createdAt: -1 });

// Virtual để populate likes
checkinSchema.virtual("likes", {
  ref: "CheckinLike",
  localField: "_id",
  foreignField: "checkin_id",
  justOne: false,
});

// Virtual để populate comments
checkinSchema.virtual("comments", {
  ref: "CheckinComment",
  localField: "_id",
  foreignField: "checkin_id",
  justOne: false,
});

// Đảm bảo khi chuyển sang JSON/object sẽ có virtuals
checkinSchema.set("toObject", { virtuals: true });
checkinSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(DOCUMENT_NAME, checkinSchema); 