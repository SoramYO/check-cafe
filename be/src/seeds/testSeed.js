"use strict";

const mongoose = require("mongoose");

// Import models
const User = require("../models/user.model");
const Shop = require("../models/shop.model");
const ShopImage = require("../models/shopImage.model");
const ShopSeat = require("../models/shopSeat.model");
const ShopTimeSlot = require("../models/shopTimeSlot.model");
const ShopMenuItem = require("../models/shopMenuItem.model");
const MenuItemCategory = require("../models/menuItemCategory.model");
const ShopTheme = require("../models/shopTheme.model");
const ShopAmenity = require("../models/shopAmenity.model");
const Review = require("../models/review.model");
const Reservation = require("../models/reservation.model");

const { USER_ROLE } = require("../constants/enum");

// Cấu hình kết nối MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/checkafe";

const testSeedData = async () => {
  try {
    console.log("🔍 Đang kiểm tra seed data...");
    
    // Kết nối MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log("✅ Kết nối MongoDB thành công!");
    console.log(`📍 Database: ${mongoose.connection.name}`);
    
    // Đếm số lượng documents
    const counts = await Promise.all([
      User.countDocuments(),
      Shop.countDocuments(),
      ShopImage.countDocuments(),
      ShopSeat.countDocuments(),
      ShopTimeSlot.countDocuments(),
      ShopMenuItem.countDocuments(),
      MenuItemCategory.countDocuments(),
      ShopTheme.countDocuments(),
      ShopAmenity.countDocuments(),
      Review.countDocuments(),
      Reservation.countDocuments()
    ]);

    const [
      userCount,
      shopCount,
      imageCount,
      seatCount,
      timeSlotCount,
      menuItemCount,
      categoryCount,
      themeCount,
      amenityCount,
      reviewCount,
      reservationCount
    ] = counts;

    console.log("\n📊 Thống kê dữ liệu trong database:");
    console.log(`   👥 Users: ${userCount}`);
    console.log(`   ☕ Shops: ${shopCount}`);
    console.log(`   🖼️  Shop Images: ${imageCount}`);
    console.log(`   🪑 Shop Seats: ${seatCount}`);
    console.log(`   ⏰ Time Slots: ${timeSlotCount}`);
    console.log(`   🍰 Menu Items: ${menuItemCount}`);
    console.log(`   📋 Categories: ${categoryCount}`);
    console.log(`   🎨 Themes: ${themeCount}`);
    console.log(`   🏪 Amenities: ${amenityCount}`);
    console.log(`   ⭐ Reviews: ${reviewCount}`);
    console.log(`   📅 Reservations: ${reservationCount}`);

    // Kiểm tra chi tiết users
    const adminCount = await User.countDocuments({ role: USER_ROLE.ADMIN });
    const ownerCount = await User.countDocuments({ role: USER_ROLE.SHOP_OWNER });
    const customerCount = await User.countDocuments({ role: USER_ROLE.CUSTOMER });

    console.log("\n👥 Chi tiết Users:");
    console.log(`   🔑 Admin: ${adminCount}`);
    console.log(`   🏪 Shop Owners: ${ownerCount}`);
    console.log(`   👤 Customers: ${customerCount}`);

    // Lấy thông tin admin
    const admin = await User.findOne({ role: USER_ROLE.ADMIN });
    if (admin) {
      console.log(`   📧 Admin Email: ${admin.email}`);
    }

    // Kiểm tra shops có đầy đủ thông tin
    const shopsWithDetails = await Shop.find()
      .populate('owner_id', 'full_name email')
      .populate('theme_ids', 'name')
      .populate('amenities', 'label')
      .limit(3);

    console.log("\n☕ Mẫu thông tin Shops:");
    shopsWithDetails.forEach((shop, index) => {
      console.log(`   ${index + 1}. ${shop.name}`);
      console.log(`      📍 ${shop.address}`);
      console.log(`      👤 Owner: ${shop.owner_id.full_name} (${shop.owner_id.email})`);
      console.log(`      🎨 Theme: ${shop.theme_ids.map(t => t.name).join(', ')}`);
      console.log(`      🏪 Amenities: ${shop.amenities.length} items`);
    });

    // Kiểm tra reservations
    const reservations = await Reservation.find()
      .populate('user_id', 'full_name email')
      .populate('shop_id', 'name')
      .populate('seat_id', 'seat_name')
      .limit(5);

    console.log("\n📅 Mẫu Reservations:");
    reservations.forEach((reservation, index) => {
      console.log(`   ${index + 1}. ${reservation.shop_id.name}`);
      console.log(`      👤 Customer: ${reservation.user_id.full_name}`);
      console.log(`      🪑 Seat: ${reservation.seat_id.seat_name}`);
      console.log(`      📅 Date: ${reservation.reservation_date.toLocaleDateString()}`);
      console.log(`      📊 Status: ${reservation.status}`);
    });

    // Kiểm tra tính toàn vẹn dữ liệu
    console.log("\n🔍 Kiểm tra tính toàn vẹn dữ liệu:");
    
    // Kiểm tra mỗi shop có đủ seats, time slots, menu items
    const shopIntegrityChecks = await Promise.all(
      (await Shop.find().limit(3)).map(async (shop) => {
        const [seats, timeSlots, menuItems, images, reviews] = await Promise.all([
          ShopSeat.countDocuments({ shop_id: shop._id }),
          ShopTimeSlot.countDocuments({ shop_id: shop._id }),
          ShopMenuItem.countDocuments({ shop_id: shop._id }),
          ShopImage.countDocuments({ shop_id: shop._id }),
          Review.countDocuments({ shop_id: shop._id })
        ]);
        
        return {
          shopName: shop.name,
          seats,
          timeSlots,
          menuItems,
          images,
          reviews
        };
      })
    );

    shopIntegrityChecks.forEach((check, index) => {
      console.log(`   ${index + 1}. ${check.shopName}:`);
      console.log(`      🪑 Seats: ${check.seats}/8`);
      console.log(`      ⏰ Time Slots: ${check.timeSlots}/56`);
      console.log(`      🍰 Menu Items: ${check.menuItems}/8`);
      console.log(`      🖼️  Images: ${check.images}/3`);
      console.log(`      ⭐ Reviews: ${check.reviews}/2`);
    });

    // Kiểm tra expected vs actual
    const expectedCounts = {
      users: 41,
      shops: 20,
      images: 60,
      seats: 160,
      timeSlots: 1120,
      menuItems: 160,
      categories: 6,
      themes: 5,
      amenities: 8,
      reviews: 40,
      reservations: 10
    };

    const actualCounts = {
      users: userCount,
      shops: shopCount,
      images: imageCount,
      seats: seatCount,
      timeSlots: timeSlotCount,
      menuItems: menuItemCount,
      categories: categoryCount,
      themes: themeCount,
      amenities: amenityCount,
      reviews: reviewCount,
      reservations: reservationCount
    };

    console.log("\n✅ So sánh Expected vs Actual:");
    let allMatch = true;
    Object.keys(expectedCounts).forEach(key => {
      const expected = expectedCounts[key];
      const actual = actualCounts[key];
      const match = expected === actual;
      const status = match ? "✅" : "❌";
      
      console.log(`   ${status} ${key}: ${actual}/${expected}`);
      if (!match) allMatch = false;
    });

    if (allMatch) {
      console.log("\n🎉 Tất cả dữ liệu đều chính xác!");
    } else {
      console.log("\n⚠️  Có một số dữ liệu không khớp với expected.");
    }

    console.log("\n✅ Kiểm tra hoàn thành!");

  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra seed data:", error);
    throw error;
  } finally {
    // Đóng kết nối
    await mongoose.connection.close();
    console.log("🔌 Đã đóng kết nối MongoDB");
    process.exit(0);
  }
};

// Chạy script nếu được gọi trực tiếp
if (require.main === module) {
  testSeedData();
}

module.exports = { testSeedData }; 