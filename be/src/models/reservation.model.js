"use strict";

const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;
const { RESERVATION_TYPE, RESERVATION_STATUS } = require("../constants/enum");

const DOCUMENT_NAME = "Reservation";
const COLLECTION_NAME = "Reservations";

const reservationSchema = new mongoose.Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    shop_id: { type: Types.ObjectId, ref: "Shop", required: true },
    seat_id: { type: Types.ObjectId, ref: "ShopSeat", required: true },
    time_slot_id: { type: Types.ObjectId, ref: "ShopTimeSlot", required: true },
    reservation_type: {
      type: String,
      enum: Object.values(RESERVATION_TYPE),
      required: true,
    },
    reservation_date: { type: Date, required: true },
    number_of_people: { type: Number, required: true, min: 1 },
    notes: { type: String },
    qr_code: { type: String },
    status: {
      type: String,
      enum: Object.values(RESERVATION_STATUS),
      default: RESERVATION_STATUS.PENDING,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Index để tối ưu tìm kiếm
reservationSchema.index({ user_id: 1, shop_id: 1 });
reservationSchema.index({ shop_id: 1, seat_id: 1, time_slot_id: 1, reservation_date: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, reservationSchema);