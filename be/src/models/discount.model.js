"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

const discountSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    description: { type: String },
    points_required: { type: Number },
    discount_value: { type: Number },
    discount_type: { type: String },
    code: { type: String },
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    is_vip_only: { type: Boolean, default: false },
    usage_limit: { type: Number },
    used_count: { type: Number, default: 0 },
    start_date: { type: Date },
    end_date: { type: Date },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);