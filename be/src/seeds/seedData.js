"use strict";

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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

const { USER_ROLE, RESERVATION_STATUS, RESERVATION_TYPE } = require("../constants/enum");

// Dữ liệu mẫu cho các quán cà phê ở Đà Lạt
const dalateShopsData = [
  {
    name: "Cà Phê Mê Linh",
    address: "12 Đường Trần Phú, Phường 4, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê ấm cúng với view núi đồi tuyệt đẹp, chuyên phục vụ cà phê rang xay và bánh ngọt tự làm.",
    phone: "0263.3821.234",
    website: "https://cafemelinh.com",
    coordinates: [108.4419, 11.9404]
  },
  {
    name: "Highland Coffee Đà Lạt",
    address: "45 Nguyễn Thị Minh Khai, Phường 1, Thành phố Đà Lạt, Lâm Đồng",
    description: "Chuỗi cà phê nổi tiếng với không gian hiện đại, phục vụ đa dạng thức uống và món ăn nhẹ.",
    phone: "0263.3567.890",
    website: "https://highlandscoffee.com.vn",
    coordinates: [108.4421, 11.9406]
  },
  {
    name: "Cà Phê Vườn Đào",
    address: "78 Đường Hoa Hồng, Phường 2, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê trong vườn đào với không gian xanh mát, lý tưởng cho những buổi hẹn hò lãng mạn.",
    phone: "0263.3445.678",
    website: "https://cafevuondao.vn",
    coordinates: [108.4423, 11.9408]
  },
  {
    name: "The Vintage Coffee",
    address: "23 Đường Bùi Thị Xuân, Phường 3, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê phong cách vintage với nội thất cổ điển, chuyên phục vụ cà phê đặc biệt và bánh Âu.",
    phone: "0263.3789.123",
    website: "https://vintagecoffee.dalat.vn",
    coordinates: [108.4425, 11.9410]
  },
  {
    name: "Cà Phê Sương Mai",
    address: "56 Đường Yersin, Phường 10, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê mở cửa từ sáng sớm, nổi tiếng với cà phê phin truyền thống và bánh mì Đà Lạt.",
    phone: "0263.3234.567",
    website: "https://cafesuongmai.com",
    coordinates: [108.4427, 11.9412]
  },
  {
    name: "Moonlight Coffee",
    address: "89 Đường Khe Sanh, Phường 4, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê về đêm với ánh sáng lung linh, phục vụ cà phê và cocktail không cồn.",
    phone: "0263.3876.543",
    website: "https://moonlightcoffee.vn",
    coordinates: [108.4429, 11.9414]
  },
  {
    name: "Cà Phê Thác Bạc",
    address: "34 Đường Hoàng Văn Thụ, Phường 5, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê gần thác Bạc với không gian thoáng mát, chuyên cà phê sạch và trà thảo mộc.",
    phone: "0263.3654.321",
    website: "https://cafethacbac.dalat.vn",
    coordinates: [108.4431, 11.9416]
  },
  {
    name: "Forest Coffee House",
    address: "67 Đường Phan Đình Phùng, Phường 2, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê trong rừng thông với thiết kế gỗ tự nhiên, mang đến trải nghiệm gần gũi với thiên nhiên.",
    phone: "0263.3987.654",
    website: "https://forestcoffeehouse.vn",
    coordinates: [108.4433, 11.9418]
  },
  {
    name: "Cà Phê Hoa Dalat",
    address: "91 Đường Lê Đại Hành, Phường 7, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê được trang trí bằng hoa tươi Đà Lạt, tạo không gian thơ mộng và lãng mạn.",
    phone: "0263.3321.987",
    website: "https://cafehoadalat.com",
    coordinates: [108.4435, 11.9420]
  },
  {
    name: "Mountain View Coffee",
    address: "15 Đường Trần Quốc Toản, Phường 8, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê trên cao với tầm nhìn panorama ra toàn cảnh thành phố Đà Lạt và núi đồi xung quanh.",
    phone: "0263.3456.789",
    website: "https://mountainviewcoffee.vn",
    coordinates: [108.4437, 11.9422]
  },
  {
    name: "Cà Phê Xưa",
    address: "28 Đường Cao Bá Quát, Phường 6, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê mang đậm nét hoài cổ với những món đồ cũ, phục vụ cà phê truyền thống Việt Nam.",
    phone: "0263.3789.456",
    website: "https://cafexua.dalat.vn",
    coordinates: [108.4439, 11.9424]
  },
  {
    name: "Dreamy Coffee",
    address: "52 Đường Nguyễn Du, Phường 9, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê với không gian mơ màng, chuyên phục vụ các loại cà phê đặc biệt và dessert tinh tế.",
    phone: "0263.3147.258",
    website: "https://dreamycoffee.vn",
    coordinates: [108.4441, 11.9426]
  },
  {
    name: "Cà Phê Núi Voi",
    address: "73 Đường Đinh Tiên Hoàng, Phường 3, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê gần núi Voi với view tuyệt đẹp, nổi tiếng với cà phê chồn và bánh tráng nướng.",
    phone: "0263.3369.147",
    website: "https://cafenuivoi.com",
    coordinates: [108.4443, 11.9428]
  },
  {
    name: "Sunset Coffee Lounge",
    address: "86 Đường Lý Thường Kiệt, Phường 4, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê lý tưởng để ngắm hoàng hôn với không gian sang trọng và menu đồ uống phong phú.",
    phone: "0263.3258.369",
    website: "https://sunsetcoffeelounge.vn",
    coordinates: [108.4445, 11.9430]
  },
  {
    name: "Cà Phê Thung Lũng Tình Yêu",
    address: "39 Đường Mai Anh Đào, Phường 8, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê lãng mạn gần thung lũng tình yêu, không gian đẹp cho các cặp đôi và gia đình.",
    phone: "0263.3741.852",
    website: "https://cafethunglungtinhyeu.vn",
    coordinates: [108.4447, 11.9432]
  },
  {
    name: "Pine Forest Café",
    address: "64 Đường Hùng Vương, Phường 10, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê giữa rừng thông với không khí trong lành, chuyên cà phê organic và món chay.",
    phone: "0263.3963.741",
    website: "https://pineforestcafe.dalat.vn",
    coordinates: [108.4449, 11.9434]
  },
  {
    name: "Cà Phê Langbiang",
    address: "17 Đường Phạm Ngọc Thạch, Phường 6, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê mang tên núi Langbiang huyền thoại, phục vụ cà phê đặc sản vùng cao và bánh địa phương.",
    phone: "0263.3852.963",
    website: "https://cafelangbiang.com",
    coordinates: [108.4451, 11.9436]
  },
  {
    name: "Cloud Nine Coffee",
    address: "81 Đường Lê Hồng Phong, Phường 1, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê trên tầng cao với cảm giác như đang ngồi trên mây, view 360 độ tuyệt đẹp.",
    phone: "0263.3174.285",
    website: "https://cloudninecoffee.vn",
    coordinates: [108.4453, 11.9438]
  },
  {
    name: "Cà Phê Hồ Xuân Hương",
    address: "25 Đường Trần Hưng Đạo, Phường 5, Thành phố Đà Lạt, Lâm Đồng",
    description: "Quán cà phê ven hồ Xuân Hương với không gian thơ mộng, lý tưởng để thư giãn và ngắm cảnh.",
    phone: "0263.3428.517",
    website: "https://cafehoxuanhuong.vn",
    coordinates: [108.4455, 11.9440]
  },
  {
    name: "Artisan Coffee Studio",
    address: "58 Đường Võ Thị Sáu, Phường 7, Thành phố Đà Lạt, Lâm Đồng",
    description: "Studio cà phê nghệ thuật với không gian sáng tạo, chuyên cà phê specialty và workshop pha chế.",
    phone: "0263.3517.428",
    website: "https://artisancoffeestudio.dalat.vn",
    coordinates: [108.4457, 11.9442]
  }
];

