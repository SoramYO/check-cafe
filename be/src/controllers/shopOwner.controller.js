"use strict";

const { CREATED } = require("../configs/success.response");
const asyncHandler = require("../helpers/asyncHandler");
const shopOwnerService = require("../services/shopOwner.service");

class ShopOwnerController {
  registerShopOwner = asyncHandler(async (req, res, next) => {
    const result = await shopOwnerService.registerShopOwner(req.body);
    new CREATED({
      message: "Shop owner registered successfully",
      data: result,
    }).send(res);
  });
}

module.exports = new ShopOwnerController(); 