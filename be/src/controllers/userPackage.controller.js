"use strict";

const { OK } = require("../configs/success.response");
const { USER_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const userPackageService = require("../services/userPackage.service.js");

class UserPackageController {
  getUserPackages = asyncHandler(async (req, res) => {
    const result = await userPackageService.getUserPackages(req);
    new OK({
      message: USER_MESSAGE.USER_GET_USER_PACKAGES_SUCCESS,
      data: result,
    }).send(res);
  });
  getUserPackageById = asyncHandler(async (req, res) => {
    const result = await userPackageService.getUserPackageById(req);
    new OK({
      message: USER_MESSAGE.USER_GET_USER_PACKAGE_BY_ID_SUCCESS,
      data: result,
    }).send(res);
  });
  getMyPackages = asyncHandler(async (req, res) => {
    const result = await userPackageService.getMyPackages(req);
    new OK({
      message: USER_MESSAGE.USER_GET_MY_PACKAGES_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new UserPackageController();
