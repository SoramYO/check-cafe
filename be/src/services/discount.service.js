"use strict";

const { getPaginatedData } = require("../helpers/mongooseHelper");
const discountModel = require("../models/discount.model");
const { getSelectData, getInfoData, removeUndefinedObject } = require("../utils");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const cloudinary = require("cloudinary").v2;

class DiscountService {
    createDiscount = async (req) => {
        try {
            const { title, description, points_required, discount_value, discount_type, code, shop_id, is_vip_only, usage_limit, used_count, start_date, end_date, is_active } = req.body;
            const discount = await discountModel.create({
                title, description, points_required, discount_value, discount_type, code, shop_id, is_vip_only, usage_limit, used_count, start_date, end_date, is_active
            });
            return {
                discount: getInfoData({
                    fields: [
                        "_id",
                        "title",
                        "description",
                        "points_required",
                        "discount_value",
                        "discount_type",
                        "code",
                        "shop_id",
                        "is_vip_only",
                        "usage_limit",
                        "used_count",
                        "start_date",
                        "end_date",
                        "is_active",
                        "createdAt"
                    ],
                    object: discount,
                }),
            };
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to create discount");
        }
    }
    getDiscounts = async (req) => {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = "createdAt",
                sortOrder = "desc",
                search,
            } = req.query;

            const query = {};
            if (search) {
                query.title = { $regex: search, $options: "i" };
            }
            const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

            const paginateOptions = {
                model: discountModel,
                query,
                page,
                limit,
                sort,
                search,
                searchFields: ["title"],
                select: getSelectData([
                    "_id",
                    "title",
                    "description",
                    "points_required",
                    "discount_value",
                    "discount_type",
                    "code",
                    "shop_id",
                    "is_vip_only",
                    "usage_limit",
                    "used_count",
                    "start_date",
                    "end_date",
                    "is_active",
                    "createdAt"
                ]),
            };
            const result = await getPaginatedData(paginateOptions);
            return result;
        } catch (error) {
            throw new BadRequestError(error.message || "Failed to get discounts");
        }
    }
    getDiscountById = async (req) => {
        try {
            const { id } = req.params;
            const discount = await discountModel.findById(id).select(getSelectData([
                "_id",
                "title",
                "description",
                "points_required",
                "discount_value",
                "discount_type",
                "code",
                "shop_id",
                "is_vip_only",
                "usage_limit",
                "used_count",
                "start_date",
                "end_date",
                "is_active",
                "createdAt"
            ]));
            return {
                discount: getInfoData({
                    fields: [
                        "_id",
                        "title",
                        "description",
                        "points_required",
                        "discount_value",
                        "discount_type",
                        "code",
                        "shop_id",
                        "is_vip_only",
                        "usage_limit",
                        "used_count",
                        "start_date",
                        "end_date",
                        "is_active",
                        "createdAt"
                    ],
                    object: discount,
                }),
            };
        } catch (error) {
            throw new NotFoundError("Discount not found");
        }
    }
    updateDiscount = async (req) => {
        try {
            const { id } = req.params;
            const { title, description, points_required, discount_value, discount_type, code, shop_id, is_vip_only, usage_limit, used_count, start_date, end_date, is_active } = req.body;
            const discount = await discountModel.findByIdAndUpdate(id, { title, description, points_required, discount_value, discount_type, code, shop_id, is_vip_only, usage_limit, used_count, start_date, end_date, is_active }, { new: true });
            return {
                discount: getInfoData({
                    fields: [
                        "_id",
                        "title",
                        "description",
                        "points_required",
                        "discount_value",
                        "discount_type",
                        "code",
                        "shop_id",
                        "is_vip_only",
                        "usage_limit",
                        "used_count",
                        "start_date",
                        "end_date",
                        "is_active",
                        "createdAt"
                    ],
                    object: discount,
                }),
            };
        } catch (error) {
            throw new NotFoundError("Discount not found");
        }
    }
    deleteDiscount = async (req) => {
        try {
            const { id } = req.params;
            await discountModel.findByIdAndDelete(id);
            return {
                message: "Discount deleted successfully",
            };
        } catch (error) {
            throw new NotFoundError("Discount not found");
        }
    }
}
module.exports = new DiscountService();
