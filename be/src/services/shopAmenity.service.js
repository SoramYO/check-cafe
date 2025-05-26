"use strict";

const { BadRequestError, NotFoundError } = require("../configs/error.response");
const shopAmenityModel = require("../models/shopAmenity.model");
const { getInfoData, getSelectData } = require("../utils");

const getAllAmenities = async () => {
  try {
    const amenities = await shopAmenityModel
      .find({})
      .select(getSelectData(["_id", "icon", "label"]))
      .sort({ label: 1 });

    return {
      amenities: amenities.map((amenity) =>
        getInfoData({
          fields: ["_id", "icon", "label"],
          object: amenity,
        })
      ),
      total: amenities.length,
    };
  } catch (error) {
    throw new BadRequestError(error.message || "Failed to get amenities");
  }
};

const createAmenity = async (req) => {
  try {
    const { icon, label } = req.body;

    if (!icon || !label) {
      throw new BadRequestError("Icon and label are required");
    }

    const amenity = await shopAmenityModel.create({
      icon,
      label,
    });

    return {
      amenity: getInfoData({
        fields: ["_id", "icon", "label"],
        object: amenity,
      }),
    };
  } catch (error) {
    throw new BadRequestError(error.message || "Failed to create amenity");
  }
};

const updateAmenity = async (req) => {
  try {
    const { amenityId } = req.params;
    const { icon, label } = req.body;

    const amenity = await shopAmenityModel.findById(amenityId);
    if (!amenity) {
      throw new NotFoundError("Amenity not found");
    }

    const updatedAmenity = await shopAmenityModel
      .findByIdAndUpdate(
        amenityId,
        { icon, label },
        { new: true, runValidators: true }
      )
      .select(getSelectData(["_id", "icon", "label"]));

    return {
      amenity: getInfoData({
        fields: ["_id", "icon", "label"],
        object: updatedAmenity,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError
      ? error
      : new BadRequestError(error.message || "Failed to update amenity");
  }
};

const deleteAmenity = async (req) => {
  try {
    const { amenityId } = req.params;

    const amenity = await shopAmenityModel.findByIdAndDelete(amenityId);
    if (!amenity) {
      throw new NotFoundError("Amenity not found");
    }

    return {
      message: "Amenity deleted successfully",
      deletedAmenity: getInfoData({
        fields: ["_id", "label"],
        object: amenity,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError
      ? error
      : new BadRequestError(error.message || "Failed to delete amenity");
  }
};

module.exports = {
  getAllAmenities,
  createAmenity,
  updateAmenity,
  deleteAmenity,
};
 