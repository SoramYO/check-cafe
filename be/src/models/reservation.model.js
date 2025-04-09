"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Reservation";
const COLLECTION_NAME = "Reservations";

const reservationSchema = new mongoose.Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User" },
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    seat_id: { type: Types.ObjectId, ref: "ShopSeat" },
    time_slot_id: { type: Types.ObjectId, ref: "ShopTimeSlot" },
    reservation_type: { type: String },
    reservation_date: { type: Date },
    number_of_people: { type: Number },
    notes: { type: String },
    qr_code: { type: String },
    status: { type: String }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, reservationSchema);