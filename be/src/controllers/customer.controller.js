"use strict";

const customerService = require('../services/customer.service');

class CustomerController {
    getCoffeeShops = async (req, res, next) => {
        try {
            res.status(200).json(await customerService.getCoffeeShops());
        } catch (error) {
            next(error);
        }
    }
}