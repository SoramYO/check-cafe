"use strict";

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DOCUMENT_NAME = "UserPackage";
const COLLECTION_NAME = "UserPackages";

const userPackageSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User" },
  package_id: { type: Schema.Types.ObjectId, ref: "Package" },
  payment_id: { type: Schema.Types.ObjectId, ref: "Payment" },
  duration: { type: Number },
  start_date: { type: Date, default: Date.now },
  end_date: { type: Date },
  status: { type: String, enum: ["active", "inactive"], default: "active" }
}, { collection: COLLECTION_NAME, timestamps: true });

module.exports = mongoose.model(DOCUMENT_NAME, userPackageSchema);

