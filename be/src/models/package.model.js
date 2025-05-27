"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Package";
const COLLECTION_NAME = "Packages";


const packageSchema = new Schema({
    name: { type: String, required: true },
    icon: { type: String, required: true },
    description: [{
        type: String,
        required: true
    }],
    price: { type: Number, required: true },
    duration: { type: Number, required: true },
}, { collection: COLLECTION_NAME, timestamps: true });

module.exports = model(DOCUMENT_NAME, packageSchema);

