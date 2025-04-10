"use strict";

const mongoose = require("mongoose");
const { countConnect } = require("../helpers/check.connect");
const {
  db: { host, port, name },
} = require("../configs/config.mongodb");

const connectString = process.env.DB_URL || `mongodb://${host}:${port}/${name}`;

console.log("🚀 ~ connectString:", connectString);
class DataBase {
  constructor() {
    this.connect();
  }

  connect() {
    if (process.env.NODE_ENV === "development") {
      mongoose.set("debug", true);
    }

    if (!connectString) {
      throw new Error("Missing MongoDB connection string!");
    }

    mongoose
      .connect(connectString)
      .then(() => {
        console.log("MongoDB connected ✅", countConnect());
      })
      .catch((err) => {
        console.error("❌ Error connecting to MongoDB:", err);
      });
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DataBase();
    }
    return this.instance;
  }
}

const instance = DataBase.getInstance();

module.exports = instance;
