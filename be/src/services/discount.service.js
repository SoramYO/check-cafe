"use strict";

const { getPaginatedData } = require("../helpers/mongooseHelper");
const discountModel = require("../models/discount.model");
const discountUsageModel = require("../models/discountUsage.model");
const userModel = require("../models/user.model");
const { getSelectData, getInfoData, removeUndefinedObject } = require("../utils");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../configs/error.response");
const { DISCOUNT_MESSAGE } = require("../constants/message");
const { USER_ROLE } = require("../constants/enum");

class DiscountService {
    
    // Tạo discount - dành cho shop owner và admin
    createDiscount = async (req) => {
        try {
            const { user } = req;
            const { 
                title, description, points_required, discount_value, discount_type, 
                code, shop_id, applicable_shops, is_vip_only, usage_limit, 
                user_usage_limit, minimum_order_value, maximum_discount_amount,
                start_date, end_date, is_active 
            } = req.body;

            // Xác định creator
            const creator_type = user.role === USER_ROLE.ADMIN ? 'Admin' : 'User';
            const created_by = user._id;

            // Validate quyền tạo discount
            if (creator_type === 'User' && user.role !== USER_ROLE.SHOP_OWNER) {
                throw new ForbiddenError("Only shop owners can create discounts");
            }

            // Validate shop_id cho shop owner
            if (creator_type === 'User' && user.role === USER_ROLE.SHOP_OWNER) {
                if (!user.shop_id) {
                    throw new ForbiddenError("Shop owner must have a shop assigned");
                }
                // Nếu không provide shop_id trong body, tự động sử dụng shop_id từ token
                if (!shop_id) {
                    discountData.shop_id = user.shop_id;
                } else if (shop_id.toString() !== user.shop_id.toString()) {
                    throw new ForbiddenError("Shop owner can only create discounts for their own shop");
                }
            }

            const discountData = {
                title, description, points_required, discount_value, discount_type,
                code, shop_id, applicable_shops, is_vip_only, usage_limit,
                user_usage_limit, minimum_order_value, maximum_discount_amount,
                start_date, end_date, is_active,
                created_by, creator_type
            };

            const discount = await discountModel.create(discountData);
            
            return {
                discount: getInfoData({
                    fields: [
                        "_id", "title", "description", "points_required", "discount_value",
                        "discount_type", "code", "shop_id", "applicable_shops", "is_vip_only",
                        "usage_limit", "used_count", "user_usage_limit", "minimum_order_value",
                        "maximum_discount_amount", "start_date", "end_date", "is_active",
                        "created_by", "creator_type", "createdAt"
                    ],
                    object: discount,
                }),
            };
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to create discount");
        }
    }

    // Lấy danh sách discount - dành cho admin và shop owner
    getDiscounts = async (req) => {
        try {
            const { user } = req;
            const {
                page = 1,
                limit = 10,
                sortBy = "createdAt",
                sortOrder = "desc",
                search,
                shop_id,
                is_active,
                creator_type
            } = req.query;

            const query = {};
            
            // Filter theo role
            if (user.role === USER_ROLE.SHOP_OWNER) {
                // Shop owner chỉ thấy discount của shop mình và discount admin áp dụng cho shop mình
                query.$or = [
                    { shop_id: user.shop_id },
                    { applicable_shops: { $in: [user.shop_id] } }
                ];
            } else if (user.role === USER_ROLE.ADMIN) {
                // Admin thấy tất cả
                if (shop_id) query.shop_id = shop_id;
                if (creator_type) query.creator_type = creator_type;
            }

            if (search) {
                query.title = { $regex: search, $options: "i" };
            }
            if (is_active !== undefined) {
                query.is_active = is_active === 'true';
            }

            const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

            const paginateOptions = {
                model: discountModel,
                query,
                page,
                limit,
                sort,
                populate: [
                    { path: 'shop_id', select: 'name' },
                    { path: 'applicable_shops', select: 'name' },
                    { path: 'created_by', select: 'name email' }
                ],
                select: getSelectData([
                    "_id", "title", "description", "points_required", "discount_value",
                    "discount_type", "code", "shop_id", "applicable_shops", "is_vip_only",
                    "usage_limit", "used_count", "user_usage_limit", "minimum_order_value",
                    "maximum_discount_amount", "start_date", "end_date", "is_active",
                    "created_by", "creator_type", "createdAt"
                ]),
            };
            
            return await getPaginatedData(paginateOptions);
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to get discounts");
        }
    }

