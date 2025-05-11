"use strict";

const mongoose = require("mongoose");
const { model, Schema } = mongoose;

const DOCUMENT_NAME = "MenuItemCategory";
const COLLECTION_NAME = "MenuItemCategories";

const menuItemCategorySchema = new mongoose.Schema(
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
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Index để tìm kiếm nhanh theo tên
menuItemCategorySchema.index({ name: "text" });

module.exports = mongoose.model(DOCUMENT_NAME, menuItemCategorySchema);