// Dữ liệu người dùng mẫu
const usersData = [
  // Admin
  {
    full_name: "Nguyễn Văn Admin",
    email: "admin@checkafe.com",
    password: "admin123",
    phone: "0901234567",
    role: USER_ROLE.ADMIN,
    points: 1000,
    vip_status: true,
    avatar: "https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/admin_avatar.png"
  },
  // Shop Owners (20 người)
  ...Array.from({ length: 20 }, (_, i) => ({
    full_name: `Chủ quán ${i + 1}`,
    email: `owner${i + 1}@checkafe.com`,
    password: "owner123",
    phone: `090123456${i + 10}`,
    role: USER_ROLE.SHOP_OWNER,
    points: Math.floor(Math.random() * 500) + 100,
    vip_status: i < 5, // 5 chủ quán đầu có VIP
    avatar: `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/owner_${i + 1}.png`
  })),
  // Customers (20 người)
  ...Array.from({ length: 20 }, (_, i) => ({
    full_name: `Khách hàng ${i + 1}`,
    email: `customer${i + 1}@checkafe.com`,
    password: "customer123",
    phone: `091234567${i + 10}`,
    role: USER_ROLE.CUSTOMER,
    points: Math.floor(Math.random() * 200),
    vip_status: i < 3, // 3 khách hàng đầu có VIP
    avatar: `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/customer_${i + 1}.png`
  }))
];

