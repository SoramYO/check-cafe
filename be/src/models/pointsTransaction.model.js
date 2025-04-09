"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "PointsTransaction";
const COLLECTION_NAME = "PointsTransactions";

const pointsTransactionSchema = new mongoose.Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User" },
    amount: { type: Number },
    transaction_type: { type: String },
    reference_id: { type: Types.ObjectId },
    reference_type: { type: String }
  },
  { timestamps: { createdAt: "created_at", updatedAt: false }, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, pointsTransactionSchema);