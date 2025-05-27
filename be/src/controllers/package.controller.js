"use strict";

const { OK } = require("../configs/success.response");
const { PACKAGE_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const packageService = require("../services/package.service.js");

class PackageController {
  createPackage = asyncHandler(async (req, res) => {
    const result = await packageService.createPackage(req);
    new OK({
      message: PACKAGE_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  getPackages = asyncHandler(async (req, res) => {
    const result = await packageService.getPackages(req);
    new OK({
      message: PACKAGE_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getPackageById = asyncHandler(async (req, res) => {
    const result = await packageService.getPackageById(req);
    new OK({
      message: PACKAGE_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  updatePackage = asyncHandler(async (req, res) => {
    const result = await packageService.updatePackage(req);
    new OK({
      message: PACKAGE_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  deletePackage = asyncHandler(async (req, res) => {
    const result = await packageService.deletePackage(req);
    new OK({
      message: PACKAGE_MESSAGE.DELETE_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new PackageController();