// Dữ liệu themes
const themesData = [
  {
    name: "Classic",
    description: "Phong cách cổ điển, ấm cúng",
    theme_image: "https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/theme_classic.png"
  },
  {
    name: "Modern",
    description: "Phong cách hiện đại, tối giản",
    theme_image: "https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/theme_modern.png"
  },
  {
    name: "Vintage",
    description: "Phong cách retro, hoài cổ",
    theme_image: "https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/theme_vintage.png"
  },
  {
    name: "Nature",
    description: "Gần gũi với thiên nhiên",
    theme_image: "https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/theme_nature.png"
  },
  {
    name: "Industrial",
    description: "Phong cách công nghiệp",
    theme_image: "https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/theme_industrial.png"
  }
];

// Dữ liệu amenities
const amenitiesData = [
  { icon: "wifi", label: "WiFi miễn phí" },
  { icon: "parking", label: "Chỗ đậu xe" },
  { icon: "ac", label: "Điều hòa" },
  { icon: "music", label: "Nhạc sống" },
  { icon: "outdoor", label: "Khu vực ngoài trời" },
  { icon: "pet", label: "Thân thiện với thú cưng" },
  { icon: "smoking", label: "Khu vực hút thuốc" },
  { icon: "delivery", label: "Giao hàng tận nơi" }
];

// Dữ liệu categories cho menu
const categoriesData = [
  { name: "Cà phê", description: "Các loại cà phê truyền thống và hiện đại" },
  { name: "Trà", description: "Trà các loại và trà thảo mộc" },
  { name: "Nước ép", description: "Nước ép trái cây tươi" },
  { name: "Bánh ngọt", description: "Bánh ngọt và dessert" },
  { name: "Bánh mặn", description: "Bánh mặn và món ăn nhẹ" },
  { name: "Smoothie", description: "Sinh tố và đồ uống đá xay" }
];

// Hàm tạo menu items cho mỗi shop
const createMenuItems = (shopId, categories) => {
  const menuItems = [];
  const coffeeItems = [
    { name: "Cà phê đen", price: 25000, description: "Cà phê đen truyền thống" },
    { name: "Cà phê sữa", price: 30000, description: "Cà phê sữa đá" },
    { name: "Cappuccino", price: 45000, description: "Cà phê Cappuccino Ý" },
    { name: "Latte", price: 50000, description: "Cà phê Latte thơm ngon" }
  ];
  
  const teaItems = [
    { name: "Trà đào", price: 35000, description: "Trà đào cam sả" },
    { name: "Trà sữa", price: 40000, description: "Trà sữa trân châu" }
  ];
  
  const cakeItems = [
    { name: "Bánh tiramisu", price: 55000, description: "Bánh tiramisu Ý" },
    { name: "Bánh cheesecake", price: 60000, description: "Bánh phô mai New York" }
  ];

  // Thêm coffee items
  coffeeItems.forEach(item => {
    menuItems.push({
      shop_id: shopId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: categories.find(c => c.name === "Cà phê")._id,
      is_available: true,
      images: [{
        url: `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/${item.name.replace(/\s+/g, '_').toLowerCase()}.jpg`,
        publicId: `${item.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`
      }]
    });
  });

  // Thêm tea items
  teaItems.forEach(item => {
    menuItems.push({
      shop_id: shopId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: categories.find(c => c.name === "Trà")._id,
      is_available: true,
      images: [{
        url: `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/${item.name.replace(/\s+/g, '_').toLowerCase()}.jpg`,
        publicId: `${item.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`
      }]
    });
  });

  // Thêm cake items
  cakeItems.forEach(item => {
    menuItems.push({
      shop_id: shopId,
      name: item.name,
      description: item.description,
      price: item.price,
      category: categories.find(c => c.name === "Bánh ngọt")._id,
      is_available: true,
      images: [{
        url: `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/${item.name.replace(/\s+/g, '_').toLowerCase()}.jpg`,
        publicId: `${item.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`
      }]
    });
  });

  return menuItems;
};

// Hàm tạo seats cho mỗi shop
const createSeats = (shopId) => {
  return Array.from({ length: 8 }, (_, i) => ({
    shop_id: shopId,
    seat_name: `Bàn ${i + 1}`,
    description: `Bàn số ${i + 1} - ${i < 4 ? 'Khu vực trong nhà' : 'Khu vực ngoài trời'}`,
    image: `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/seat_${i + 1}.jpg`,
    is_premium: i >= 6, // 2 bàn cuối là premium
    is_available: true,
    capacity: i < 2 ? 2 : i < 6 ? 4 : 6 // Bàn 1-2: 2 người, bàn 3-6: 4 người, bàn 7-8: 6 người
  }));
};

// Hàm tạo time slots cho mỗi shop
const createTimeSlots = (shopId) => {
  const timeSlots = [];
  const times = [
    { start: "07:00", end: "09:00" },
    { start: "09:00", end: "11:00" },
    { start: "11:00", end: "13:00" },
    { start: "13:00", end: "15:00" },
    { start: "15:00", end: "17:00" },
    { start: "17:00", end: "19:00" },
    { start: "19:00", end: "21:00" },
    { start: "21:00", end: "23:00" }
  ];

  // Tạo time slots cho tất cả các ngày trong tuần
  for (let day = 0; day <= 6; day++) {
    times.forEach(time => {
      timeSlots.push({
        shop_id: shopId,
        day_of_week: day,
        start_time: time.start,
        end_time: time.end,
        max_regular_reservations: 5,
        max_premium_reservations: 2,
        is_active: true
      });
    });
  }

  return timeSlots;
};

// Hàm tạo shop images
const createShopImages = (shopId, shopName) => {
  return Array.from({ length: 3 }, (_, i) => ({
    shop_id: shopId,
    url: `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/${shopName.replace(/\s+/g, '_').toLowerCase()}_${i + 1}.jpg`,
    caption: `Hình ảnh ${i + 1} của ${shopName}`
  }));
};

