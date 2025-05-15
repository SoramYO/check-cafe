"use strict";
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const DOCUMENT_NAME = "UserFavorite";
const COLLECTION_NAME = "UserFavorites";

const userFavoriteSchema = new Schema(
  {
    user_id: { type: Types.ObjectId, ref: "User", required: true },
    favorite_shops: [{ type: Types.ObjectId, ref: "Shop" }],
    favorite_menu_items: [{ type: Types.ObjectId, ref: "ShopMenuItem" }],
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

module.exports = mongoose.model(DOCUMENT_NAME, userFavoriteSchema);


