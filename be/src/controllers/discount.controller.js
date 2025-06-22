const { OK, CREATED } = require("../configs/success.response");
const { DISCOUNT_MESSAGE } = require("../constants/message");
const discountService = require("../services/discount.service.js");

class DiscountController {
    // Tạo discount - dành cho shop owner và admin
    createDiscount = async (req, res, next) => {
        try {
            const result = await discountService.createDiscount(req);
            new CREATED({
                message: DISCOUNT_MESSAGE.CREATE_DISCOUNT_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Lấy danh sách discount - dành cho admin và shop owner
    getDiscounts = async (req, res, next) => {
        try {
            const result = await discountService.getDiscounts(req);
            new OK({
                message: DISCOUNT_MESSAGE.GET_DISCOUNTS_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Lấy discount khả dụng cho user - dành cho customer
    getAvailableDiscounts = async (req, res, next) => {
        try {
            const result = await discountService.getAvailableDiscounts(req);
            new OK({
                message: DISCOUNT_MESSAGE.GET_AVAILABLE_DISCOUNTS_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Validate discount trước khi áp dụng
    validateDiscount = async (req, res, next) => {
        try {
            const result = await discountService.validateDiscount(req);
            new OK({
                message: DISCOUNT_MESSAGE.VALIDATE_DISCOUNT_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Áp dụng discount
    applyDiscount = async (req, res, next) => {
        try {
            const result = await discountService.applyDiscount(req);
            new OK({
                message: DISCOUNT_MESSAGE.APPLY_DISCOUNT_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Lấy chi tiết discount
    getDiscountById = async (req, res, next) => {
        try {
            const result = await discountService.getDiscountById(req);
            new OK({
                message: DISCOUNT_MESSAGE.GET_DISCOUNT_BY_ID_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Cập nhật discount
    updateDiscount = async (req, res, next) => {
        try {
            const result = await discountService.updateDiscount(req);
            new OK({
                message: DISCOUNT_MESSAGE.UPDATE_DISCOUNT_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Xóa discount
    deleteDiscount = async (req, res, next) => {
        try {
            const result = await discountService.deleteDiscount(req);
            new OK({
                message: DISCOUNT_MESSAGE.DELETE_DISCOUNT_SUCCESS,
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }

    // Lấy lịch sử sử dụng discount
    getDiscountUsageHistory = async (req, res, next) => {
        try {
            const result = await discountService.getDiscountUsageHistory(req);
            new OK({
                message: "Get discount usage history successfully",
                data: result,
            }).send(res);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new DiscountController();