const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const userModel = require('../models/user.model');
const shopModel = require('../models/shop.model');
const shopImageModel = require('../models/shopImage.model');
const shopSeatModel = require('../models/shopSeat.model');
const shopMenuItemModel = require('../models/shopMenuItem.model');
const shopTimeSlotModel = require('../models/shopTimeSlot.model');
const shopVerificationModel = require('../models/shopVerification.model');
const shopAmenityModel = require('../models/shopAmenity.model');
const shopThemeModel = require('../models/shopTheme.model');
const menuItemCategoryModel = require('../models/menuItemCategory.model');
const reservationModel = require('../models/reservation.model');
const reviewModel = require('../models/review.model');

const createSampleData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URL || 'mongodb://localhost:27017/checkafe');
    console.log('Connected to MongoDB');

    // Clear existing sample data
    console.log('🧹 Cleaning existing sample data...');
    await userModel.deleteMany({ email: { $in: ['shopowner@checkafe.com', 'customer@checkafe.com'] } });
    await shopModel.deleteMany({ name: 'Cafe Sài Gòn' });
    await shopAmenityModel.deleteMany({});
    await shopThemeModel.deleteMany({});
    await menuItemCategoryModel.deleteMany({});
    console.log('✅ Cleaned existing data');

    // 1. Create Shop Owner User
    const hashedPassword = await bcrypt.hash('123456', 10);
    
    const shopOwner = await userModel.create({
      email: 'shopowner@checkafe.com',
      password: hashedPassword,
      full_name: 'Nguyễn Văn Quán',
      role: 'SHOP_OWNER',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      phone: '0901234567',
      is_verified: true
    });
    console.log('✅ Created shop owner:', shopOwner.email);

    // 2. Create Customer User for reviews
    const customer = await userModel.create({
      email: 'customer@checkafe.com',
      password: hashedPassword,
      full_name: 'Trần Thị Khách',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
      phone: '0987654321',
      is_verified: true
    });
    console.log('✅ Created customer:', customer.email);

    // 3. Create Amenities
    const amenities = await shopAmenityModel.insertMany([
      { icon: 'wifi', label: 'Wifi miễn phí' },
      { icon: 'parking', label: 'Bãi đỗ xe' },
      { icon: 'air-conditioning', label: 'Máy lạnh' },
      { icon: 'outdoor-seating', label: 'Chỗ ngồi ngoài trời' },
      { icon: 'power-outlets', label: 'Ổ cắm điện' }
    ]);
    console.log('✅ Created amenities');

    // 4. Create Themes
    const themes = await shopThemeModel.insertMany([
      { 
        name: 'Vintage', 
        description: 'Phong cách cổ điển, hoài cổ',
        theme_image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&h=300&fit=crop'
      },
      { 
        name: 'Modern', 
        description: 'Phong cách hiện đại, tối giản',
        theme_image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop'
      },
      { 
        name: 'Industrial', 
        description: 'Phong cách công nghiệp',
        theme_image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=400&h=300&fit=crop'
      }
    ]);
    console.log('✅ Created themes');

    // 5. Create Menu Categories
    const categories = await menuItemCategoryModel.insertMany([
      { name: 'Cà phê', description: 'Các loại cà phê' },
      { name: 'Trà', description: 'Các loại trà' },
      { name: 'Bánh ngọt', description: 'Bánh và đồ ngọt' },
      { name: 'Đồ uống lạnh', description: 'Nước ép, sinh tố' }
    ]);
    console.log('✅ Created menu categories');

    // 6. Create Shop
    const shop = await shopModel.create({
      name: 'Cafe Sài Gòn',
      address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
      description: 'Quán cà phê với không gian thoáng đãng, view đẹp và đồ uống chất lượng cao. Phù hợp cho làm việc và gặp gỡ bạn bè.',
      phone: '0901234567',
      website: 'https://cafesaigon.com',
      location: {
        type: 'Point',
        coordinates: [106.7008, 10.7769] // Nguyễn Huệ, Q1, HCM
      },
      owner_id: shopOwner._id,
      amenities: amenities.slice(0, 3).map(a => a._id),
      theme_ids: [themes[0]._id, themes[1]._id],
      status: 'Active',
      vip_status: true,
      rating_avg: 4.5,
      rating_count: 25,
      opening_hours: [
        {
          day: 0, // Sunday
          is_closed: false,
          hours: [{ open: '07:00', close: '22:00' }]
        },
        {
          day: 1, // Monday
          is_closed: false,
          hours: [{ open: '07:00', close: '22:00' }]
        },
        {
          day: 2, // Tuesday
          is_closed: false,
          hours: [{ open: '07:00', close: '22:00' }]
        },
        {
          day: 3, // Wednesday
          is_closed: false,
          hours: [{ open: '07:00', close: '22:00' }]
        },
        {
          day: 4, // Thursday
          is_closed: false,
          hours: [{ open: '07:00', close: '22:00' }]
        },
        {
          day: 5, // Friday
          is_closed: false,
          hours: [{ open: '07:00', close: '23:00' }]
        },
        {
          day: 6, // Saturday
          is_closed: false,
          hours: [{ open: '07:00', close: '23:00' }]
        }
      ]
    });
    console.log('✅ Created shop:', shop.name);

    // 7. Create Shop Images
    const shopImages = await shopImageModel.insertMany([
      {
        shop_id: shop._id,
        url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&h=600&fit=crop',
        caption: 'Không gian chính của quán'
      },
      {
        shop_id: shop._id,
        url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=600&fit=crop',
        caption: 'Khu vực làm việc'
      },
      {
        shop_id: shop._id,
        url: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&h=600&fit=crop',
        caption: 'Quầy bar'
      }
    ]);
    console.log('✅ Created shop images');

    // 8. Create Seats
    const seats = await shopSeatModel.insertMany([
      {
        shop_id: shop._id,
        seat_name: 'Bàn VIP 1',
        description: 'Bàn VIP với view đẹp',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        is_premium: true,
        is_available: true,
        capacity: 4
      },
      {
        shop_id: shop._id,
        seat_name: 'Bàn VIP 2',
        description: 'Bàn VIP riêng tư',
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop',
        is_premium: true,
        is_available: true,
        capacity: 2
      },
      {
        shop_id: shop._id,
        seat_name: 'Bàn thường 1',
        description: 'Bàn thường gần cửa sổ',
        is_premium: false,
        is_available: true,
        capacity: 2
      },
      {
        shop_id: shop._id,
        seat_name: 'Bàn thường 2',
        description: 'Bàn thường trung tâm',
        is_premium: false,
        is_available: true,
        capacity: 4
      },
      {
        shop_id: shop._id,
        seat_name: 'Bàn thường 3',
        description: 'Bàn thường gần quầy',
        is_premium: false,
        is_available: false,
        capacity: 2
      }
    ]);
    console.log('✅ Created seats');

    // 9. Create Menu Items
    const menuItems = await shopMenuItemModel.insertMany([
      {
        shop_id: shop._id,
        name: 'Cà phê sữa đá',
        description: 'Cà phê truyền thống Việt Nam với sữa đặc',
        price: 25000,
        category: categories[0]._id,
        images: [{
          url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=400&fit=crop',
          publicId: 'coffee1'
        }],
        is_available: true
      },
      {
        shop_id: shop._id,
        name: 'Cappuccino',
        description: 'Cà phê Ý với bọt sữa mịn',
        price: 45000,
        category: categories[0]._id,
        images: [{
          url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=400&fit=crop',
          publicId: 'coffee2'
        }],
        is_available: true
      },
      {
        shop_id: shop._id,
        name: 'Trà đào cam sả',
        description: 'Trà thảo mộc với đào, cam và sả tươi',
        price: 35000,
        category: categories[1]._id,
        images: [{
          url: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&h=400&fit=crop',
          publicId: 'tea1'
        }],
        is_available: true
      },
      {
        shop_id: shop._id,
        name: 'Bánh tiramisu',
        description: 'Bánh tiramisu Ý truyền thống',
        price: 55000,
        category: categories[2]._id,
        images: [{
          url: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&h=400&fit=crop',
          publicId: 'cake1'
        }],
        is_available: true
      },
      {
        shop_id: shop._id,
        name: 'Sinh tố bơ',
        description: 'Sinh tố bơ tươi với sữa đặc',
        price: 40000,
        category: categories[3]._id,
        images: [{
          url: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400&h=400&fit=crop',
          publicId: 'smoothie1'
        }],
        is_available: false
      }
    ]);
    console.log('✅ Created menu items');

    // 10. Create Time Slots
    const timeSlots = [];
    for (let day = 0; day < 7; day++) {
      timeSlots.push(
        {
          shop_id: shop._id,
          day_of_week: day,
          start_time: '07:00',
          end_time: '10:00',
          max_regular_reservations: 5,
          max_premium_reservations: 2,
          is_active: true
        },
        {
          shop_id: shop._id,
          day_of_week: day,
          start_time: '10:00',
          end_time: '14:00',
          max_regular_reservations: 8,
          max_premium_reservations: 3,
          is_active: true
        },
        {
          shop_id: shop._id,
          day_of_week: day,
          start_time: '14:00',
          end_time: '18:00',
          max_regular_reservations: 10,
          max_premium_reservations: 4,
          is_active: true
        },
        {
          shop_id: shop._id,
          day_of_week: day,
          start_time: '18:00',
          end_time: '22:00',
          max_regular_reservations: 12,
          max_premium_reservations: 5,
          is_active: true
        }
      );
    }
    const savedTimeSlots = await shopTimeSlotModel.insertMany(timeSlots);
    console.log('✅ Created time slots');

    // 11. Create Verification
    await shopVerificationModel.create({
      shop_id: shop._id,
      document_type: 'business_license',
      documents: [{
        url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&h=400&fit=crop',
        publicId: 'doc1'
      }],
      status: 'Approved',
      submitted_at: new Date(),
      reviewed_at: new Date(),
      reason: 'Giấy phép hợp lệ'
    });
    console.log('✅ Created verification');

    // 12. Create Sample Reservations
    const reservations = [];
    const statuses = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];
    
    for (let i = 0; i < 20; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
      
      reservations.push({
        user_id: customer._id,
        shop_id: shop._id,
        seat_id: seats[Math.floor(Math.random() * seats.length)]._id,
        time_slot_id: savedTimeSlots[Math.floor(Math.random() * savedTimeSlots.length)]._id,
        reservation_type: Math.random() > 0.7 ? 'Priority' : 'Standard',
        reservation_date: randomDate,
        number_of_people: Math.floor(Math.random() * 4) + 1,
        notes: 'Đặt chỗ qua ứng dụng',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        qr_code: `qr_${i}_${Date.now()}`,
        createdAt: randomDate
      });
    }
    await reservationModel.insertMany(reservations);
    console.log('✅ Created sample reservations');

    // 13. Create Sample Reviews
    const reviews = [];
    const comments = [
      'Quán rất đẹp, không gian thoáng mát',
      'Cà phê ngon, nhân viên thân thiện',
      'View đẹp, phù hợp làm việc',
      'Giá cả hợp lý, chất lượng tốt',
      'Sẽ quay lại lần sau'
    ];
    
    for (let i = 0; i < 25; i++) {
      const randomDate = new Date();
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 60));
      
      reviews.push({
        shop_id: shop._id,
        user_id: customer._id,
        rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
        comment: comments[Math.floor(Math.random() * comments.length)],
        images: [],
        createdAt: randomDate
      });
    }
    await reviewModel.insertMany(reviews);
    console.log('✅ Created sample reviews');

    console.log('\n🎉 Sample data created successfully!');
    console.log('\n📋 Login credentials:');
    console.log('Shop Owner:');
    console.log('  Email: shopowner@checkafe.com');
    console.log('  Password: 123456');
    console.log('\nCustomer:');
    console.log('  Email: customer@checkafe.com');
    console.log('  Password: 123456');
    console.log('\n🏪 Shop created: Cafe Sài Gòn');
    console.log('📊 Stats:');
    console.log(`  - ${seats.length} seats`);
    console.log(`  - ${menuItems.length} menu items`);
    console.log(`  - ${savedTimeSlots.length} time slots`);
    console.log(`  - 20 reservations`);
    console.log(`  - 25 reviews`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the script
createSampleData(); 