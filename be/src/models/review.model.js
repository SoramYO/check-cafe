"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Review";
const COLLECTION_NAME = "Reviews";

const reviewSchema = new mongoose.Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User" },
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    rating: { type: Number },
    comment: { type: String },
    images: [{ type: String }],
    // Shop owner reply
    shop_reply: {
      reply: { type: String },
      replied_by: { type: Types.ObjectId, ref: "User" },
      replied_at: { type: Date }
    }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, reviewSchema);