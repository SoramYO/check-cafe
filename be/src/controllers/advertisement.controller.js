"use strict";

const { OK } = require("../configs/success.response");
const { ADMIN_MESSAGE, ADVERTISEMENT_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const advertisementService = require("../services/advertisement.service");

class AdvertisementController {
  getAdvertisements = asyncHandler(async (req, res) => {
    const result = await advertisementService.getAdvertisements(req);
    new OK({ message: ADVERTISEMENT_MESSAGE.GET_ADVERTISEMENT_LIST_SUCCESS, data: result }).send(res);
  });
  getAdvertisementById = asyncHandler(async (req, res) => {
    const result = await advertisementService.getAdvertisementById(req);
    new OK({ message: ADVERTISEMENT_MESSAGE.GET_ADVERTISEMENT_BY_ID_SUCCESS, data: result }).send(res);
  });
  createAdvertisement = asyncHandler(async (req, res) => {
    const result = await advertisementService.createAdvertisement(req);
    new OK({ message: ADVERTISEMENT_MESSAGE.CREATE_ADVERTISEMENT_SUCCESS, data: result }).send(res);
  });
  updateAdvertisement = asyncHandler(async (req, res) => {
    const result = await advertisementService.updateAdvertisement(req);
    new OK({ message: ADVERTISEMENT_MESSAGE.UPDATE_ADVERTISEMENT_SUCCESS, data: result }).send(res);
  });
  deleteAdvertisement = asyncHandler(async (req, res) => {
    const result = await advertisementService.deleteAdvertisement(req);
    new OK({ message: ADVERTISEMENT_MESSAGE.DELETE_ADVERTISEMENT_SUCCESS, data: result }).send(res);
  });
  getAdvertisementsMobile = asyncHandler(async (req, res) => {
    const result = await advertisementService.getAdvertisementsMobile(req);
    new OK({ message: ADVERTISEMENT_MESSAGE.GET_ADVERTISEMENT_LIST_SUCCESS, data: result }).send(res);
  });
}

module.exports = new AdvertisementController();
