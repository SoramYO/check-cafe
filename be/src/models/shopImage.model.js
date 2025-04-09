"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "ShopImage";
const COLLECTION_NAME = "ShopImages";

const shopImageSchema = new mongoose.Schema(
  {
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    url: { type: String },
    caption: { type: String }
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopImageSchema);