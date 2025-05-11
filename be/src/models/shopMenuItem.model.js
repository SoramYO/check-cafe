"use strict";

const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "ShopMenuItem";
const COLLECTION_NAME = "ShopMenuItems";

const shopMenuItemSchema = new mongoose.Schema(
  {
    shop_id: { type: Types.ObjectId, ref: "Shop", required: true },
    name: { type: String, trim: true, required: true },
    description: { type: String },
    price: { type: Number, required: true, min: 0 },
    category: { type: Types.ObjectId, ref: "MenuItemCategory", required: true },
    is_available: { type: Boolean, default: true },
    images: {
      type: [
        {
          url: { type: String, required: true },
          publicId: { type: String, required: true },
        },
      ],
      validate: {
        validator: (images) => images.length >= 1 && images.length <= 3,
        message: "Images must have 1 to 3 items",
      },
    },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

module.exports = mongoose.model(DOCUMENT_NAME, shopMenuItemSchema);