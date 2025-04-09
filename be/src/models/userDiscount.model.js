"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "UserDiscount";
const COLLECTION_NAME = "UserDiscounts";

const userDiscountSchema = new mongoose.Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User" },
    discount_id: { type: Types.ObjectId, ref: "Discount" },
    used_date: { type: Date }
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, userDiscountSchema);