    // Lấy discount khả dụng cho user - dành cho customer
    getAvailableDiscounts = async (req) => {
        try {
            const { user: tokenUser } = req;
            const { shop_id, order_value = 0 } = req.query;

            if (!shop_id) {
                throw new BadRequestError("Shop ID is required");
            }

            // Fetch full user data từ database
            const user = await userModel.findById(tokenUser._id).select('points vip_status is_active');
            if (!user) {
                throw new NotFoundError("User not found");
            }

            const currentDate = new Date();
            
            // Query discount khả dụng
            const query = {
                is_active: true,
                start_date: { $lte: currentDate },
                end_date: { $gte: currentDate },
                $or: [
                    { shop_id: shop_id },
                    { applicable_shops: { $in: [shop_id] } }
                ]
            };

            // Filter theo VIP nếu cần - sử dụng vip_status từ database
            if (!user.vip_status) {
                query.is_vip_only = { $ne: true };
            }

            // Filter theo minimum order value
            if (order_value > 0) {
                query.minimum_order_value = { $lte: order_value };
            }

            const discounts = await discountModel.find(query)
                .populate('shop_id', 'name')
                .populate('applicable_shops', 'name')
                .select(getSelectData([
                    "_id", "title", "description", "points_required", "discount_value",
                    "discount_type", "code", "is_vip_only", "usage_limit", "used_count",
                    "user_usage_limit", "minimum_order_value", "maximum_discount_amount",
                    "start_date", "end_date"
                ]))
                .sort({ createdAt: -1 });

            // Kiểm tra usage limit cho từng discount
            const availableDiscounts = [];
            
            for (const discount of discounts) {
                // Kiểm tra tổng usage limit
                if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
                    continue;
                }

                // Kiểm tra user usage limit
                if (discount.user_usage_limit) {
                    const userUsageCount = await discountUsageModel.countDocuments({
                        discount_id: discount._id,
                        user_id: tokenUser._id,
                        status: 'applied'
                    });
                    
                    if (userUsageCount >= discount.user_usage_limit) {
                        continue;
                    }
                }

                // Kiểm tra points requirement - sử dụng points từ database
                if (discount.points_required > 0 && user.points < discount.points_required) {
                    continue;
                }

                availableDiscounts.push(discount);
            }

            return {
                discounts: availableDiscounts,
                total: availableDiscounts.length
            };
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to get available discounts");
        }
    }

    // Validate discount trước khi áp dụng
    validateDiscount = async (req) => {
        try {
            const { user: tokenUser } = req;
            const { discount_code, shop_id, order_value } = req.body;

            // Fetch full user data từ database
            const user = await userModel.findById(tokenUser._id).select('points vip_status is_active');
            if (!user) {
                throw new NotFoundError("User not found");
            }

            const discount = await this._getValidDiscount(discount_code, shop_id, tokenUser._id, order_value, user);
            
            // Tính toán số tiền giảm
            const discountAmount = this._calculateDiscountAmount(discount, order_value);

            return {
                valid: true,
                discount: {
                    _id: discount._id,
                    title: discount.title,
                    description: discount.description,
                    discount_type: discount.discount_type,
                    discount_value: discount.discount_value,
                    discount_amount: discountAmount,
                    code: discount.code
                }
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }

    // Áp dụng discount
    applyDiscount = async (req) => {
        try {
            const { user: tokenUser } = req;
            const { 
                discount_code, 
                shop_id, 
                order_value, 
                order_id,
                device_info 
            } = req.body;

            // Fetch full user data từ database
            const user = await userModel.findById(tokenUser._id).select('points vip_status is_active');
            if (!user) {
                throw new NotFoundError("User not found");
            }

            const discount = await this._getValidDiscount(discount_code, shop_id, tokenUser._id, order_value, user);
            
            // Tính toán số tiền giảm
            const discountAmount = this._calculateDiscountAmount(discount, order_value);

            // Tạo record usage
            const discountUsage = await discountUsageModel.create({
                discount_id: discount._id,
                user_id: tokenUser._id,
                shop_id: shop_id,
                order_id: order_id,
                order_value: order_value,
                discount_amount: discountAmount,
                device_info: device_info
            });

            // Cập nhật used_count
            await discountModel.findByIdAndUpdate(discount._id, {
                $inc: { used_count: 1 }
            });

            // Trừ points nếu cần
            if (discount.points_required > 0) {
                await userModel.findByIdAndUpdate(tokenUser._id, {
                    $inc: { points: -discount.points_required }
                });
            }

            return {
                success: true,
                discount_amount: discountAmount,
                usage_id: discountUsage._id,
                remaining_amount: order_value - discountAmount
            };
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to apply discount");
        }
    }

    // Helper methods
    _getValidDiscount = async (code, shop_id, user_id, order_value, userData = null) => {
        const discount = await discountModel.findOne({ 
            code: code,
            is_active: true 
        });

        if (!discount) {
            throw new NotFoundError(DISCOUNT_MESSAGE.DISCOUNT_NOT_FOUND);
        }

        const currentDate = new Date();
        
        // Kiểm tra thời gian
        if (currentDate < discount.start_date || currentDate > discount.end_date) {
            throw new BadRequestError(DISCOUNT_MESSAGE.DISCOUNT_EXPIRED);
        }

        // Kiểm tra shop áp dụng
        const isApplicable = discount.shop_id?.toString() === shop_id || 
                           discount.applicable_shops?.some(id => id.toString() === shop_id);
        
        if (!isApplicable) {
            throw new BadRequestError(DISCOUNT_MESSAGE.DISCOUNT_NOT_APPLICABLE);
        }

        // Kiểm tra VIP requirement nếu có userData
        if (discount.is_vip_only && userData && !userData.vip_status) {
            throw new BadRequestError(DISCOUNT_MESSAGE.VIP_ONLY_DISCOUNT);
        }

        // Kiểm tra points requirement nếu có userData
        if (discount.points_required > 0 && userData && userData.points < discount.points_required) {
            throw new BadRequestError(DISCOUNT_MESSAGE.INSUFFICIENT_POINTS);
        }

        // Kiểm tra usage limit
        if (discount.usage_limit && discount.used_count >= discount.usage_limit) {
            throw new BadRequestError(DISCOUNT_MESSAGE.DISCOUNT_USAGE_LIMIT_EXCEEDED);
        }

        // Kiểm tra user usage limit
        if (discount.user_usage_limit) {
            const userUsageCount = await discountUsageModel.countDocuments({
                discount_id: discount._id,
                user_id: user_id,
                status: 'applied'
            });
            
            if (userUsageCount >= discount.user_usage_limit) {
                throw new BadRequestError(DISCOUNT_MESSAGE.USER_USAGE_LIMIT_EXCEEDED);
            }
        }

        // Kiểm tra minimum order value
        if (discount.minimum_order_value > 0 && order_value < discount.minimum_order_value) {
            throw new BadRequestError(DISCOUNT_MESSAGE.MINIMUM_ORDER_VALUE_NOT_MET);
        }

        return discount;
    }

    _calculateDiscountAmount = (discount, order_value) => {
        let discountAmount = 0;
        
        if (discount.discount_type === 'percentage') {
            discountAmount = (order_value * discount.discount_value) / 100;
        } else if (discount.discount_type === 'fixed_amount') {
            discountAmount = discount.discount_value;
        }

        // Áp dụng maximum discount amount nếu có
        if (discount.maximum_discount_amount && discountAmount > discount.maximum_discount_amount) {
            discountAmount = discount.maximum_discount_amount;
        }

        // Không được vượt quá order value
        if (discountAmount > order_value) {
            discountAmount = order_value;
        }

        return Math.round(discountAmount);
    }

    // Các method cũ được cập nhật
    getDiscountById = async (req) => {
        try {
            const { id } = req.params;
            const { user } = req;
            
            const discount = await discountModel.findById(id)
                .populate('shop_id', 'name')
                .populate('applicable_shops', 'name')
                .populate('created_by', 'name email')
                .select(getSelectData([
                    "_id", "title", "description", "points_required", "discount_value",
                    "discount_type", "code", "shop_id", "applicable_shops", "is_vip_only",
                    "usage_limit", "used_count", "user_usage_limit", "minimum_order_value",
                    "maximum_discount_amount", "start_date", "end_date", "is_active",
                    "created_by", "creator_type", "createdAt"
                ]));

            if (!discount) {
                throw new NotFoundError(DISCOUNT_MESSAGE.DISCOUNT_NOT_FOUND);
            }

            // Kiểm tra quyền xem
            if (user.role === USER_ROLE.SHOP_OWNER) {
                const canView = discount.shop_id?._id?.toString() === user.shop_id?.toString() ||
                               discount.applicable_shops?.some(shop => shop._id.toString() === user.shop_id?.toString());
                
                if (!canView) {
                    throw new ForbiddenError("You don't have permission to view this discount");
                }
            }

            return { discount };
        } catch (error) {
            throw new NotFoundError(error.message || "Discount not found");
        }
    }

    updateDiscount = async (req) => {
        try {
            const { id } = req.params;
            const { user } = req;
            const updateData = req.body;

            const discount = await discountModel.findById(id);
            if (!discount) {
                throw new NotFoundError(DISCOUNT_MESSAGE.DISCOUNT_NOT_FOUND);
            }

            // Kiểm tra quyền sửa
            if (user.role === USER_ROLE.SHOP_OWNER) {
                if (discount.created_by.toString() !== user._id.toString()) {
                    throw new ForbiddenError("You can only edit your own discounts");
                }
            }

            const updatedDiscount = await discountModel.findByIdAndUpdate(
                id, 
                removeUndefinedObject(updateData), 
                { new: true }
            ).populate('shop_id', 'name')
             .populate('applicable_shops', 'name');

            return {
                discount: getInfoData({
                    fields: [
                        "_id", "title", "description", "points_required", "discount_value",
                        "discount_type", "code", "shop_id", "applicable_shops", "is_vip_only",
                        "usage_limit", "used_count", "user_usage_limit", "minimum_order_value",
                        "maximum_discount_amount", "start_date", "end_date", "is_active",
                        "created_by", "creator_type", "createdAt", "updatedAt"
                    ],
                    object: updatedDiscount,
                }),
            };
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to update discount");
        }
    }

    deleteDiscount = async (req) => {
        try {
            const { id } = req.params;
            const { user } = req;

            const discount = await discountModel.findById(id);
            if (!discount) {
                throw new NotFoundError(DISCOUNT_MESSAGE.DISCOUNT_NOT_FOUND);
            }

            // Kiểm tra quyền xóa
            if (user.role === USER_ROLE.SHOP_OWNER) {
                if (discount.created_by.toString() !== user._id.toString()) {
                    throw new ForbiddenError("You can only delete your own discounts");
                }
            }

            await discountModel.findByIdAndDelete(id);
            
            return {
                message: "Discount deleted successfully",
            };
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to delete discount");
        }
    }

    // Lấy lịch sử sử dụng discount
    getDiscountUsageHistory = async (req) => {
        try {
            const { user } = req;
            const {
                page = 1,
                limit = 10,
                shop_id,
                discount_id
            } = req.query;

            const query = {};
            
            if (user.role === USER_ROLE.CUSTOMER) {
                query.user_id = user._id;
            } else if (user.role === USER_ROLE.SHOP_OWNER) {
                query.shop_id = user.shop_id;
            }

            if (shop_id) query.shop_id = shop_id;
            if (discount_id) query.discount_id = discount_id;

            const paginateOptions = {
                model: discountUsageModel,
                query,
                page,
                limit,
                sort: { used_at: -1 },
                populate: [
                    { path: 'discount_id', select: 'title code discount_type discount_value' },
                    { path: 'user_id', select: 'full_name email' },
                    { path: 'shop_id', select: 'name' }
                ]
            };

            return await getPaginatedData(paginateOptions);
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to get usage history");
        }
    }
}

module.exports = new DiscountService();
