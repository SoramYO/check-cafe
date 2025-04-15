"use strict";

const mongoose = require("mongoose");
const { Types } = mongoose;

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    owner_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    theme_ids: [
      {
        type: Types.ObjectId,
        ref: "ShopTheme",
      },
    ],
    vip_status: {
      type: Boolean,
      default: false,
    },
    rating_avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    rating_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive", "Rejected"],
      default: "Pending",
    },
    amenities: [
      {
        type: String,
        enum: [
          "WiFi",
          "PowerOutlets",
          "QuietZone",
          "AirConditioning",
          "Parking",
          "PetFriendly",
        ],
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Index cho tìm kiếm địa lý
shopSchema.index({ location: "2dsphere" });
// Index cho tìm kiếm theo tên
shopSchema.index({ name: "text" });

module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
