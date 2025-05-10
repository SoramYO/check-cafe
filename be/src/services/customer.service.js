"use strict";

const shopModel = require('../models/shop.model');

class CustomerService {
    getCoffeeShops = async () => {
        try {
            const coffeeShops = await shopModel.find({});
            return coffeeShops;
        } catch (error) {
            throw error;
        }
    }
}