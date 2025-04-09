"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

const shopSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    address: { type: String },
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number] }
    },
    thumbnail: { type: String },
    open_hours: { type: String },
    owner_id: { type: Types.ObjectId, ref: "User" },
    vip_status: { type: Boolean, default: false },
    rating_avg: { type: Number, default: 0 }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

shopSchema.index({ location: "2dsphere" });
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);