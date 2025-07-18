"use strict";

const { getPaginatedData } = require("../helpers/mongooseHelper");
const userPackageModel = require("../models/userPackage.model");
const { getSelectData } = require("../utils");

// Lấy danh sách các gói của user
const getMyPackages = async (req) => {
  const { userId } = req.user;
  const userPackages = await userPackageModel.find({ user_id: userId }).populate("package_id");
  return userPackages;
};

const getUserPackages = async (req) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
  } = req.query;

  const query = {};
  if (search) {
    query.title = { $regex: search, $options: "i" };
  }
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  const paginateOptions = {
    model: userPackageModel,
    query,
    page,
    limit,
    sort,
    search,
    searchFields: ["title"],
    select: getSelectData([
      "_id",
      "user_id",
      "package_id",
      "payment_id",
      "createdAt",
      "updatedAt",
    ]),
    populate: [
      {
        path: "package_id",
        select: getSelectData(["_id", "name", "description", "price", "duration"]),
      },
      {
        path: "user_id",
        select: getSelectData(["_id", "full_name", "email", "phone", "avatar"]),
      },
      {
        path: "payment_id",
        select: getSelectData(["_id", "amount", "method", "status", "createdAt"]),
      },
    ],
  };

  const result = await getPaginatedData(paginateOptions);
  return result;
};

const getUserPackageById = async (req) => {
  const { id } = req.params;
  const userPackage = await userPackageModel.findById(id)
    .populate({
      path: "package_id",
      select: getSelectData(["_id", "title", "description", "price", "duration"]),
    })
    .populate({
      path: "user_id",
      select: getSelectData(["_id", "name", "email", "phone", "avatar"]),
    })
    .populate({
      path: "payment_id",
      select: getSelectData(["_id", "amount", "method", "status", "createdAt"]),
    });

  return userPackage;
};



module.exports = {
  getMyPackages,
  getUserPackages,
  getUserPackageById,
};

