"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "ShopSeat";
const COLLECTION_NAME = "ShopSeats";

const shopSeatSchema = new mongoose.Schema(
  {
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    seat_name: { type: String },
    image: { type: String },
    is_premium: { type: Boolean, default: false },
    is_available: { type: Boolean, default: true },
    capacity: { type: Number }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopSeatSchema);