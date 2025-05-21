"use strict";

const userPackageModel = require("../models/userPackage.model");

// Lấy danh sách các gói của user
const getUserPackages = async (req) => {
  const { userId } = req.user;
  const userPackages = await userPackageModel.find({ user_id: userId }).populate("package_id");
  return userPackages;
};

module.exports = {
  getUserPackages,
};

