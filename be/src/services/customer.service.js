"use strict";

const { createGenericRepository } = require('../repositories/generic-repository');
const shopModel = require('../models/shop.model');
const shopRepository = createGenericRepository(shopModel);

class CustomerService {
    getCoffeeShops = async (query = {}) => {
        try {
            const { page, size, ...filter } = query;

            if (query.categories) {
                filter.categories = { $in: Array.isArray(query.categories) ? query.categories : [query.categories] };
            }

            return await shopRepository.paginate(
                filter,
                {
                    page: page,
                    size: size,
                    populate: [{
                        path: 'shopImages',
                        model: 'ShopImage',
                        match: {},
                        select: 'url caption',
                    },
                    {
                        path: 'categories',
                        model: 'Category',
                        match: {},
                        select: 'name code',
                    }
                    ]
                }
            );
        } catch (error) {
            throw error;
        }
    }
}

module.exports = new CustomerService(); 