"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Advertisement";
const COLLECTION_NAME = "Advertisements";

const advertisementSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String },
    features: [
      {
        icon: { type: String },
        title: { type: String },     
        description: { type: String }, 
      }
    ],
    image: { type: String },
    imagePublicId: { type: String },
    redirect_url: { type: String },
    type: {type : String},
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    created_by: { type: Types.ObjectId, ref: "User" },
    approved_by: { type: Types.ObjectId, ref: "User" },
    status: { type: String },
    start_date: { type: Date },
    end_date: { type: Date },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, advertisementSchema);