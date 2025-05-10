"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "Category";
const COLLECTION_NAME = "Categories";

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // vd: "Yên tĩnh"
    code: { type: String, required: true, unique: true }, // vd: "quiet"
    description: { type: String }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, categorySchema);