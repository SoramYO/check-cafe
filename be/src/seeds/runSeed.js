"use strict";

const mongoose = require("mongoose");
const { seedData } = require("./seedData");
const dotenv = require("dotenv");
dotenv.config();

// Cấu hình kết nối MongoDB
const MONGODB_URI = process.env.DB_URL || "mongodb://localhost:27017/checkafe";
console.log("🚀 ~ process.env.DB_URL:", process.env.DB_URL)

const runSeed = async () => {
  try {
    console.log("🔌 Đang kết nối MongoDB...");
    
    // Kết nối MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Kết nối MongoDB thành công!");
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
    // Chạy seed data
    await seedData();
    
    console.log("🎉 Seed data hoàn thành thành công!");
    
  } catch (error) {
    console.error("❌ Lỗi khi chạy seed:", error);
    process.exit(1);
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối MongoDB");
    process.exit(0);
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  runSeed();
}

module.exports = { runSeed }; 