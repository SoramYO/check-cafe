"use strict";

const { OK } = require("../configs/success.response");
const { ADMIN_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const adminService = require("../services/admin.service");
const userService = require("../services/user.service");

class AdminController {
  // Manage Users
  getUsers = asyncHandler(async (req, res, next) => {
    const result = await userService.getUsers(req.query);
    new OK({ message: ADMIN_MESSAGE.GET_USER_LIST_SUCCESS, data: result }).send(
      res
    );
  });
  manageUserAccount = asyncHandler(async (req, res, next) => {
    const result = await userService.manageUserAccount(req.body);
    new OK({
      message: ADMIN_MESSAGE.MANAGE_USER_ACCOUNT_SUCCESS,
      data: result,
    }).send(res);
  });
  // Auth
  login = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.login(req.body));
    } catch (error) {
      next(error);
    }
  };

  logout = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.logout(req.user));
    } catch (error) {
      next(error);
    }
  };

  changePassword = async (req, res, next) => {
    try {
      res
        .status(200)
        .json(await adminService.changePassword(req.user, req.body));
    } catch (error) {
      next(error);
    }
  };

  // Ads Management
  getAds = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getAds(req.query));
    } catch (error) {
      next(error);
    }
  };

  createAd = async (req, res, next) => {
    try {
      res.status(201).json(await adminService.createAd(req.body));
    } catch (error) {
      next(error);
    }
  };

  updateAd = async (req, res, next) => {
    try {
      res
        .status(200)
        .json(await adminService.updateAd(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  };

  deleteAd = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.deleteAd(req.params.id));
    } catch (error) {
      next(error);
    }
  };

  // Statistics
  getUserStats = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getUserStats());
    } catch (error) {
      next(error);
    }
  };

  getBookingStats = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getBookingStats());
    } catch (error) {
      next(error);
    }
  };

  getShopStats = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getShopStats());
    } catch (error) {
      next(error);
    }
  };

  getOverviewStats = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getOverviewStats());
    } catch (error) {
      next(error);
    }
  };

  // Account Management
  getAccounts = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getAccounts(req.query));
    } catch (error) {
      next(error);
    }
  };

  blockAccount = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.blockAccount(req.params.id));
    } catch (error) {
      next(error);
    }
  };

  unblockAccount = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.unblockAccount(req.params.id));
    } catch (error) {
      next(error);
    }
  };

  // Dashboard Stats
  getDashboardStats = async (req, res, next) => {
    try {
      const result = await adminService.getDashboardStats();
      new OK({ message: "Get dashboard stats successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Create new user
  createUser = async (req, res, next) => {
    try {
      res.status(201).json(await adminService.createUser(req.body));
    } catch (error) {
      next(error);
    }
  };

  // Get shop owners without shops
  getShopOwnersWithoutShops = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getShopOwnersWithoutShops(req.query));
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AdminController();
