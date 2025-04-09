"use strict";
const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const DOCUMENT_NAME = "ShopTheme";
const COLLECTION_NAME = "ShopThemes";

const shopThemeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String }
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopThemeSchema);