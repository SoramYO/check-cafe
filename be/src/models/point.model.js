"use strict";

const mongoose = require("mongoose");

const pointSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reservation_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      required: true,
    },
    shop_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true,
    },
    points: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "Points earned from reservation check-in",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

pointSchema.index({ user_id: 1, reservation_id: 1 });

module.exports = mongoose.model("Point", pointSchema);