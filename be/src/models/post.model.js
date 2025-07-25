"use strict";
const mongoose = require("mongoose");
const { Schema, Types } = mongoose;

const DOCUMENT_NAME = "Post";
const COLLECTION_NAME = "Posts";

const postSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    image: { type: String },
    publishedAt: { type: Date },
    url: { type: String, required: true, unique: true, trim: true },
    metaDescription: { type: String },
    keywords: [{ type: String, trim: true }],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
    createdBy: { type: Types.ObjectId, ref: "User" },
    updatedBy: { type: Types.ObjectId, ref: "User" },
  },
  { timestamps: true, collection: COLLECTION_NAME }
);

// Index for url
postSchema.index({ url: 1 }, { unique: true });

module.exports = mongoose.model(DOCUMENT_NAME, postSchema); 