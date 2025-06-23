"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "DiscountUsage";
const COLLECTION_NAME = "DiscountUsages";

const discountUsageSchema = new mongoose.Schema(
  {
    discount_id: { 
      type: Types.ObjectId, 
      ref: "Discount", 
      required: true 
    },
    user_id: { 
      type: Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    shop_id: { 
      type: Types.ObjectId, 
      ref: "Shop", 
      required: true 
    },
    
    // Thông tin đơn hàng/giao dịch
    order_id: { type: String }, // ID đơn hàng nếu có
    order_value: { type: Number, required: true }, // Giá trị đơn hàng
    discount_amount: { type: Number, required: true }, // Số tiền được giảm
    
    // Thông tin sử dụng
    used_at: { type: Date, default: Date.now },
    status: { 
      type: String, 
      enum: ['applied', 'refunded'], 
      default: 'applied' 
    },
    
    // Metadata
    device_info: { type: String }, // Thông tin thiết bị sử dụng
    notes: { type: String } // Ghi chú thêm
  },
  { 
    timestamps: true, 
    collection: COLLECTION_NAME,
    indexes: [
      { discount_id: 1, user_id: 1 },
      { user_id: 1, used_at: -1 },
      { shop_id: 1, used_at: -1 },
      { discount_id: 1, used_at: -1 }
    ]
  }
);

// Compound index để đảm bảo performance khi query
discountUsageSchema.index({ discount_id: 1, user_id: 1, status: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, discountUsageSchema); 