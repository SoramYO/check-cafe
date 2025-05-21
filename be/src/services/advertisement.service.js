"use strict";

const { getPaginatedData } = require("../helpers/mongooseHelper");
const advertisementModel = require("../models/advertisement.model");
const { getSelectData, getInfoData, removeUndefinedObject } = require("../utils");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const cloudinary = require("cloudinary").v2;

class AdvertisementService {
  getAdvertisements = async (req) => {
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      search,
    } = req.query;

    const query = {
      status: "Active",
    };

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const paginateOptions = {
      model: advertisementModel,
      query,
      page,
      limit,
      sort,
      search,
      searchFields: ["title"],
      select: getSelectData([
        "_id",
        "title",
        "subtitle",
        "description",
        "features",
        "image",
        "redirect_url",
        "type",
        "shop_id",
        "start_date",
        "end_date",
        "createdAt",
        "updatedAt",
      ]),
    };

    const advertisements = await getPaginatedData(paginateOptions);

    return advertisements
  };

  getAdvertisementById = async (req) => {
    const { advertisementId } = req.params;
    const advertisement = await advertisementModel.findById(advertisementId)
      .populate([
        { path: "shop_id", select: "_id name" },
      ])
      .select(
        getSelectData([
         "_id",
        "title",
        "subtitle",
        "description",
        "features",
        "image",
        "redirect_url",
        "type",
        "shop_id",
        "start_date",
        "end_date",
        "createdAt",
        "updatedAt",
        ])
      );
    if (!advertisement) {
      throw new NotFoundError("Advertisement not found");
    }
    return {
      advertisement: getInfoData({
        fields: [
          "_id",
        "title",
        "subtitle",
        "description",
        "features",
        "image",
        "redirect_url",
        "type",
        "shop_id",
        "start_date",
        "end_date",
        "createdAt",
        "updatedAt",
        ],
        object: advertisement,
      }),
    };
  };

  createAdvertisement = async (req) => {
    try {
      const { title, subtitle, description, features, redirect_url, type, shop_id, start_date, end_date } = req.body;
      const file = req.file;
      if (!title || !subtitle) {
        throw new BadRequestError("Title and subtitle are required");
      }
      let image = null;
      let imagePublicId = null;
      if (file) {
        image = file.path;
        imagePublicId = file.filename || file.public_id;
      }
      let parsedfeatures = features;
      if (typeof features === "string") {
        try {
          parsedfeatures = JSON.parse(features);
        } catch (e) {
          throw new BadRequestError("features must be a valid JSON array");
        }
      }
      const advertisement = await advertisementModel.create({
        title,
        subtitle,
        description,
        features: parsedfeatures,
        image,
        imagePublicId,
        redirect_url,
        type,
        shop_id,
        start_date,
        end_date,
      });
      return {
        advertisement: getInfoData({
          fields: [
            "_id",
            "title",
            "subtitle",
            "description",
            "features",
            "image",
            "redirect_url",
            "type",
            "shop_id",
            "start_date",
            "end_date",
            "createdAt",
            "updatedAt",
          ],
          object: advertisement,
        }),
      };
    } catch (error) {
      if (req.file && req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      throw new BadRequestError(error.message || "Failed to create advertisement");
    }
  };

  updateAdvertisement = async (req) => {
    try {
      const { advertisementId } = req.params;
      const { title, subtitle, description, features, redirect_url, type, shop_id, start_date, end_date } = req.body;
      const file = req.file;
      const advertisement = await advertisementModel.findById(advertisementId);
      if (!advertisement) {
        throw new NotFoundError("Advertisement not found");
      }
      let parsedFeatures = features;
      if (typeof features === "string") {
        try {
          parsedFeatures = JSON.parse(features);
        } catch (e) {
          throw new BadRequestError("features must be a valid JSON array");
        }
      }
      const updateData = removeUndefinedObject({
        title,
        subtitle,
        description,
        features: parsedFeatures,
        redirect_url,
        type,
        shop_id,
        start_date,
        end_date,
      });
      if (file) {
        if (advertisement.imagePublicId) {
          await cloudinary.uploader.destroy(advertisement.imagePublicId);
        }
        updateData.image = file.path;
        updateData.imagePublicId = file.filename || file.public_id;
      }
      const updatedAdvertisement = await advertisementModel.findByIdAndUpdate(
        advertisementId,
        updateData,
        { new: true, runValidators: true }
      ).select(
        getSelectData([
          "_id",
          "title",
          "subtitle",
          "description",
          "features",
          "image",
          "redirect_url",
          "type",
          "shop_id",
          "start_date",
          "end_date",
          "createdAt",
          "updatedAt",
        ])
      );
      return {
        advertisement: getInfoData({
          fields: [
            "_id",
            "title",
            "subtitle",
            "description",
            "features",
            "image",
            "redirect_url",
            "type",
            "shop_id",
            "start_date",
            "end_date",
            "createdAt",
            "updatedAt",
          ],
          object: updatedAdvertisement,
        }),
      };
    } catch (error) {
      if (req.file && req.file.filename) {
        await cloudinary.uploader.destroy(req.file.filename);
      }
      throw new BadRequestError(error.message || "Failed to update advertisement");
    }
  };

  deleteAdvertisement = async (req) => {
    try {
      const { advertisementId } = req.params;
      const advertisement = await advertisementModel.findById(advertisementId);
      if (!advertisement) {
        throw new NotFoundError("Advertisement not found");
      }
      if (advertisement.imagePublicId) {
        await cloudinary.uploader.destroy(advertisement.imagePublicId);
      }
      await advertisementModel.findByIdAndDelete(advertisementId);
      return { message: "Advertisement deleted successfully" };
    } catch (error) {
      throw new BadRequestError(error.message || "Failed to delete advertisement");
    }
  };
}

module.exports = new AdvertisementService();
