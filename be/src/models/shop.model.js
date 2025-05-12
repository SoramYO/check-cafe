"use strict";

const mongoose = require("mongoose");
const { Types } = mongoose;

const DOCUMENT_NAME = "Shop";
const COLLECTION_NAME = "Shops";

const shopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    owner_id: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
    },
    theme_ids: [
      {
        type: Types.ObjectId,
        ref: "ShopTheme",
      },
    ],
    vip_status: {
      type: Boolean,
      default: false,
    },
    rating_avg: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    rating_count: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Inactive", "Rejected"],
      default: "Pending",
    },
    amenities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ShopAmenity",
      },
    ],
    opening_hours: [
      {
        day: {
          type: Number,
          enum: [0, 1, 2, 3, 4, 5, 6], // 0 = Chủ Nhật, 1 = Thứ Hai, ..., 6 = Thứ Bảy
          required: true,
        },
        is_closed: {
          type: Boolean,
          default: false,
        },
        hours: [
          {
            open: {
              type: String,
              match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm (24h)
              required: function () {
                return !this.is_closed;
              },
            },
            close: {
              type: String,
              match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:mm (24h)
              required: function () {
                return !this.is_closed;
              },
            },
          },
        ],
      },
    ],
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Middleware để đảm bảo opening_hours có bản ghi cho tất cả các ngày
shopSchema.pre("save", function (next) {
  const days = [0, 1, 2, 3, 4, 5, 6];
  if (!this.opening_hours || this.opening_hours.length === 0) {
    this.opening_hours = days.map((day) => ({ day, is_closed: true }));
  } else {
    // Đảm bảo tất cả các ngày đều có bản ghi
    const existingDays = this.opening_hours.map((entry) => entry.day);
    const missingDays = days.filter((day) => !existingDays.includes(day));
    if (missingDays.length > 0) {
      this.opening_hours.push(
        ...missingDays.map((day) => ({ day, is_closed: true }))
      );
    }
  }
  next();
});

// Index cho tìm kiếm địa lý
shopSchema.index({ location: "2dsphere" });
// Index cho tìm kiếm theo tên
shopSchema.index({ name: "text" });

// Virtual để populate shopImages từ Shop sang ShopImage qua shop_id
shopSchema.virtual("shopImages", {
  ref: "ShopImage",
  localField: "_id",
  foreignField: "shop_id",
  justOne: false,
});

// Virtual để format opening_hours thành dạng dễ đọc
shopSchema.virtual("formatted_opening_hours").get(function () {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return this.opening_hours.reduce((acc, entry) => {
    const dayName = days[entry.day];
    if (entry.is_closed) {
      acc[dayName] = "Closed";
    } else {
      const hours = entry.hours.map((h) => `${h.open} - ${h.close}`);
      acc[dayName] = hours.length > 0 ? hours.join(", ") : "Closed";
    }
    return acc;
  }, {});
});

// Virtual để kiểm tra trạng thái mở/đóng cửa
shopSchema.virtual("is_open").get(function () {
  const now = new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" });
  const date = new Date(now);
  const day = date.getDay();
  const currentTime = date.getHours() * 60 + date.getMinutes();
  const entry = this.opening_hours.find((e) => e.day === day);
  if (!entry || entry.is_closed) return false;
  return entry.hours.some((h) => {
    const [openHour, openMinute] = h.open.split(":").map(Number);
    const [closeHour, closeMinute] = h.close.split(":").map(Number);
    const openTime = openHour * 60 + openMinute;
    const closeTime = closeHour * 60 + closeMinute;
    return currentTime >= openTime && currentTime <= closeTime;
  });
});

// Đảm bảo khi chuyển sang JSON/object sẽ có virtuals
shopSchema.set("toObject", { virtuals: true });
shopSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model(DOCUMENT_NAME, shopSchema);