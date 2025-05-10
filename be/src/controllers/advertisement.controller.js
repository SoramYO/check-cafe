'use strict';

const advertisementService = require('../services/advertisement.service');
const { OK } = require('../configs/success.response');
const { ADVERTISEMENT_MESSAGE } = require('../constants/message');
const asyncHandler = require('../helpers/asyncHandler');


class AdvertisementController {
    getAdvertisements = asyncHandler(async (req, res, next) => {
        const result = await advertisementService.getAdvertisements(req.query);
        new OK({ message: ADVERTISEMENT_MESSAGE.GET_ADVERTISEMENT_LIST_SUCCESS, data: result }).send(res);
    });
    getAdvertisementById = asyncHandler(async (req, res, next) => {
        const result = await advertisementService.getAdvertisementById(req.params.id);
        new OK({ message: ADVERTISEMENT_MESSAGE.GET_ADVERTISEMENT_BY_ID_SUCCESS, data: result }).send(res);
    });
}

module.exports = new AdvertisementController(); 
