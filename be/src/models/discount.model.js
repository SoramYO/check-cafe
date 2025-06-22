"use strict";
const mongoose = require("mongoose");
const { model, Schema, Types } = mongoose;

const DOCUMENT_NAME = "Discount";
const COLLECTION_NAME = "Discounts";

const discountSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    description: { type: String },
    points_required: { type: Number, default: 0 },
    discount_value: { type: Number, required: true },
    discount_type: { 
      type: String, 
      enum: ['percentage', 'fixed_amount'],
      required: true 
    },
    code: { type: String, unique: true, required: true },
    shop_id: { type: Types.ObjectId, ref: "Shop" },
    
    // Thông tin tạo discount
    created_by: { type: Types.ObjectId, refPath: 'creator_type' },
    creator_type: { 
      type: String, 
      enum: ['User', 'Admin'], 
      required: true 
    },
    
    // Cho phép admin tạo discount áp dụng cho nhiều shop
    applicable_shops: [{ type: Types.ObjectId, ref: "Shop" }],
    
    is_vip_only: { type: Boolean, default: false },
    usage_limit: { type: Number }, // Giới hạn tổng số lần sử dụng
    used_count: { type: Number, default: 0 },
    user_usage_limit: { type: Number, default: 1 }, // Giới hạn số lần 1 user có thể sử dụng
    
    // Điều kiện áp dụng
    minimum_order_value: { type: Number, default: 0 },
    maximum_discount_amount: { type: Number }, // Giới hạn số tiền giảm tối đa
    
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true }
  },
  { 
    timestamps: true, 
    collection: COLLECTION_NAME,
    // Đảm bảo index cho tìm kiếm
    indexes: [
      { code: 1 },
      { shop_id: 1 },
      { applicable_shops: 1 },
      { is_active: 1, start_date: 1, end_date: 1 }
    ]
  }
);

// Middleware để validate logic
discountSchema.pre('save', function(next) {
  // Nếu là admin tạo và không có shop_id thì phải có applicable_shops
  if (this.creator_type === 'Admin' && !this.shop_id && (!this.applicable_shops || this.applicable_shops.length === 0)) {
    return next(new Error('Admin discount must specify applicable shops'));
  }
  
  // Nếu là shop owner tạo thì phải có shop_id
  if (this.creator_type === 'User' && !this.shop_id) {
    return next(new Error('Shop owner discount must specify shop_id'));
  }
  
  // Validate date
  if (this.start_date >= this.end_date) {
    return next(new Error('Start date must be before end date'));
  }
  
  next();
});

module.exports = mongoose.model(DOCUMENT_NAME, discountSchema);