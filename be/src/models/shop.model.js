"use strict";

//!dmbg
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";
// Declare the Schema of the Mongo model
var shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      maxLength: 150,
    },
    email: {
      type: String,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    verify: {
      type: Schema.Types.Boolean,
      default: false,
    },
    roles: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

//Export the model
module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);
