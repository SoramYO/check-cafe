"use strict";

const customerService = require('../services/customer.service');
const { OK } = require('../configs/success.response');
const { CUSTOMER_MESSAGE } = require('../constants/message');
const asyncHandler = require('../helpers/asyncHandler');

class CustomerController {
    getCoffeeShops = asyncHandler(async (req, res, next) => {
        const result = await customerService.getCoffeeShops(req.query);
        new OK({ message: CUSTOMER_MESSAGE.GET_COFFEE_SHOPS_SUCCESS, data: result }).send(res);
    });
}

module.exports = new CustomerController();