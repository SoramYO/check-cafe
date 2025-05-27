"use strict";

const { OK, CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const shopAmenityService = require("../services/shopAmenity.service");

class ShopAmenityController {
  getAllAmenities = asyncHandler(async (req, res) => {
    const result = await shopAmenityService.getAllAmenities();
    new OK({
      message: "Get all amenities successfully",
      data: result,
    }).send(res);
  });

  createAmenity = asyncHandler(async (req, res) => {
    const result = await shopAmenityService.createAmenity(req);
    new CREATED({
      message: "Create amenity successfully",
      data: result,
    }).send(res);
  });

  updateAmenity = asyncHandler(async (req, res) => {
    const result = await shopAmenityService.updateAmenity(req);
    new OK({
      message: "Update amenity successfully",
      data: result,
    }).send(res);
  });

  deleteAmenity = asyncHandler(async (req, res) => {
    const result = await shopAmenityService.deleteAmenity(req);
    new OK({
      message: "Delete amenity successfully",
      data: result,
    }).send(res);
  });
}

module.exports = new ShopAmenityController(); 