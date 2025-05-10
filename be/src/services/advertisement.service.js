'use strict';

const Advertisement = require('../models/advertisement.model');
const { createGenericRepository } = require('../repositories/generic-repository');
const advertisementRepository = createGenericRepository(Advertisement);

class AdvertisementService {
    getAdvertisements = async (query) => {
        const advertisements = await advertisementRepository.paginate(query, {
            page: query.page,
            limit: query.limit,
        });
        return advertisements;
    }
    getAdvertisementById = async (id) => {
        const advertisement = await advertisementRepository.findById(id);
        return advertisement;
    }
}

module.exports = new AdvertisementService();
