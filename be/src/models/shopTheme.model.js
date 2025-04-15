"use strict";
const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const DOCUMENT_NAME = "ShopTheme";
const COLLECTION_NAME = "ShopThemes";

const shopThemeSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String },
    theme_image: {
      type: String,
      default:
        "https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/logo_l5ruwq.png",
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopThemeSchema);
