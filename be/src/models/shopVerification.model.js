"use strict";

const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "ShopVerification";
const COLLECTION_NAME = "ShopVerifications";

const shopVerificationSchema = new mongoose.Schema(
  {
    shop_id: { type: Types.ObjectId, ref: "Shop", required: true },
    document_type: { type: String, required: true },
    documents: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      validate: {
        validator: (docs) => docs.length >= 1 && docs.length <= 5,
        message: "Documents must have 1 to 5 items",
      },
      required: true,
    },
    submitted_at: { type: Date, default: Date.now },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reviewed_by: { type: Types.ObjectId, ref: "User" },
    reviewed_at: { type: Date },
    reason: { type: String },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopVerificationSchema);