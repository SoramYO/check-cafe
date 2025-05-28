# 🌱 CheckCafe Seed Data - Hướng Dẫn Sử Dụng

## 📋 Tổng Quan

File seed data này tạo ra dữ liệu mẫu hoàn chỉnh cho hệ thống CheckCafe, bao gồm:

- **41 Users**: 1 Admin + 20 Shop Owners + 20 Customers
- **20 Shops**: Các quán cà phê tại Đà Lạt với thông tin chi tiết
- **60 Shop Images**: 3 hình ảnh cho mỗi quán (20 × 3)
- **160 Shop Seats**: 8 chỗ ngồi cho mỗi quán (20 × 8)
- **1120 Time Slots**: 56 khung giờ cho mỗi quán (20 × 56)
- **160 Menu Items**: 8 món cho mỗi quán (20 × 8)
- **40 Reviews**: 2 đánh giá cho mỗi quán (20 × 2)
- **10 Reservations**: 5 đặt chỗ cho 2 quán đầu tiên
- **5 Themes**: Các chủ đề trang trí quán
- **8 Amenities**: Tiện ích quán cà phê
- **6 Categories**: Danh mục menu

## 🚀 Cách Sử Dụng

### 1. Cài Đặt Dependencies

```bash
cd be
npm install
```

### 2. Cấu Hình Database

Đảm bảo MongoDB đang chạy và cấu hình connection string:

```bash
# Sử dụng database mặc định
export MONGODB_URI="mongodb://localhost:27017/checkafe"

# Hoặc sử dụng database development
export MONGODB_URI="mongodb://localhost:27017/checkafe-dev"
```

### 3. Chạy Seed Data

#### Cách 1: Sử dụng npm script (Khuyến nghị)

```bash
# Seed với database mặc định
npm run seed

# Seed với database development
npm run seed:dev
```

#### Cách 2: Chạy trực tiếp

```bash
# Với database mặc định
node src/seeds/runSeed.js

# Với database tùy chỉnh
MONGODB_URI="mongodb://localhost:27017/your-db" node src/seeds/runSeed.js
```

### 4. Kết Quả Mong Đợi

Sau khi chạy thành công, bạn sẽ thấy output như sau:

```
🌱 Bắt đầu seed data...
🔌 Đang kết nối MongoDB...
✅ Kết nối MongoDB thành công!
📍 Database: checkafe
🗑️  Xóa dữ liệu cũ...
👥 Tạo users...
🎨 Tạo themes...
🏪 Tạo amenities...
📋 Tạo menu categories...
☕ Tạo shops...
🖼️  Tạo shop images...
🪑 Tạo shop seats...
⏰ Tạo shop time slots...
🍰 Tạo shop menu items...
⭐ Tạo reviews...
📅 Tạo reservations...
✅ Seed data hoàn thành!
📊 Thống kê:
   - Users: 41 (1 admin, 20 shop owners, 20 customers)
   - Shops: 20
   - Shop Images: 60
   - Seats: 160
   - Time Slots: 1120
   - Menu Items: 160
   - Reviews: 40
   - Reservations: 10
   - Themes: 5
   - Amenities: 8
   - Categories: 6
🎉 Seed data hoàn thành thành công!
🔌 Đã đóng kết nối MongoDB
```

## 👥 Tài Khoản Mẫu

### Admin
- **Email**: `admin@checkafe.com`
- **Password**: `admin123`
- **Role**: ADMIN

### Shop Owners
- **Email**: `owner1@checkafe.com` đến `owner20@checkafe.com`
- **Password**: `owner123`
- **Role**: SHOP_OWNER

### Customers
- **Email**: `customer1@checkafe.com` đến `customer20@checkafe.com`
- **Password**: `customer123`
- **Role**: CUSTOMER

## 🏪 Dữ Liệu Shops

### Danh Sách 20 Quán Cà Phê Đà Lạt

1. **Cà Phê Mê Linh** - 12 Đường Trần Phú, Phường 4
2. **Highland Coffee Đà Lạt** - 45 Nguyễn Thị Minh Khai, Phường 1
3. **Cà Phê Vườn Đào** - 78 Đường Hoa Hồng, Phường 2
4. **The Vintage Coffee** - 23 Đường Bùi Thị Xuân, Phường 3
5. **Cà Phê Sương Mai** - 56 Đường Yersin, Phường 10
6. **Moonlight Coffee** - 89 Đường Khe Sanh, Phường 4
7. **Cà Phê Thác Bạc** - 34 Đường Hoàng Văn Thụ, Phường 5
8. **Forest Coffee House** - 67 Đường Phan Đình Phùng, Phường 2
9. **Cà Phê Hoa Dalat** - 91 Đường Lê Đại Hành, Phường 7
10. **Mountain View Coffee** - 15 Đường Trần Quốc Toản, Phường 8
11. **Cà Phê Xưa** - 28 Đường Cao Bá Quát, Phường 6
12. **Dreamy Coffee** - 52 Đường Nguyễn Du, Phường 9
13. **Cà Phê Núi Voi** - 73 Đường Đinh Tiên Hoàng, Phường 3
14. **Sunset Coffee Lounge** - 86 Đường Lý Thường Kiệt, Phường 4
15. **Cà Phê Thung Lũng Tình Yêu** - 39 Đường Mai Anh Đào, Phường 8
16. **Pine Forest Café** - 64 Đường Hùng Vương, Phường 10
17. **Cà Phê Langbiang** - 17 Đường Phạm Ngọc Thạch, Phường 6
18. **Cloud Nine Coffee** - 81 Đường Lê Hồng Phong, Phường 1
19. **Cà Phê Hồ Xuân Hương** - 25 Đường Trần Hưng Đạo, Phường 5
20. **Artisan Coffee Studio** - 58 Đường Võ Thị Sáu, Phường 7

### Thông Tin Chi Tiết Mỗi Shop

- **8 Chỗ ngồi**: Bàn 1-2 (2 người), Bàn 3-6 (4 người), Bàn 7-8 (6 người, Premium)
- **56 Khung giờ**: 8 khung giờ × 7 ngày (07:00-23:00)
- **8 Món trong menu**: 4 cà phê, 2 trà, 2 bánh ngọt
- **3 Hình ảnh**: Ảnh đại diện và ảnh chi tiết
- **2 Đánh giá**: Từ khách hàng ngẫu nhiên (4-5 sao)

## 📅 Reservations

- **2 quán đầu tiên** có mỗi quán **5 reservations**
- **Status**: Tất cả đều ở trạng thái "Pending"
- **Ngày đặt**: Trong vòng 1-7 ngày tới
- **Loại đặt chỗ**: 70% Standard, 30% Priority

## 🎨 Themes & Amenities

### Themes (5 loại)
- Classic: Phong cách cổ điển, ấm cúng
- Modern: Phong cách hiện đại, tối giản
- Vintage: Phong cách retro, hoài cổ
- Nature: Gần gũi với thiên nhiên
- Industrial: Phong cách công nghiệp

### Amenities (8 loại)
- WiFi miễn phí
- Chỗ đậu xe
- Điều hòa
- Nhạc sống
- Khu vực ngoài trời
- Thân thiện với thú cưng
- Khu vực hút thuốc
- Giao hàng tận nơi

## 🍽️ Menu Categories

1. **Cà phê**: Các loại cà phê truyền thống và hiện đại
2. **Trà**: Trà các loại và trà thảo mộc
3. **Nước ép**: Nước ép trái cây tươi
4. **Bánh ngọt**: Bánh ngọt và dessert
5. **Bánh mặn**: Bánh mặn và món ăn nhẹ
6. **Smoothie**: Sinh tố và đồ uống đá xay

## ⚠️ Lưu Ý Quan Trọng

1. **Xóa dữ liệu cũ**: Script sẽ xóa toàn bộ dữ liệu cũ trước khi tạo mới
2. **Backup**: Hãy backup database trước khi chạy seed
3. **Environment**: Đảm bảo chạy đúng environment (dev/prod)
4. **Dependencies**: Cần có bcrypt và mongoose đã cài đặt

## 🔧 Troubleshooting

### Lỗi kết nối MongoDB
```bash
# Kiểm tra MongoDB đang chạy
sudo systemctl status mongod

# Khởi động MongoDB
sudo systemctl start mongod
```

### Lỗi permission
```bash
# Cấp quyền thực thi
chmod +x src/seeds/runSeed.js
```

### Lỗi missing dependencies
```bash
# Cài đặt lại dependencies
npm install
```

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra log chi tiết trong console
2. Đảm bảo MongoDB đang chạy
3. Kiểm tra connection string
4. Xem lại dependencies trong package.json

---

**Tác giả**: CheckCafe Development Team  
**Phiên bản**: 1.0.0  
**Cập nhật**: 2024 