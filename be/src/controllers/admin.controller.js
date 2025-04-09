"use strict";

const adminService = require("../services/admin.service");

class AdminController {
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
      res.status(200).json(await adminService.changePassword(req.user, req.body));
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
      res.status(200).json(await adminService.updateAd(req.params.id, req.body));
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
}

module.exports = new AdminController();