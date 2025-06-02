"use strict";

const paymentModel = require("../models/payment.model");
const { getInfoData, getSelectData } = require("../utils");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getPaginatedData } = require("../helpers/mongooseHelper");

class PaymentService {
    async getMyPayment(req) {
        const {
            page = 1,
            limit = 10,
            search
        } = req.query;

        const { userId } = req.user;

        const query = {
            user_id: userId,
        };
        const paginateOptions = {
            model: paymentModel,
            query,
            page,
            limit,
            select: getSelectData([
                "_id",
                "orderCode",
                "amount",
                "status",
            ]),
            populate: [
                { path: "package_id", select: "_id name description duration" }
            ],
            search,
            searchFields: ["orderCode"],
        };
        const result = await getPaginatedData(paginateOptions);
        return result;
    }
    async getPaymentStatus(req) {
        const { paymentId } = req.params;
        if (!paymentId) {
            throw new BadRequestError("Payment ID is required");
        }

        const payment = await paymentModel.findById(paymentId);
        if (!payment) {
            throw new NotFoundError("Payment not found");
        }

        return payment;
    }

}

module.exports = new PaymentService();
