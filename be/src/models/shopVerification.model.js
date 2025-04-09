"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "ShopVerification";
const COLLECTION_NAME = "ShopVerifications";

const shopVerificationSchema = new mongoose.Schema(
  {
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    document_type: { type: String },
    document_url: { type: String },
    submitted_at: { type: Date },
    status: { type: String },
    reviewed_by: { type: Types.ObjectId, ref: "User" },
    reviewed_at: { type: Date },
    reason: { type: String }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopVerificationSchema);