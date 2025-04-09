"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "ShopMenuItem";
const COLLECTION_NAME = "ShopMenuItems";

const shopMenuItemSchema = new mongoose.Schema(
  {
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    name: { type: String, trim: true },
    description: { type: String },
    price: { type: Number },
    category: { type: String },
    is_available: { type: Boolean, default: true }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopMenuItemSchema);