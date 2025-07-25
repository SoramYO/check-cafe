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


  changePassword = async (req, res, next) => {
    try {
      res
        .status(200)
        .json(await adminService.changePassword(req));
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

  // Enhanced booking statistics by time period
  getBookingStatsByPeriod = async (req, res, next) => {
    try {
      const { period, shopId, startDate, endDate } = req.query;
      res.status(200).json(await adminService.getBookingStatsByPeriod({ 
        period, 
        shopId, 
        startDate, 
        endDate 
      }));
    } catch (error) {
      next(error);
    }
  };

  // Get booking statistics for all shops
  getShopBookingStats = async (req, res, next) => {
    try {
      const { period, startDate, endDate, limit } = req.query;
      res.status(200).json(await adminService.getShopBookingStats({ 
        period, 
        startDate, 
        endDate, 
        limit: limit ? parseInt(limit) : 10 
      }));
    } catch (error) {
      next(error);
    }
  };

  // Get detailed booking timeline for a specific shop
  getShopBookingTimeline = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { period, startDate, endDate } = req.query;
      res.status(200).json(await adminService.getShopBookingTimeline({ 
        shopId, 
        period, 
        startDate, 
        endDate 
      }));
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

  getUserById = async (req, res, next) => {
    try {
      res.status(200).json(await adminService.getUserById(req.params.id));
    } catch (error) {
      next(error);
    }
  };

  updateUserById = async (req, res, next) => {
    try {
      const result = await adminService.updateUserById(req.params.id, req.body);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  deleteUserById = async (req, res, next) => {
    try {
      const result = await adminService.deleteUserById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // ===== SHOP DETAILED INFORMATION APIs =====
  
  // Get shop reviews
  getShopReviews = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
      
      const result = await adminService.getShopReviews({
        shopId,
        page: parseInt(page),
        limit: parseInt(limit),
        rating: rating ? parseInt(rating) : null,
        sortBy,
        sortOrder
      });
      
      new OK({ 
        message: "Get shop reviews successfully", 
        data: result 
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get shop statistics
  getShopDetailedStats = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { period = 'month', startDate, endDate } = req.query;
      
      const result = await adminService.getShopDetailedStats({
        shopId,
        period,
        startDate,
        endDate
      });
      
      new OK({ 
        message: "Get shop detailed statistics successfully", 
        data: result 
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get shop verification documents
  getShopVerifications = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { status, page = 1, limit = 10 } = req.query;
      
      const result = await adminService.getShopVerifications({
        shopId,
        status,
        page: parseInt(page),
        limit: parseInt(limit)
      });
      
      new OK({ 
        message: "Get shop verification documents successfully", 
        data: result 
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get shop activity history
  getShopActivityHistory = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { action, page = 1, limit = 20, startDate, endDate } = req.query;
      
      const result = await adminService.getShopActivityHistory({
        shopId,
        action,
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate
      });
      
      new OK({ 
        message: "Get shop activity history successfully", 
        data: result 
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get shop owner information
  getShopOwnerInfo = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      
      const result = await adminService.getShopOwnerInfo(shopId);
      
      new OK({ 
        message: "Get shop owner information successfully", 
        data: result 
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get shop checkins
  getShopCheckins = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { page = 1, limit = 20, startDate, endDate } = req.query;
      
      const result = await adminService.getShopCheckins({
        shopId,
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate
      });
      
      new OK({ 
        message: "Get shop checkins successfully", 
        data: result 
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get shop reservations
  getShopReservations = async (req, res, next) => {
    try {
      const { shopId } = req.params;
      const { status, page = 1, limit = 20, startDate, endDate } = req.query;
      
      const result = await adminService.getShopReservations({
        shopId,
        status,
        page: parseInt(page),
        limit: parseInt(limit),
        startDate,
        endDate
      });
      
      new OK({ 
        message: "Get shop reservations successfully", 
        data: result 
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Reports
  getUserReports = async (req, res, next) => {
    try {
      const result = await adminService.getUserReports(req.query);
      new OK({ message: "Get user reports successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  getShopReports = async (req, res, next) => {
    try {
      const result = await adminService.getShopReports(req.query);
      new OK({ message: "Get shop reports successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  getOrderReports = async (req, res, next) => {
    try {
      const result = await adminService.getOrderReports(req.query);
      new OK({ message: "Get order reports successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  getRevenueReports = async (req, res, next) => {
    try {
      const result = await adminService.getRevenueReports(req.query);
      new OK({ message: "Get revenue reports successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // ===== NOTIFICATION CONTROLLERS =====
  
  // Get all notifications
  getNotifications = async (req, res, next) => {
    try {
      const result = await adminService.getNotifications(req.query);
      new OK({ message: "Get notifications successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get notification by ID
  getNotificationById = async (req, res, next) => {
    try {
      const result = await adminService.getNotificationById(req.params.id);
      new OK({ message: "Get notification successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Create notification
  createNotification = async (req, res, next) => {
    try {
      const result = await adminService.createNotification(req.body);
      new OK({ message: "Create notification successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Update notification
  updateNotification = async (req, res, next) => {
    try {
      const result = await adminService.updateNotification(req.params.id, req.body);
      new OK({ message: "Update notification successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Mark notification as read
  markNotificationAsRead = async (req, res, next) => {
    try {
      const result = await adminService.markNotificationAsRead(req.params.id);
      new OK({ message: "Mark notification as read successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Mark all notifications as read
  markAllNotificationsAsRead = async (req, res, next) => {
    try {
      const result = await adminService.markAllNotificationsAsRead(req.query);
      new OK({ message: "Mark all notifications as read successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Delete notification
  deleteNotification = async (req, res, next) => {
    try {
      const result = await adminService.deleteNotification(req.params.id);
      new OK({ message: "Delete notification successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Delete multiple notifications
  deleteMultipleNotifications = async (req, res, next) => {
    try {
      const result = await adminService.deleteMultipleNotifications(req.body.ids);
      new OK({ message: "Delete multiple notifications successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Get notification statistics
  getNotificationStats = async (req, res, next) => {
    try {
      const result = await adminService.getNotificationStats();
      new OK({ message: "Get notification statistics successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Create system notification
  createSystemNotification = async (req, res, next) => {
    try {
      const result = await adminService.createSystemNotification(req.body);
      new OK({ message: "Create system notification successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Create user notification
  createUserNotification = async (req, res, next) => {
    try {
      const { userId, ...notificationData } = req.body;
      const result = await adminService.createUserNotification(userId, notificationData);
      new OK({ message: "Create user notification successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Create shop notification
  createShopNotification = async (req, res, next) => {
    try {
      const { shopId, ...notificationData } = req.body;
      const result = await adminService.createShopNotification(shopId, notificationData);
      new OK({ message: "Create shop notification successfully", data: result }).send(res);
    } catch (error) {
      next(error);
    }
  };

  // Delete shop and all related data
  deleteShopById = async (req, res, next) => {
    try {
      console.log(`[AdminController] Delete shop request received for shopId: ${req.params.id}`);
      const result = await adminService.deleteShopById(req.params.id);
      
      if (result.code === "200") {
        new OK({ 
          message: "Shop deleted successfully", 
          data: result.metadata 
        }).send(res);
      } else {
        res.status(parseInt(result.code)).json(result);
      }
    } catch (error) {
      console.error(`[AdminController] Error in deleteShopById:`, error);
      next(error);
    }
  };

  // ===== POST (BLOG/NEWS) CONTROLLERS =====
  createPost = async (req, res, next) => {
    try {
      const result = await adminService.createPost(req.body);
      if (result.code === "201") {
        new OK({ message: result.message, data: result.metadata }).send(res);
      } else {
        res.status(Number(result.code) || 500).json(result);
      }
    } catch (error) {
      next(error);
    }
  };

  getPosts = async (req, res, next) => {
    try {
      const result = await adminService.getPosts(req.query);
      if (result.code === "200") {
        new OK({ message: "Get posts successfully", data: result.metadata }).send(res);
      } else {
        res.status(Number(result.code) || 500).json(result);
      }
    } catch (error) {
      next(error);
    }
  };

  getPostById = async (req, res, next) => {
    try {
      const result = await adminService.getPostById(req.params.id);
      if (result.code === "200") {
        new OK({ message: "Get post successfully", data: result.metadata }).send(res);
      } else {
        res.status(Number(result.code) || 500).json(result);
      }
    } catch (error) {
      next(error);
    }
  };

  updatePost = async (req, res, next) => {
    try {
      const result = await adminService.updatePost(req.params.id, req.body);
      if (result.code === "200") {
        new OK({ message: result.message, data: result.metadata }).send(res);
      } else {
        res.status(Number(result.code) || 500).json(result);
      }
    } catch (error) {
      next(error);
    }
  };

  deletePost = async (req, res, next) => {
    try {
      const result = await adminService.deletePost(req.params.id);
      if (result.code === "200") {
        new OK({ message: result.message }).send(res);
      } else {
        res.status(Number(result.code) || 500).json(result);
      }
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AdminController();
