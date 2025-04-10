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
    avatar: { type: String },
    role: { type: String },
    points: { type: Number, default: 0 },
    vip_status: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
