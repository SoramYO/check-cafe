"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "ShopTimeSlot";
const COLLECTION_NAME = "ShopTimeSlots";

const shopTimeSlotSchema = new mongoose.Schema(
  {
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    day_of_week: { type: Number },
    start_time: { type: String },
    end_time: { type: String },
    max_regular_reservations: { type: Number },
    max_premium_reservations: { type: Number },
    is_active: { type: Boolean, default: true }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopTimeSlotSchema);