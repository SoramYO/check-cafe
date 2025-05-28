# 🚀 Quick Start - CheckCafe Seed Data

## Chạy Seed Data (3 bước đơn giản)

### 1. Cài đặt dependencies
```bash
cd be
npm install
```

### 2. Chạy seed data
```bash
npm run seed
```

### 3. Kiểm tra kết quả
```bash
npm run seed:test
```

## 🔑 Tài Khoản Test

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@checkafe.com` | `admin123` |
| Shop Owner | `owner1@checkafe.com` | `owner123` |
| Customer | `customer1@checkafe.com` | `customer123` |

## 📊 Dữ Liệu Được Tạo

- ✅ **41 Users** (1 admin + 20 owners + 20 customers)
- ✅ **20 Shops** (Quán cà phê Đà Lạt)
- ✅ **160 Seats** (8 chỗ ngồi/quán)
- ✅ **1120 Time Slots** (56 khung giờ/quán)
- ✅ **160 Menu Items** (8 món/quán)
- ✅ **10 Reservations** (5 đặt chỗ cho 2 quán đầu)

## 🔧 Commands

```bash
# Seed với database mặc định
npm run seed

# Seed với database development  
npm run seed:dev

# Kiểm tra dữ liệu đã seed
npm run seed:test

# Chạy trực tiếp
node src/seeds/runSeed.js
```

## ⚠️ Lưu Ý

- Script sẽ **XÓA** toàn bộ dữ liệu cũ
- Backup database trước khi chạy
- Đảm bảo MongoDB đang chạy

---
📖 **Chi tiết**: Xem file `README.md` trong cùng thư mục 