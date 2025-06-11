"use strict";

const mongoose = require("mongoose");

const DOCUMENT_NAME = "ShopCategory";
const COLLECTION_NAME = "ShopCategories";

const shopCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    icon: {
      type: String,
      trim: true,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Index để tìm kiếm nhanh theo tên
shopCategorySchema.index({ name: "text" });

module.exports = mongoose.model(DOCUMENT_NAME, shopCategorySchema); 