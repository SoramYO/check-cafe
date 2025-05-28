"use strict";

const packageModel = require("../models/package.model");
const { getInfoData, getSelectData } = require("../utils");
const { BadRequestError, NotFoundError } = require("../configs/error.response");

class PackageService {
  createPackage = async (req) => {
    const { icon, name, description, price, duration } = req.body;
    const createdPackage = await packageModel.create({ icon, name, description, price, duration });
    return {
      package: getInfoData({
        fields: ["_id", "icon", "name", "description", "price", "duration", "createdAt", "updatedAt"],
        object: createdPackage,
      }),
    };
  };

  getPackages = async (req) => {
    const packages = await packageModel.find().select(
      getSelectData(["_id", "icon", "name", "description", "price", "duration", "createdAt", "updatedAt"])
    );
    return {
      packages: packages.map(pkg => getInfoData({
        fields: ["_id", "icon", "name", "description", "price", "duration", "createdAt", "updatedAt"],
        object: pkg,
      })),
    };
  };

  getPackageById = async (req) => {
    const { packageId } = req.params;
    const foundPackage = await packageModel.findById(packageId).select(
      getSelectData(["_id", "icon", "name", "description", "price", "duration", "createdAt", "updatedAt"])
    );
    if (!foundPackage) {
      throw new NotFoundError("Package not found");
    }
    return {
      package: getInfoData({
        fields: ["_id", "icon", "name", "description", "price", "duration", "createdAt", "updatedAt"],
        object: foundPackage,
      }),
    };
  };

  updatePackage = async (req) => {
    const { packageId } = req.params;
    const { name, description, price, duration } = req.body;
    const updatedPackage = await packageModel.findByIdAndUpdate(
      packageId,
      { name, description, price, duration },
      { new: true, runValidators: true }
    ).select(
      getSelectData(["_id", "icon", "name", "description", "price", "duration", "createdAt", "updatedAt"])
    );
    if (!updatedPackage) {
      throw new NotFoundError("Package not found");
    }
    return {
      package: getInfoData({
        fields: ["_id", "icon", "name", "description", "price", "duration", "createdAt", "updatedAt"],
        object: updatedPackage,
      }),
    };
  };

  deletePackage = async (req) => {
    const { packageId } = req.params;
    const deletedPackage = await packageModel.findByIdAndDelete(packageId);
    if (!deletedPackage) {
      throw new NotFoundError("Package not found");
    }
    return { message: "Package deleted successfully" };
  };
}

module.exports = new PackageService();
