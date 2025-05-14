"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Advertisement";
const COLLECTION_NAME = "Advertisements";

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    content: { type: String },
    image: { type: String },
    imagePublicId: { type: String },
    redirect_url: { type: String },
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    created_by: { type: Types.ObjectId, ref: "User" },
    approved_by: { type: Types.ObjectId, ref: "User" },
    status: { type: String },
    start_date: { type: Date },
    end_date: { type: Date }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, advertisementSchema);