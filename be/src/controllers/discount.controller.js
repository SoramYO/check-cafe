const { OK, CREATED } = require("../configs/success.response");
const { DISCOUNT_MESSAGE } = require("../constants/message");
const discountService = require("../services/discount.service.js");
class DiscountController {
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

}

module.exports = new DiscountController();