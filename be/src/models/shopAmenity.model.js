"use strict";

const mongoose = require("mongoose");
const DOCUMENT_NAME = "ShopAmenity";
const COLLECTION_NAME = "ShopAmenities";


const amenitySchema = new mongoose.Schema(
  {
    icon: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, amenitySchema);
