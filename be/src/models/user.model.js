"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "User";
const COLLECTION_NAME = "Users";

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, trim: true },
    email: { type: String, trim: true, unique: true },
    password: { type: String, required: true },
    phone: { type: String },
    avatar: {
      type: String,
      default:
        "https://www.pngplay.com/wp-content/uploads/12/User-Avatar-Profile-PNG-Photos.png",
    },
    avatarPublicId: { type: String },
    role: { type: String },
    points: { type: Number, default: 0 },
    vip_status: { type: Boolean, default: false },
    expo_token: { type: String },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