// Hàm tạo reviews
const createReviews = (shopId, customers) => {
  const reviewTexts = [
    "Quán rất đẹp, cà phê ngon, nhân viên thân thiện!",
    "Không gian thoáng mát, view đẹp, giá cả hợp lý.",
    "Cà phê thơm ngon, bánh ngọt tuyệt vời!",
    "Phục vụ tốt, không gian yên tĩnh phù hợp làm việc.",
    "Quán có wifi mạnh, thích hợp cho freelancer.",
    "Đồ uống đa dạng, chất lượng tốt.",
    "Không gian lãng mạn, phù hợp hẹn hò.",
    "Giá cả phải chăng, chất lượng tốt."
  ];

  return Array.from({ length: 2 }, (_, i) => ({
    user_id: customers[Math.floor(Math.random() * customers.length)]._id,
    shop_id: shopId,
    rating: Math.floor(Math.random() * 2) + 4, // Rating 4-5 sao
    comment: reviewTexts[Math.floor(Math.random() * reviewTexts.length)],
    images: [
      `https://res.cloudinary.com/dqpe1pisz/image/upload/v1744747952/review_${shopId}_${i + 1}.jpg`
    ]
  }));
};

// Hàm seed data
const seedData = async () => {
  try {
    console.log("🌱 Bắt đầu seed data...");

    // Xóa dữ liệu cũ
    console.log("🗑️  Xóa dữ liệu cũ...");
    await Promise.all([
      User.deleteMany({}),
      Shop.deleteMany({}),
      ShopImage.deleteMany({}),
      ShopSeat.deleteMany({}),
      ShopTimeSlot.deleteMany({}),
      ShopMenuItem.deleteMany({}),
      MenuItemCategory.deleteMany({}),
      ShopTheme.deleteMany({}),
      ShopAmenity.deleteMany({}),
      Review.deleteMany({}),
      Reservation.deleteMany({})
    ]);

    // Tạo users
    console.log("👥 Tạo users...");
    const hashedUsers = await Promise.all(
      usersData.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const users = await User.insertMany(hashedUsers);
    const admin = users.find(u => u.role === USER_ROLE.ADMIN);
    const shopOwners = users.filter(u => u.role === USER_ROLE.SHOP_OWNER);
    const customers = users.filter(u => u.role === USER_ROLE.CUSTOMER);

    // Tạo themes
    console.log("🎨 Tạo themes...");
    const themes = await ShopTheme.insertMany(themesData);

    // Tạo amenities
    console.log("🏪 Tạo amenities...");
    const amenities = await ShopAmenity.insertMany(amenitiesData);

    // Tạo categories
    console.log("📋 Tạo menu categories...");
    const categories = await MenuItemCategory.insertMany(categoriesData);

    // Tạo shops
    console.log("☕ Tạo shops...");
    const shopsToCreate = dalateShopsData.map((shopData, index) => ({
      name: shopData.name,
      address: shopData.address,
      description: shopData.description,
      phone: shopData.phone,
      website: shopData.website,
      location: {
        type: "Point",
        coordinates: shopData.coordinates
      },
      owner_id: shopOwners[index]._id,
      staff_ids: [],
      theme_ids: [themes[Math.floor(Math.random() * themes.length)]._id],
      vip_status: index < 5, // 5 shop đầu có VIP
      rating_avg: (Math.random() * 1.5 + 3.5).toFixed(1), // Rating 3.5-5.0
      rating_count: Math.floor(Math.random() * 50) + 10,
      status: "Active",
      amenities: amenities.slice(0, Math.floor(Math.random() * 4) + 2).map(a => a._id), // 2-5 amenities
      opening_hours: [
        { day: 0, is_closed: false, hours: [{ open: "07:00", close: "22:00" }] },
        { day: 1, is_closed: false, hours: [{ open: "07:00", close: "22:00" }] },
        { day: 2, is_closed: false, hours: [{ open: "07:00", close: "22:00" }] },
        { day: 3, is_closed: false, hours: [{ open: "07:00", close: "22:00" }] },
        { day: 4, is_closed: false, hours: [{ open: "07:00", close: "22:00" }] },
        { day: 5, is_closed: false, hours: [{ open: "07:00", close: "23:00" }] },
        { day: 6, is_closed: false, hours: [{ open: "07:00", close: "23:00" }] }
      ]
    }));

    const shops = await Shop.insertMany(shopsToCreate);

    // Tạo shop images
    console.log("🖼️  Tạo shop images...");
    const allShopImages = [];
    shops.forEach(shop => {
      allShopImages.push(...createShopImages(shop._id, shop.name));
    });
    await ShopImage.insertMany(allShopImages);

    // Tạo shop seats
    console.log("🪑 Tạo shop seats...");
    const allSeats = [];
    shops.forEach(shop => {
      allSeats.push(...createSeats(shop._id));
    });
    const seats = await ShopSeat.insertMany(allSeats);

    // Tạo shop time slots
    console.log("⏰ Tạo shop time slots...");
    const allTimeSlots = [];
    shops.forEach(shop => {
      allTimeSlots.push(...createTimeSlots(shop._id));
    });
    const timeSlots = await ShopTimeSlot.insertMany(allTimeSlots);

    // Tạo shop menu items
    console.log("🍰 Tạo shop menu items...");
    const allMenuItems = [];
    shops.forEach(shop => {
      allMenuItems.push(...createMenuItems(shop._id, categories));
    });
    await ShopMenuItem.insertMany(allMenuItems);

    // Tạo reviews
    console.log("⭐ Tạo reviews...");
    const allReviews = [];
    shops.forEach(shop => {
      allReviews.push(...createReviews(shop._id, customers));
    });
    await Review.insertMany(allReviews);

    // Tạo reservations cho 2 shop đầu tiên (mỗi shop 5 reservations)
    console.log("📅 Tạo reservations...");
    const reservationsToCreate = [];
    
    for (let i = 0; i < 2; i++) {
      const shop = shops[i];
      const shopSeats = seats.filter(s => s.shop_id.toString() === shop._id.toString());
      const shopTimeSlots = timeSlots.filter(ts => ts.shop_id.toString() === shop._id.toString());
      
      for (let j = 0; j < 5; j++) {
        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomSeat = shopSeats[Math.floor(Math.random() * shopSeats.length)];
        const randomTimeSlot = shopTimeSlots[Math.floor(Math.random() * shopTimeSlots.length)];
        
        // Tạo ngày đặt trong tương lai (1-7 ngày)
        const reservationDate = new Date();
        reservationDate.setDate(reservationDate.getDate() + Math.floor(Math.random() * 7) + 1);
        
        reservationsToCreate.push({
          user_id: randomCustomer._id,
          shop_id: shop._id,
          seat_id: randomSeat._id,
          time_slot_id: randomTimeSlot._id,
          reservation_type: Math.random() > 0.7 ? RESERVATION_TYPE.PRIORITY : RESERVATION_TYPE.STANDARD,
          reservation_date: reservationDate,
          number_of_people: Math.floor(Math.random() * randomSeat.capacity) + 1,
          notes: `Đặt chỗ số ${j + 1} cho ${shop.name}`,
          status: RESERVATION_STATUS.PENDING
        });
      }
    }
    
    await Reservation.insertMany(reservationsToCreate);

    console.log("✅ Seed data hoàn thành!");
    console.log(`📊 Thống kê:`);
    console.log(`   - Users: ${users.length} (1 admin, 20 shop owners, 20 customers)`);
    console.log(`   - Shops: ${shops.length}`);
    console.log(`   - Shop Images: ${allShopImages.length}`);
    console.log(`   - Seats: ${allSeats.length}`);
    console.log(`   - Time Slots: ${allTimeSlots.length}`);
    console.log(`   - Menu Items: ${allMenuItems.length}`);
    console.log(`   - Reviews: ${allReviews.length}`);
    console.log(`   - Reservations: ${reservationsToCreate.length}`);
    console.log(`   - Themes: ${themes.length}`);
    console.log(`   - Amenities: ${amenities.length}`);
    console.log(`   - Categories: ${categories.length}`);

    return {
      users,
      shops,
      seats,
      timeSlots,
      themes,
      amenities,
      categories
    };

  } catch (error) {
    console.error("❌ Lỗi khi seed data:", error);
    throw error;
  }
};

module.exports = { seedData }; 