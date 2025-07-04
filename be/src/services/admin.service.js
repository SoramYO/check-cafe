"use strict";

const userModel = require("../models/user.model");
const advertisementModel = require("../models/advertisement.model");
const reservationModel = require("../models/reservation.model");
const shopModel = require("../models/shop.model");
const notificationModel = require("../models/notification.model");
const bcrypt = require("bcryptjs");
const mongoose = require('mongoose');
const reviewModel = require("../models/review.model");

class AdminService {

  changePassword = async (req) => {
    try {
      const userId = req.params.id;
      const { newPassword } = req.body;
      
      // Validate input
      if (!userId) {
        return {
          code: "400",
          message: "User ID is required",
          status: "error",
        };
      }
      
      if (!newPassword || newPassword.length < 6) {
        return {
          code: "400",
          message: "New password must be at least 6 characters",
          status: "error",
        };
      }

      // Check if user exists
      const user = await userModel.findById(userId);
      if (!user) {
        return {
          code: "404",
          message: "User not found",
          status: "error",
        };
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(newPassword, 10);
      
      // Update user password
      await userModel.findByIdAndUpdate(userId, { 
        password: passwordHash,
        updatedAt: new Date()
      });

      return {
        code: "200",
        message: "Password changed successfully",
        metadata: {
          userId: user._id,
          email: user.email,
          full_name: user.full_name
        }
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Ads Management
  getAds = async ({ page = 1, limit = 10 }) => {
    try {
      const ads = await advertisementModel
        .find()
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("shop_id", "name")
        .lean();

      const total = await advertisementModel.countDocuments();

      return {
        code: "200",
        metadata: {
          ads,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  createAd = async (adData) => {
    try {
      const newAd = await advertisementModel.create(adData);
      return {
        code: "201",
        metadata: { ad: newAd },
        message: "Advertisement created successfully",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  updateAd = async (id, updateData) => {
    try {
      const updatedAd = await advertisementModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true }
      );
      return {
        code: "200",
        metadata: { ad: updatedAd },
        message: "Advertisement updated successfully",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  deleteAd = async (id) => {
    try {
      await advertisementModel.findByIdAndDelete(id);
      return {
        code: "200",
        message: "Advertisement deleted successfully",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Statistics
  getUserStats = async () => {
    try {
      const totalUsers = await userModel.countDocuments({ role: "USER" });
      const activeUsers = await userModel.countDocuments({
        role: "USER",
        is_active: true,
      });
      const vipUsers = await userModel.countDocuments({
        role: "USER",
        vip_status: true,
      });

      return {
        code: "200",
        metadata: {
          total: totalUsers,
          active: activeUsers,
          vip: vipUsers,
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  getBookingStats = async () => {
    try {
      const totalBookings = await reservationModel.countDocuments();
      const completedBookings = await reservationModel.countDocuments({
        status: "COMPLETED",
      });
      const cancelledBookings = await reservationModel.countDocuments({
        status: "CANCELLED",
      });

      return {
        code: "200",
        metadata: {
          total: totalBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Enhanced booking statistics by time period
  getBookingStatsByPeriod = async ({ period = 'day', shopId = null, startDate = null, endDate = null }) => {
    try {
      const now = new Date();
      let start, end, groupBy;

      // Set date range based on period
      switch (period) {
        case 'day':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            day: { $dayOfMonth: "$createdAt" } 
          };
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          start = startDate ? new Date(startDate) : weekStart;
          end = endDate ? new Date(endDate) : new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            week: { $week: "$createdAt" } 
          };
          break;
        case 'month':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
          end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          };
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            day: { $dayOfMonth: "$createdAt" } 
          };
      }

      // Build match conditions
      const matchConditions = {
        createdAt: { $gte: start, $lt: end }
      };

      if (shopId) {
        // Convert shopId to ObjectId for proper comparison
        matchConditions.shop_id = new mongoose.Types.ObjectId(shopId);
      }

      // Aggregate pipeline for booking statistics
      const bookingStats = await reservationModel.aggregate([
        { $match: matchConditions },
        {
          $group: {
            _id: groupBy,
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
            },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
            },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
            },
            totalPeople: { $sum: "$number_of_people" },
            avgPeoplePerBooking: { $avg: "$number_of_people" }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      // Get shop information if shopId is provided
      let shopInfo = null;
      if (shopId) {
        shopInfo = await shopModel.findById(shopId).select('name address owner_id').lean();
      }

      // Calculate summary statistics
      const summary = {
        totalBookings: bookingStats.reduce((sum, stat) => sum + stat.totalBookings, 0),
        completedBookings: bookingStats.reduce((sum, stat) => sum + stat.completedBookings, 0),
        cancelledBookings: bookingStats.reduce((sum, stat) => sum + stat.cancelledBookings, 0),
        pendingBookings: bookingStats.reduce((sum, stat) => sum + stat.pendingBookings, 0),
        confirmedBookings: bookingStats.reduce((sum, stat) => sum + stat.confirmedBookings, 0),
        totalPeople: bookingStats.reduce((sum, stat) => sum + stat.totalPeople, 0),
        avgPeoplePerBooking: bookingStats.length > 0 ? 
          bookingStats.reduce((sum, stat) => sum + stat.avgPeoplePerBooking, 0) / bookingStats.length : 0
      };

      // Calculate completion rate
      summary.completionRate = summary.totalBookings > 0 ? 
        (summary.completedBookings / summary.totalBookings * 100) : 0;

      return {
        code: "200",
        metadata: {
          period,
          startDate: start,
          endDate: end,
          shopInfo,
          summary,
          breakdown: bookingStats,
          totalPeriods: bookingStats.length
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get booking statistics for all shops
  getShopBookingStats = async ({ period = 'day', startDate = null, endDate = null }) => {
    try {
      const now = new Date();
      let start, end;

      // Set date range based on period
      switch (period) {
        case 'day':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          start = startDate ? new Date(startDate) : weekStart;
          end = endDate ? new Date(endDate) : new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
          end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
      }

      // Aggregate pipeline for shop booking statistics
      const shopStats = await reservationModel.aggregate([
        {
          $match: {
            createdAt: { $gte: start, $lt: end }
          }
        },
        {
          $lookup: {
            from: "shops",
            localField: "shop_id",
            foreignField: "_id",
            as: "shop"
          }
        },
        {
          $unwind: "$shop"
        },
        {
          $group: {
            _id: "$shop_id",
            shopName: { $first: "$shop.name" },
            shopAddress: { $first: "$shop.address" },
            ownerId: { $first: "$shop.owner_id" },
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
            },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
            },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
            },
            totalPeople: { $sum: "$number_of_people" },
            avgPeoplePerBooking: { $avg: "$number_of_people" }
          }
        },
        {
          $addFields: {
            completionRate: {
              $cond: [
                { $gt: ["$totalBookings", 0] },
                { $multiply: [{ $divide: ["$completedBookings", "$totalBookings"] }, 100] },
                0
              ]
            }
          }
        },
        {
          $sort: { totalBookings: -1 }
        },
        {
          $limit: 10
        }
      ]);

      // Get owner information for each shop
      const shopStatsWithOwners = await Promise.all(
        shopStats.map(async (stat) => {
          const owner = await userModel.findById(stat.ownerId).select('full_name email').lean();
          return {
            ...stat,
            owner: owner || { full_name: 'Unknown', email: 'Unknown' }
          };
        })
      );

      return {
        code: "200",
        metadata: {
          period,
          startDate: start,
          endDate: end,
          totalShops: shopStatsWithOwners.length,
          shops: shopStatsWithOwners,
          summary: {
            totalBookings: shopStatsWithOwners.reduce((sum, shop) => sum + shop.totalBookings, 0),
            totalCompleted: shopStatsWithOwners.reduce((sum, shop) => sum + shop.completedBookings, 0),
            totalCancelled: shopStatsWithOwners.reduce((sum, shop) => sum + shop.cancelledBookings, 0),
            totalPeople: shopStatsWithOwners.reduce((sum, shop) => sum + shop.totalPeople, 0),
            avgCompletionRate: shopStatsWithOwners.length > 0 ? 
              shopStatsWithOwners.reduce((sum, shop) => sum + shop.completionRate, 0) / shopStatsWithOwners.length : 0
          }
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get detailed booking timeline for a specific shop
  getShopBookingTimeline = async ({ shopId, period = 'day', startDate = null, endDate = null }) => {
    try {
      const now = new Date();
      let start, end, groupBy;

      // Set date range based on period
      switch (period) {
        case 'day':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = endDate ? new Date(endDate) : new Date(start.getTime() + 24 * 60 * 60 * 1000);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            day: { $dayOfMonth: "$createdAt" },
            hour: { $hour: "$createdAt" }
          };
          break;
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          weekStart.setHours(0, 0, 0, 0);
          start = startDate ? new Date(startDate) : weekStart;
          end = endDate ? new Date(endDate) : new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            day: { $dayOfMonth: "$createdAt" }
          };
          break;
        case 'month':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
          end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            day: { $dayOfMonth: "$createdAt" }
          };
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          groupBy = { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" }, 
            day: { $dayOfMonth: "$createdAt" },
            hour: { $hour: "$createdAt" }
          };
      }

      // Get shop information
      const shop = await shopModel.findById(shopId).select('name address owner_id').lean();
      if (!shop) {
        return {
          code: "404",
          message: "Shop not found",
          status: "error",
        };
      }

      // Aggregate pipeline for booking timeline
      const timeline = await reservationModel.aggregate([
        {
          $match: {
            shop_id: new mongoose.Types.ObjectId(shopId),
            createdAt: { $gte: start, $lt: end }
          }
        },
        {
          $group: {
            _id: groupBy,
            totalBookings: { $sum: 1 },
            completedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] }
            },
            cancelledBookings: {
              $sum: { $cond: [{ $eq: ["$status", "CANCELLED"] }, 1, 0] }
            },
            pendingBookings: {
              $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] }
            },
            confirmedBookings: {
              $sum: { $cond: [{ $eq: ["$status", "CONFIRMED"] }, 1, 0] }
            },
            totalPeople: { $sum: "$number_of_people" },
            avgPeoplePerBooking: { $avg: "$number_of_people" },
            revenue: { $sum: { $ifNull: ["$total_amount", 0] } }
          }
        },
        {
          $addFields: {
            completionRate: {
              $cond: [
                { $gt: ["$totalBookings", 0] },
                { $multiply: [{ $divide: ["$completedBookings", "$totalBookings"] }, 100] },
                0
              ]
            }
          }
        },
        { $sort: { "_id": 1 } }
      ]);

      return {
        code: "200",
        metadata: {
          shop,
          period,
          startDate: start,
          endDate: end,
          timeline,
          summary: {
            totalBookings: timeline.reduce((sum, item) => sum + item.totalBookings, 0),
            totalCompleted: timeline.reduce((sum, item) => sum + item.completedBookings, 0),
            totalCancelled: timeline.reduce((sum, item) => sum + item.cancelledBookings, 0),
            totalPeople: timeline.reduce((sum, item) => sum + item.totalPeople, 0),
            totalRevenue: timeline.reduce((sum, item) => sum + item.revenue, 0),
            avgCompletionRate: timeline.length > 0 ? 
              timeline.reduce((sum, item) => sum + item.completionRate, 0) / timeline.length : 0
          }
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  getShopStats = async () => {
    try {
      const totalShops = await shopModel.countDocuments();
      const activeShops = await shopModel.countDocuments({ is_active: true });
      const vipShops = await shopModel.countDocuments({ vip_status: true });

      return {
        code: "200",
        metadata: {
          total: totalShops,
          active: activeShops,
          vip: vipShops,
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  getOverviewStats = async () => {
    try {
      const [userStats, bookingStats, shopStats] = await Promise.all([
        this.getUserStats(),
        this.getBookingStats(),
        this.getShopStats(),
      ]);

      return {
        code: "200",
        metadata: {
          users: userStats.metadata,
          bookings: bookingStats.metadata,
          shops: shopStats.metadata,
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Account Management
  getAccounts = async ({ page = 1, limit = 10, role }) => {
    try {
      const query = role ? { role } : {};
      const accounts = await userModel
        .find(query)
        .select("-password")
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await userModel.countDocuments(query);

      return {
        code: "200",
        metadata: {
          accounts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  blockAccount = async (id) => {
    try {
      await userModel.findByIdAndUpdate(id, { is_active: false });
      return {
        code: "200",
        message: "Account blocked successfully",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  unblockAccount = async (id) => {
    try {
      await userModel.findByIdAndUpdate(id, { is_active: true });
      return {
        code: "200",
        message: "Account unblocked successfully",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  getDashboardStats = async () => {
    try {
      // Get current date and time periods for growth comparisons
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

      // Import models
      const shopVerificationModel = require("../models/shopVerification.model");
      const userPackageModel = require("../models/userPackage.model");
      const shopThemeModel = require("../models/shopTheme.model");

      // Parallel queries for efficiency
      const [
        // User statistics
        totalUsers, 
        totalCustomers,
        totalShopOwners,
        lastMonthUsers, 
        activeUsers,
        vipUsers,
        
        // Shop statistics
        totalShops,
        lastMonthShops,
        activeShops,
        pendingShops,
        rejectedShops,
        vipShops,
        
        // Booking statistics
        todayBookings, 
        yesterdayBookings,
        lastWeekBookings,
        lastMonthBookings,
        completedBookings,
        cancelledBookings,
        
        // Revenue statistics
        todayRevenue,
        lastMonthRevenue,
        twoMonthsAgoRevenue,
        
        // Verification statistics
        totalVerifications,
        pendingVerifications,
        approvedVerifications,
        rejectedVerifications,
        thisWeekVerifications,
        
        // User Package statistics
        totalUserPackages,
        activeUserPackages,
        expiredUserPackages,
        thisMonthPackages,
        
        // Theme statistics
        totalThemes,
        
        // Shop detailed statistics
        shopsWithImages,
        shopsWithMenuItems,
        shopsWithTimeSlots
      ] = await Promise.all([
        // User statistics
        userModel.countDocuments(),
        userModel.countDocuments({ role: "CUSTOMER" }),
        userModel.countDocuments({ role: "SHOP_OWNER" }),
        userModel.countDocuments({ 
          createdAt: { $lt: today, $gte: lastMonth } 
        }),
        userModel.countDocuments({ is_active: true }),
        userModel.countDocuments({ vip_status: true }),
        
        // Shop statistics
        shopModel.countDocuments(),
        shopModel.countDocuments({
          createdAt: { $lt: today, $gte: lastMonth }
        }),
        shopModel.countDocuments({ status: "Active" }),
        shopModel.countDocuments({ status: "Pending" }),
        shopModel.countDocuments({ status: "Rejected" }),
        shopModel.countDocuments({ vip_status: true }),
        
        // Booking statistics
        reservationModel.countDocuments({
          createdAt: { $gte: today }
        }),
        reservationModel.countDocuments({
          createdAt: { $gte: yesterday, $lt: today }
        }),
        reservationModel.countDocuments({
          createdAt: { $gte: lastWeek }
        }),
        reservationModel.countDocuments({
          createdAt: { $gte: lastMonth }
        }),
        reservationModel.countDocuments({ status: "COMPLETED" }),
        reservationModel.countDocuments({ status: "CANCELLED" }),
        
        // Revenue statistics
        reservationModel.aggregate([
          { 
            $match: { 
              createdAt: { $gte: today },
              status: { $in: ["COMPLETED", "CONFIRMED"] }
            } 
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: { $ifNull: ["$total_amount", 0] } }
            } 
          }
        ]),
        reservationModel.aggregate([
          { 
            $match: { 
              createdAt: { $lt: today, $gte: lastMonth },
              status: { $in: ["COMPLETED", "CONFIRMED"] }
            } 
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: { $ifNull: ["$total_amount", 0] } }
            } 
          }
        ]),
        reservationModel.aggregate([
          { 
            $match: { 
              createdAt: { $lt: lastMonth, $gte: twoMonthsAgo },
              status: { $in: ["COMPLETED", "CONFIRMED"] }
            } 
          },
          { 
            $group: { 
              _id: null, 
              total: { $sum: { $ifNull: ["$total_amount", 0] } }
            } 
          }
        ]),
        
        // Verification statistics
        shopVerificationModel.countDocuments(),
        shopVerificationModel.countDocuments({ status: "Pending" }),
        shopVerificationModel.countDocuments({ status: "Approved" }),
        shopVerificationModel.countDocuments({ status: "Rejected" }),
        shopVerificationModel.countDocuments({
          submitted_at: { $gte: lastWeek }
        }),
        
        // User Package statistics
        userPackageModel.countDocuments(),
        userPackageModel.countDocuments({ 
          status: "active",
          end_date: { $gte: now }
        }),
        userPackageModel.countDocuments({ 
          status: "active",
          end_date: { $lt: now }
        }),
        userPackageModel.countDocuments({
          createdAt: { $gte: lastMonth }
        }),
        
        // Theme statistics
        shopThemeModel.countDocuments(),
        
        // Shop detailed statistics
        shopModel.aggregate([
          {
            $lookup: {
              from: "shopimages",
              localField: "_id",
              foreignField: "shop_id",
              as: "images"
            }
          },
          {
            $match: { "images.0": { $exists: true } }
          },
          {
            $count: "total"
          }
        ]),
        shopModel.aggregate([
          {
            $lookup: {
              from: "shopmenuitems",
              localField: "_id",
              foreignField: "shop_id",
              as: "menuItems"
            }
          },
          {
            $match: { "menuItems.0": { $exists: true } }
          },
          {
            $count: "total"
          }
        ]),
        shopModel.aggregate([
          {
            $lookup: {
              from: "shoptimeslots",
              localField: "_id",
              foreignField: "shop_id",
              as: "timeSlots"
            }
          },
          {
            $match: { "timeSlots.0": { $exists: true } }
          },
          {
            $count: "total"
          }
        ])
      ]);

      // Calculate revenue totals
      const todayRevenueTotal = todayRevenue.length > 0 ? todayRevenue[0].total : 0;
      const lastMonthRevenueTotal = lastMonthRevenue.length > 0 ? lastMonthRevenue[0].total : 0;
      const twoMonthsAgoRevenueTotal = twoMonthsAgoRevenue.length > 0 ? twoMonthsAgoRevenue[0].total : 0;
      
      // Calculate averages and growth rates
      const lastMonthDays = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
      const averageRevenue = lastMonthRevenueTotal / lastMonthDays || 0;
      
      // Calculate growth percentages
      const userGrowth = (totalUsers - lastMonthUsers) > 0 ? 
        (lastMonthUsers / (totalUsers - lastMonthUsers) * 100) : 0;
      const shopGrowth = (totalShops - lastMonthShops) > 0 ? 
        (lastMonthShops / (totalShops - lastMonthShops) * 100) : 0;
      
      // Calculate booking growth (today vs yesterday)
      let bookingGrowth = 0;
      if (yesterdayBookings > 0) {
        bookingGrowth = ((todayBookings - yesterdayBookings) / yesterdayBookings) * 100;
      } else if (todayBookings > 0) {
        bookingGrowth = 100;
      }
      
      // Calculate revenue growth (last month vs two months ago)
      let revenueGrowth = 0;
      if (twoMonthsAgoRevenueTotal > 0) {
        revenueGrowth = ((lastMonthRevenueTotal - twoMonthsAgoRevenueTotal) / twoMonthsAgoRevenueTotal) * 100;
      } else if (lastMonthRevenueTotal > 0) {
        revenueGrowth = 100;
      }

      // Calculate completion rates
      const totalBookings = completedBookings + cancelledBookings;
      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100) : 0;
      
      const verificationApprovalRate = totalVerifications > 0 ? 
        (approvedVerifications / totalVerifications * 100) : 0;

      // Calculate shop setup completion rates
      const shopsWithImagesCount = shopsWithImages.length > 0 ? shopsWithImages[0].total : 0;
      const shopsWithMenuItemsCount = shopsWithMenuItems.length > 0 ? shopsWithMenuItems[0].total : 0;
      const shopsWithTimeSlotsCount = shopsWithTimeSlots.length > 0 ? shopsWithTimeSlots[0].total : 0;

      return {
        // Basic stats (for existing UI)
          totalUsers,
          totalShops,
          todayBookings,
          averageRevenue: Math.round(averageRevenue * 100) / 100,
          userGrowth: Math.round(userGrowth * 10) / 10,
          shopGrowth: Math.round(shopGrowth * 10) / 10,
          bookingGrowth: Math.round(bookingGrowth * 10) / 10,
          revenueGrowth: Math.round(revenueGrowth * 10) / 10,
        
        // Detailed user statistics
        userStats: {
          total: totalUsers,
          customers: totalCustomers,
          shopOwners: totalShopOwners,
          active: activeUsers,
          vip: vipUsers,
          newThisMonth: lastMonthUsers,
          activeRate: totalUsers > 0 ? Math.round((activeUsers / totalUsers) * 100) : 0,
          vipRate: totalUsers > 0 ? Math.round((vipUsers / totalUsers) * 100) : 0
        },
        
        // Detailed shop statistics
        shopStats: {
          total: totalShops,
          active: activeShops,
          pending: pendingShops,
          rejected: rejectedShops,
          vip: vipShops,
          newThisMonth: lastMonthShops,
          activeRate: totalShops > 0 ? Math.round((activeShops / totalShops) * 100) : 0,
          vipRate: totalShops > 0 ? Math.round((vipShops / totalShops) * 100) : 0,
          withImages: shopsWithImagesCount,
          withMenuItems: shopsWithMenuItemsCount,
          withTimeSlots: shopsWithTimeSlotsCount,
          setupCompletionRate: totalShops > 0 ? 
            Math.round(((shopsWithImagesCount + shopsWithMenuItemsCount + shopsWithTimeSlotsCount) / (totalShops * 3)) * 100) : 0
        },
        
        // Booking statistics
        bookingStats: {
          today: todayBookings,
          yesterday: yesterdayBookings,
          thisWeek: lastWeekBookings,
          thisMonth: lastMonthBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
          completionRate: Math.round(completionRate * 10) / 10
        },
        
        // Revenue statistics
        revenueStats: {
          today: todayRevenueTotal,
          averageDaily: Math.round(averageRevenue * 100) / 100,
          thisMonth: lastMonthRevenueTotal,
          lastMonth: twoMonthsAgoRevenueTotal,
          growth: Math.round(revenueGrowth * 10) / 10
        },
        
        // Verification statistics
        verificationStats: {
          total: totalVerifications,
          pending: pendingVerifications,
          approved: approvedVerifications,
          rejected: rejectedVerifications,
          thisWeek: thisWeekVerifications,
          approvalRate: Math.round(verificationApprovalRate * 10) / 10
        },
        
        // User Package statistics
        packageStats: {
          total: totalUserPackages,
          active: activeUserPackages,
          expired: expiredUserPackages,
          newThisMonth: thisMonthPackages,
          activeRate: totalUserPackages > 0 ? 
            Math.round((activeUserPackages / totalUserPackages) * 100) : 0
        },
        
        // Theme statistics
        themeStats: {
          total: totalThemes
        }
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  };

  // Create new user by admin
  createUser = async ({ full_name, email, password, role, phone, avatar }) => {
    try {
      // Check if email exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return {
          code: "400",
          message: "Email already exists",
          status: "error",
        };
      }

      // Validate role
      const validRoles = ["ADMIN", "SHOP_OWNER", "CUSTOMER"];
      if (!validRoles.includes(role)) {
        return {
          code: "400",
          message: "Invalid role",
          status: "error",
        };
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create new user
      const newUser = await userModel.create({
        full_name,
        email,
        password: passwordHash,
        role,
        phone: phone || null,
        avatar: avatar || null,
        is_active: true,
      });

      return {
        code: "201",
        metadata: {
          user: {
            _id: newUser._id,
            full_name: newUser.full_name,
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
            avatar: newUser.avatar,
            is_active: newUser.is_active,
            createdAt: newUser.createdAt,
          }
        },
        message: "User created successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get shop owners without shops
  getShopOwnersWithoutShops = async ({ page = 1, limit = 10 }) => {
    try {
      const skip = (page - 1) * limit;

      // Get all shop owner IDs who already have shops
      const shopOwnerIds = await shopModel.distinct("owner_id");

      // Find shop owners who don't have shops
      const shopOwnersWithoutShops = await userModel
        .find({
          role: "SHOP_OWNER",
          _id: { $nin: shopOwnerIds },
          is_active: true
        })
        .select("_id full_name email phone avatar createdAt")
        .skip(skip)
        .limit(Number(limit))
        .lean();

      const total = await userModel.countDocuments({
        role: "SHOP_OWNER",
        _id: { $nin: shopOwnerIds },
        is_active: true
      });

      return {
        code: "200",
        metadata: {
          shopOwners: shopOwnersWithoutShops,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
        message: "Shop owners without shops retrieved successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  getUserById = async (id) => {
    try {
      const mongoose = require('mongoose');
      
      // Get user basic info
      const user = await userModel.findById(id).lean();
      if (!user) {
        return {
          code: "404",
          message: "User not found",
          status: "error",
        };
      }

      // Get user's reservations
      const reservations = await reservationModel.find({ user_id: id })
        .populate([
          { path: "shop_id", select: "_id name address" },
          { path: "seat_id", select: "_id seat_name capacity" },
          { path: "time_slot_id", select: "_id start_time end_time" }
        ])
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // Get user's reviews
      const reviews = await reviewModel.find({ user_id: id })
        .populate([
          { path: "shop_id", select: "_id name address" }
        ])
        .sort({ createdAt: -1 })
        .limit(10)
        .lean();

      // Get check-ins (completed reservations)
      const checkins = await reservationModel.find({ 
        user_id: id, 
        status: "COMPLETED" 
      })
        .populate([
          { path: "shop_id", select: "_id name address" },
          { path: "seat_id", select: "_id seat_name capacity" },
          { path: "time_slot_id", select: "_id start_time end_time" }
        ])
        .sort({ updatedAt: -1 })
        .limit(10)
        .lean();

      // Calculate statistics
      const totalReservations = await reservationModel.countDocuments({ user_id: id });
      const totalCheckins = await reservationModel.countDocuments({ user_id: id, status: "COMPLETED" });
      const totalReviews = await reviewModel.countDocuments({ user_id: id });
      
      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentReservations = await reservationModel.countDocuments({
        user_id: id,
        createdAt: { $gte: thirtyDaysAgo }
      });
      
      const recentCheckins = await reservationModel.countDocuments({
        user_id: id,
        status: "COMPLETED",
        updatedAt: { $gte: thirtyDaysAgo }
      });
      
      const recentReviews = await reviewModel.countDocuments({
        user_id: id,
        createdAt: { $gte: thirtyDaysAgo }
      });

      // Get reservation status breakdown
      const reservationStats = await reservationModel.aggregate([
        { $match: { user_id: new mongoose.Types.ObjectId(id) } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        }
      ]);

      const statusBreakdown = {
        PENDING: 0,
        CONFIRMED: 0,
        COMPLETED: 0,
        CANCELLED: 0
      };

      reservationStats.forEach(stat => {
        statusBreakdown[stat._id] = stat.count;
      });

      return {
        ...user,
        activities: {
          reservations: reservations,
          reviews: reviews,
          checkins: checkins
        },
        statistics: {
          total: {
            reservations: totalReservations,
            checkins: totalCheckins,
            reviews: totalReviews
          },
          recent: {
            reservations: recentReservations,
            checkins: recentCheckins,
            reviews: recentReviews
          },
          statusBreakdown: statusBreakdown
        }
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  updateUserById = async (id, updateData) => {
    try {
      // Check if user exists
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return {
          code: "404",
          message: "User not found",
          status: "error",
        };
      }

      // Validate role if provided
      if (updateData.role) {
        const validRoles = ["ADMIN", "SHOP_OWNER", "CUSTOMER"];
        if (!validRoles.includes(updateData.role)) {
          return {
            code: "400",
            message: "Invalid role",
            status: "error",
          };
        }
      }

      // Only allow updating specific fields
      const allowedFields = ['full_name', 'role', 'is_active', 'phone'];
      const safeUpdateData = {};
      
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          safeUpdateData[field] = updateData[field];
        }
      });

      // Validate is_active is boolean if provided
      if (safeUpdateData.is_active !== undefined && typeof safeUpdateData.is_active !== 'boolean') {
        return {
          code: "400",
          message: "is_active must be a boolean value",
          status: "error",
        };
      }

      // Update user
      const updatedUser = await userModel.findByIdAndUpdate(
        id,
        safeUpdateData,
        { new: true, runValidators: true }
      ).select("-password");

      return {
        code: "200",
        status: 200,
        metadata: {
          user: updatedUser
        },
        message: "User updated successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  deleteUserById = async (id) => {
    try {
      // Check if user exists
      const existingUser = await userModel.findById(id);
      if (!existingUser) {
        return {
          code: "404",
          message: "User not found",
          status: "error",
        };
      }

      // Don't allow deleting admin users
      if (existingUser.role === "ADMIN") {
        return {
          code: "403",
          message: "Cannot delete admin users",
          status: "error",
        };
      }

      // Soft delete - set is_active to false instead of actually deleting
      await userModel.findByIdAndUpdate(id, { is_active: false });

      return {
        code: "200",
        status: 200,
        message: "User deleted successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Reports Services
  getUserReports = async ({ period = 'this-month', startDate, endDate }) => {
    try {
      const now = new Date();
      let start, end;

      // Calculate date range based on period
      switch (period) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'this-week':
          const dayOfWeek = now.getDay();
          start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          start.setHours(0, 0, 0, 0);
          end = new Date();
          break;
        case 'last-week':
          const lastWeekEnd = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
          lastWeekEnd.setHours(0, 0, 0, 0);
          start = new Date(lastWeekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
          end = lastWeekEnd;
          break;
        case 'this-month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
          break;
        case 'last-month':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this-year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date();
          break;
        case 'custom':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
          end = endDate ? new Date(endDate) : new Date();
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
      }

      // Get user statistics
      const [
        totalUsers,
        newUsers,
        activeUsers,
        customerUsers,
        shopOwnerUsers,
        adminUsers,
        vipUsers,
        previousPeriodUsers,
        userGrowthData
      ] = await Promise.all([
        userModel.countDocuments(),
        userModel.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        userModel.countDocuments({ is_active: true }),
        userModel.countDocuments({ role: "CUSTOMER" }),
        userModel.countDocuments({ role: "SHOP_OWNER" }),
        userModel.countDocuments({ role: "ADMIN" }),
        userModel.countDocuments({ vip_status: true }),
        userModel.countDocuments({ 
          createdAt: { 
            $gte: new Date(start.getTime() - (end.getTime() - start.getTime())), 
            $lt: start 
          } 
        }),
        // User growth over time - format for charts
        userModel.aggregate([
          {
            $match: { createdAt: { $gte: start, $lt: end } }
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
              },
              newUsers: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ])
      ]);

      // Calculate growth percentages with NaN protection
      const userGrowth = previousPeriodUsers > 0 ? 
        ((newUsers - previousPeriodUsers) / previousPeriodUsers * 100) : 
        (newUsers > 0 ? 100 : 0);

      const retentionRate = totalUsers > 0 ? (activeUsers / totalUsers * 100) : 0;

      // Safe rounding function to prevent NaN
      const safeRound = (value) => {
        if (isNaN(value) || value === null || value === undefined) return 0;
        return Math.round(value * 10) / 10;
      };

      // Format chart data for frontend (always use 'date' key)
      const chartData = userGrowthData.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        newUsers: item.newUsers,
        totalUsers: totalUsers // This would need cumulative calculation for better accuracy
      }));

      return {
        summary: {
          totalUsers: totalUsers || 0,
          newUsers: newUsers || 0,
          activeUsers: activeUsers || 0,
          retentionRate: safeRound(retentionRate),
          userGrowth: safeRound(userGrowth)
        },
        breakdown: {
          customers: customerUsers || 0,
          shopOwners: shopOwnerUsers || 0,
          admins: adminUsers || 0,
          vipUsers: vipUsers || 0
        },
        charts: {
          userGrowth: chartData,
          timeline: chartData // Alternative key for compatibility
        },
        period: { start, end, period }
      };
    } catch (error) {
      throw new Error(`Failed to get user reports: ${error.message}`);
    }
  };

  getShopReports = async ({ period = 'this-month', startDate, endDate }) => {
    try {
      const now = new Date();
      let start, end;

      // Calculate date range based on period
      switch (period) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'this-week':
          const dayOfWeek = now.getDay();
          start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          start.setHours(0, 0, 0, 0);
          end = new Date();
          break;
        case 'last-week':
          const lastWeekEnd = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
          lastWeekEnd.setHours(0, 0, 0, 0);
          start = new Date(lastWeekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
          end = lastWeekEnd;
          break;
        case 'this-month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
          break;
        case 'last-month':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this-year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date();
          break;
        case 'custom':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
          end = endDate ? new Date(endDate) : new Date();
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
      }

      const [
        totalShops,
        newShops,
        activeShops,
        vipShops,
        pendingShops,
        rejectedShops,
        previousPeriodShops,
        averageRating,
        shopGrowthData
      ] = await Promise.all([
        shopModel.countDocuments(),
        shopModel.countDocuments({ createdAt: { $gte: start, $lt: end } }),
        shopModel.countDocuments({ status: "Active" }),
        shopModel.countDocuments({ vip_status: true }),
        shopModel.countDocuments({ status: "Pending" }),
        shopModel.countDocuments({ status: "Rejected" }),
        shopModel.countDocuments({ 
          createdAt: { 
            $gte: new Date(start.getTime() - (end.getTime() - start.getTime())), 
            $lt: start 
          } 
        }),
        shopModel.aggregate([
          { $group: { _id: null, avgRating: { $avg: "$rating_avg" } } }
        ]),
        // Shop growth over time - format for charts based on period
        shopModel.aggregate([
          {
            $match: { createdAt: { $gte: start, $lt: end } }
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
              },
              newShops: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ])
      ]);

      const shopGrowth = previousPeriodShops > 0 ? 
        ((newShops - previousPeriodShops) / previousPeriodShops * 100) : 
        (newShops > 0 ? 100 : 0);

      const avgRating = averageRating.length > 0 && averageRating[0].avgRating ? averageRating[0].avgRating : 0;

      // Safe rounding function to prevent NaN
      const safeRound = (value) => {
        if (isNaN(value) || value === null || value === undefined) return 0;
        return Math.round(value * 10) / 10;
      };

      // Format chart data for frontend (always use 'date' key)
      const chartData = shopGrowthData.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        newShops: item.newShops,
        totalShops: totalShops // This would need cumulative calculation for better accuracy
      }));

      return {
        summary: {
          totalShops: totalShops || 0,
          newShops: newShops || 0,
          activeShops: activeShops || 0,
          vipShops: vipShops || 0,
          avgRating: safeRound(avgRating),
          shopGrowth: safeRound(shopGrowth)
        },
        breakdown: {
          activeShops: activeShops || 0,
          pendingShops: pendingShops || 0,
          rejectedShops: rejectedShops || 0,
          vipShops: vipShops || 0
        },
        charts: {
          shopGrowth: chartData,
          timeline: chartData // Alternative key for compatibility
        },
        period: { start, end, period }
      };
    } catch (error) {
      throw new Error(`Failed to get shop reports: ${error.message}`);
    }
  };

  getOrderReports = async ({ period = 'this-month', startDate, endDate }) => {
    try {
      const now = new Date();
      let start, end;

      // Calculate date range based on period
      switch (period) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'this-week':
          const dayOfWeek = now.getDay();
          start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          start.setHours(0, 0, 0, 0);
          end = new Date();
          break;
        case 'last-week':
          const lastWeekEnd = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
          lastWeekEnd.setHours(0, 0, 0, 0);
          start = new Date(lastWeekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
          end = lastWeekEnd;
          break;
        case 'this-month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
          break;
        case 'last-month':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this-year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date();
          break;
        case 'custom':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
          end = endDate ? new Date(endDate) : new Date();
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
      }

      const [
        totalOrders,
        todayOrders,
        completedOrders,
        cancelledOrders,
        pendingOrders,
        yesterdayOrders,
        orderGrowthData
      ] = await Promise.all([
        reservationModel.countDocuments(),
        reservationModel.countDocuments({
          createdAt: { $gte: start, $lt: end }
        }),
        reservationModel.countDocuments({ status: "COMPLETED" }),
        reservationModel.countDocuments({ status: "CANCELLED" }),
        reservationModel.countDocuments({ status: "PENDING" }),
        reservationModel.countDocuments({
          createdAt: { 
            $gte: new Date(start.getTime() - 24 * 60 * 60 * 1000), 
            $lt: start 
          }
        }),
        // Order growth over time - format for charts based on period
        reservationModel.aggregate([
          {
            $match: { createdAt: { $gte: start, $lt: end } }
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                day: { $dayOfMonth: "$createdAt" }
              },
              orders: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ])
      ]);

      const completionRate = totalOrders > 0 ? (completedOrders / totalOrders * 100) : 0;
      const orderGrowth = yesterdayOrders > 0 ? 
        ((todayOrders - yesterdayOrders) / yesterdayOrders * 100) : 
        (todayOrders > 0 ? 100 : 0);

      // Safe rounding function to prevent NaN
      const safeRound = (value) => {
        if (isNaN(value) || value === null || value === undefined) return 0;
        return Math.round(value * 10) / 10;
      };

      // Calculate orders in period and average per day
      const ordersInPeriod = todayOrders || 0;
      const daysInPeriod = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) || 1;
      const avgOrdersPerDay = ordersInPeriod / daysInPeriod;

      // Format chart data for frontend (always use 'date' key)
      const chartData = orderGrowthData.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        orders: item.orders
      }));

      return {
        summary: {
          totalOrders: totalOrders || 0,
          ordersInPeriod: ordersInPeriod,
          completionRate: safeRound(completionRate),
          avgOrdersPerDay: safeRound(avgOrdersPerDay),
          orderGrowth: safeRound(orderGrowth)
        },
        breakdown: {
          completed: completedOrders || 0,
          cancelled: cancelledOrders || 0,
          pending: pendingOrders || 0
        },
        charts: {
          orderTimeline: chartData,
          dailyOrders: chartData // Alternative key for compatibility
        },
        period: { start, end, period }
      };
    } catch (error) {
      throw new Error(`Failed to get order reports: ${error.message}`);
    }
  };

  getRevenueReports = async ({ period = 'this-month', startDate, endDate }) => {
    try {
      const now = new Date();
      let start, end;

      // Calculate date range based on period
      switch (period) {
        case 'today':
          start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
          break;
        case 'yesterday':
          end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          start = new Date(end.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'this-week':
          const dayOfWeek = now.getDay();
          start = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
          start.setHours(0, 0, 0, 0);
          end = new Date();
          break;
        case 'last-week':
          const lastWeekEnd = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
          lastWeekEnd.setHours(0, 0, 0, 0);
          start = new Date(lastWeekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);
          end = lastWeekEnd;
          break;
        case 'this-month':
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
          break;
        case 'last-month':
          start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
          end = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this-year':
          start = new Date(now.getFullYear(), 0, 1);
          end = new Date();
          break;
        case 'custom':
          start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
          end = endDate ? new Date(endDate) : new Date();
          break;
        default:
          start = new Date(now.getFullYear(), now.getMonth(), 1);
          end = new Date();
      }

      const paymentModel = require("../models/payment.model");
      const userPackageModel = require("../models/userPackage.model");

      const [
        totalRevenue,
        vipRevenue,
        commissionRevenue,
        todayRevenue,
        lastMonthRevenue,
        averageOrderValue,
        revenueGrowthData
      ] = await Promise.all([
        paymentModel.aggregate([
          {
            $match: { 
              status: "COMPLETED",
              created_at: { $gte: start, $lt: end }
            }
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        paymentModel.aggregate([
          {
            $lookup: {
              from: "packages",
              localField: "package_id", 
              foreignField: "_id",
              as: "package"
            }
          },
          { $unwind: "$package" },
          {
            $match: { 
              status: "COMPLETED",
              "package.type": "VIP",
              created_at: { $gte: start, $lt: end }
            }
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        // Commission revenue (mock calculation - 10% of completed reservations)
        reservationModel.aggregate([
          {
            $match: { 
              status: "COMPLETED",
              createdAt: { $gte: start, $lt: end }
            }
          },
          {
            $group: { 
              _id: null, 
              total: { $sum: { $multiply: ["$number_of_people", 50000] } } // Mock 50k per person commission
            }
          }
        ]),
        paymentModel.aggregate([
          {
            $match: { 
              status: "COMPLETED",
              created_at: { 
                $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
                $lt: new Date()
              }
            }
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        paymentModel.aggregate([
          {
            $match: { 
              status: "COMPLETED",
              created_at: { 
                $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
                $lt: new Date(now.getFullYear(), now.getMonth(), 1)
              }
            }
          },
          { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        paymentModel.aggregate([
          {
            $match: { 
              status: "COMPLETED",
              created_at: { $gte: start, $lt: end }
            }
          },
          {
            $group: { 
              _id: null, 
              avg: { $avg: "$amount" },
              count: { $sum: 1 }
            }
          }
        ]),
        // Revenue growth over time - format for charts based on period
        paymentModel.aggregate([
          {
            $match: { 
              status: "COMPLETED",
              created_at: { $gte: start, $lt: end }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: "$created_at" },
                month: { $month: "$created_at" },
                day: { $dayOfMonth: "$created_at" }
              },
              total: { $sum: "$amount" },
              count: { $sum: 1 }
            }
          },
          { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ])
      ]);

      const totalRev = totalRevenue.length > 0 && totalRevenue[0].total ? totalRevenue[0].total : 0;
      const vipRev = vipRevenue.length > 0 && vipRevenue[0].total ? vipRevenue[0].total : 0;
      const commissionRev = commissionRevenue.length > 0 && commissionRevenue[0].total ? commissionRevenue[0].total : 0;
      const todayRev = todayRevenue.length > 0 && todayRevenue[0].total ? todayRevenue[0].total : 0;
      const lastMonthRev = lastMonthRevenue.length > 0 && lastMonthRevenue[0].total ? lastMonthRevenue[0].total : 0;
      const avgOrderVal = averageOrderValue.length > 0 && averageOrderValue[0].avg ? averageOrderValue[0].avg : 0;
      const totalTransactions = averageOrderValue.length > 0 && averageOrderValue[0].count ? averageOrderValue[0].count : 0;

      const revenueGrowth = lastMonthRev > 0 ? 
        ((totalRev - lastMonthRev) / lastMonthRev * 100) : 
        (totalRev > 0 ? 100 : 0);

      // Safe rounding function to prevent NaN
      const safeRound = (value) => {
        if (isNaN(value) || value === null || value === undefined) return 0;
        return Math.round(value * 10) / 10;
      };

      // Format chart data for frontend (always use 'date' key)
      const chartData = revenueGrowthData.map(item => ({
        date: `${item._id.year}-${String(item._id.month).padStart(2, '0')}-${String(item._id.day).padStart(2, '0')}`,
        vip: Math.round((vipRev / totalRev) * item.total) || 0,
        commission: Math.round((commissionRev / totalRev) * item.total) || 0,
        other: Math.round(((totalRev - vipRev - commissionRev) / totalRev) * item.total) || 0
      }));

      return {
        summary: {
          totalRevenue: totalRev || 0,
          avgOrderValue: safeRound(avgOrderVal),
          totalTransactions: totalTransactions || 0,
          revenueGrowth: safeRound(revenueGrowth)
        },
        breakdown: {
          vipRevenue: vipRev || 0,
          commissionRevenue: commissionRev || 0,
          otherRevenue: Math.max(0, (totalRev || 0) - (vipRev || 0) - (commissionRev || 0))
        },
        charts: {
          revenueTimeline: chartData,
          dailyRevenue: chartData // Alternative key for compatibility
        },
        period: { start, end, period }
      };
    } catch (error) {
      throw new Error(`Failed to get revenue reports: ${error.message}`);
    }
  };

  // ===== SHOP DETAILED INFORMATION SERVICES =====
  
  // Get shop reviews
  getShopReviews = async ({ shopId, page = 1, limit = 10, rating, sortBy = 'createdAt', sortOrder = 'desc' }) => {
    try {
      const query = { shop_id: shopId };
      if (rating) {
        query.rating = rating;
      }

      const sortOptions = {};
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

      const reviews = await reviewModel
        .find(query)
        .populate('user_id', 'full_name avatar')
        .sort(sortOptions)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await reviewModel.countDocuments(query);

      // Calculate average rating
      const avgRatingResult = await reviewModel.aggregate([
        { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
      ]);

      const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;
      const totalReviews = avgRatingResult.length > 0 ? avgRatingResult[0].totalReviews : 0;

      return {
        code: "200",
        metadata: {
          reviews,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
          summary: {
            averageRating: Math.round(avgRating * 10) / 10,
            totalReviews,
            ratingDistribution: await this.getRatingDistribution(shopId)
          }
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get rating distribution for a shop
  getRatingDistribution = async (shopId) => {
    const distribution = await reviewModel.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const result = {};
    for (let i = 1; i <= 5; i++) {
      const found = distribution.find(d => d._id === i);
      result[i] = found ? found.count : 0;
    }
    return result;
  };

  // Get shop detailed statistics
  getShopDetailedStats = async ({ shopId, period = 'month', startDate, endDate }) => {
    try {
      const shop = await shopModel.findById(shopId).lean();
      if (!shop) {
        return {
          code: "xxx",
          message: "Shop not found",
          status: "error",
        };
      }

      // Set date range for period-specific stats
      let dateFilter = {};
      if (startDate && endDate) {
        dateFilter = {
          createdAt: {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
          }
        };
      } else {
        const now = new Date();
        let start;
        switch (period) {
          case 'week':
            start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
          case 'month':
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
          case 'quarter':
            start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            break;
          case 'year':
            start = new Date(now.getFullYear(), 0, 1);
            break;
          default:
            start = new Date(now.getFullYear(), now.getMonth(), 1);
        }
        dateFilter = { createdAt: { $gte: start, $lte: now } };
      }

      // Get total reviews stats (all time)
      const totalReviewsStats = await reviewModel.aggregate([
        { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
        { $group: { _id: null, totalReviews: { $sum: 1 }, avgRating: { $avg: '$rating' } } }
      ]);

      // Get period-specific reviews stats
      const periodReviewsStats = await reviewModel.aggregate([
        { $match: { shop_id: new mongoose.Types.ObjectId(shopId), ...dateFilter } },
        { $group: { _id: null, periodReviews: { $sum: 1 } } }
      ]);

      // Get reservations stats
      const reservationsStats = await reservationModel.aggregate([
        { $match: { shop_id: new mongoose.Types.ObjectId(shopId), ...dateFilter } },
        { $group: { _id: null, totalReservations: { $sum: 1 } } }
      ]);

      // Get checkins stats (assuming checkin model exists)
      const checkinsStats = await reservationModel.aggregate([
        { $match: { shop_id: new mongoose.Types.ObjectId(shopId), status: 'completed', ...dateFilter } },
        { $group: { _id: null, totalCheckins: { $sum: 1 } } }
      ]);

      return {
        code: "200",
        metadata: {
          shop: {
            _id: shop._id,
            name: shop.name,
            address: shop.address,
            rating_avg: shop.rating_avg,
            rating_count: shop.rating_count,
            is_open: shop.is_open,
            vip_status: shop.vip_status
          },
          statistics: {
            reviews: {
              total: totalReviewsStats.length > 0 ? totalReviewsStats[0].totalReviews : 0,
              averageRating: totalReviewsStats.length > 0 ? Math.round(totalReviewsStats[0].avgRating * 10) / 10 : 0,
              periodTotal: periodReviewsStats.length > 0 ? periodReviewsStats[0].periodReviews : 0
            },
            reservations: {
              total: reservationsStats.length > 0 ? reservationsStats[0].totalReservations : 0
            },
            checkins: {
              total: checkinsStats.length > 0 ? checkinsStats[0].totalCheckins : 0
            }
          },
          period,
          dateRange: {
            start: dateFilter.createdAt?.$gte || new Date(),
            end: dateFilter.createdAt?.$lte || new Date()
          }
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get shop verification documents
  getShopVerifications = async ({ shopId, status, page = 1, limit = 10 }) => {
    try {
      const query = { shop_id: shopId };
      if (status) {
        query.status = status;
      }

      // Assuming verification model exists
      const verificationModel = require("../models/verification.model");
      
      const verifications = await verificationModel
        .find(query)
        .populate('shop_id', 'name address')
        .populate('user_id', 'full_name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await verificationModel.countDocuments(query);

      return {
        code: "200",
        metadata: {
          verifications,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get shop activity history
  getShopActivityHistory = async ({ shopId, action, page = 1, limit = 20, startDate, endDate }) => {
    try {
      const query = { shop_id: shopId };
      if (action) {
        query.action = action;
      }
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Assuming activity log model exists
      const activityLogModel = require("../models/activityLog.model");
      
      const activities = await activityLogModel
        .find(query)
        .populate('user_id', 'full_name email')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await activityLogModel.countDocuments(query);

      return {
        code: "200",
        metadata: {
          activities,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get shop owner information
  getShopOwnerInfo = async (shopId) => {
    try {
      const shop = await shopModel.findById(shopId)
        .populate('owner_id', 'full_name email phone avatar createdAt')
        .lean();

      if (!shop) {
        return {
          code: "xxx",
          message: "Shop not found",
          status: "error",
        };
      }

      return {
        code: "200",
        metadata: {
          owner: shop.owner_id,
          shopInfo: {
            _id: shop._id,
            name: shop.name,
            address: shop.address,
            phone: shop.phone,
            website: shop.website
          }
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get shop checkins
  getShopCheckins = async ({ shopId, page = 1, limit = 20, startDate, endDate }) => {
    try {
      const query = { shop_id: shopId };
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      // Assuming checkin model exists
      const checkinModel = require("../models/checkin.model");
      
      const checkins = await checkinModel
        .find(query)
        .populate('user_id', 'full_name avatar')
        .populate('shop_id', 'name address')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await checkinModel.countDocuments(query);

      return {
        code: "200",
        metadata: {
          checkins,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get shop reservations
  getShopReservations = async ({ shopId, status, page = 1, limit = 20, startDate, endDate }) => {
    try {
      const query = { shop_id: shopId };
      if (status) {
        query.status = status;
      }
      if (startDate && endDate) {
        query.createdAt = {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        };
      }

      const reservations = await reservationModel
        .find(query)
        .populate('user_id', 'full_name email phone')
        .populate('shop_id', 'name address')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await reservationModel.countDocuments(query);

      return {
        code: "200",
        metadata: {
          reservations,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  // ===== NOTIFICATION SERVICES =====
  
  // Get all notifications for admin
  getNotifications = async ({ page = 1, limit = 20, type, category, read, priority, startDate, endDate }) => {
    try {
      const query = {};
      
      // Filter by type
      if (type) {
        query.type = type;
      }
      
      // Filter by category
      if (category) {
        query.category = category;
      }
      
      // Filter by read status
      if (read !== undefined) {
        query.read = read === 'true';
      }
      
      // Filter by priority
      if (priority) {
        query.priority = priority;
      }
      
      // Filter by date range
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) {
          query.createdAt.$gte = new Date(startDate);
        }
        if (endDate) {
          query.createdAt.$lte = new Date(endDate);
        }
      }
      
      // Exclude expired notifications
      query.$or = [
        { expires_at: { $exists: false } },
        { expires_at: { $gt: new Date() } }
      ];

      const notifications = await notificationModel
        .find(query)
        .populate('user_id', 'full_name email avatar')
        .populate('shop_id', 'name address')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();

      const total = await notificationModel.countDocuments(query);
      const unreadCount = await notificationModel.countDocuments({ ...query, read: false });

      return {
        code: "200",
        metadata: {
          notifications,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            totalPages: Math.ceil(total / limit),
          },
          summary: {
            total,
            unread: unreadCount,
            read: total - unreadCount
          }
        },
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get notification by ID
  getNotificationById = async (id) => {
    try {
      const notification = await notificationModel
        .findById(id)
        .populate('user_id', 'full_name email avatar')
        .populate('shop_id', 'name address')
        .lean();

      if (!notification) {
        return {
          code: "404",
          message: "Notification not found",
          status: "error",
        };
      }

      return {
        code: "200",
        metadata: { notification },
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Create notification
  createNotification = async (notificationData) => {
    try {
      const newNotification = await notificationModel.create(notificationData);
      
      const populatedNotification = await notificationModel
        .findById(newNotification._id)
        .populate('user_id', 'full_name email avatar')
        .populate('shop_id', 'name address')
        .lean();

      return {
        code: "201",
        metadata: { notification: populatedNotification },
        message: "Notification created successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Update notification
  updateNotification = async (id, updateData) => {
    try {
      const updatedNotification = await notificationModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .populate('user_id', 'full_name email avatar')
        .populate('shop_id', 'name address')
        .lean();

      if (!updatedNotification) {
        return {
          code: "404",
          message: "Notification not found",
          status: "error",
        };
      }

      return {
        code: "200",
        metadata: { notification: updatedNotification },
        message: "Notification updated successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Mark notification as read
  markNotificationAsRead = async (id) => {
    try {
      const notification = await notificationModel.findById(id);
      
      if (!notification) {
        return {
          code: "404",
          message: "Notification not found",
          status: "error",
        };
      }

      notification.read = true;
      await notification.save();

      return {
        code: "200",
        message: "Notification marked as read",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Mark all notifications as read
  markAllNotificationsAsRead = async (filters = {}) => {
    try {
      const query = { read: false, ...filters };
      
      // Exclude expired notifications
      query.$or = [
        { expires_at: { $exists: false } },
        { expires_at: { $gt: new Date() } }
      ];

      const result = await notificationModel.updateMany(query, { read: true });

      return {
        code: "200",
        metadata: { updatedCount: result.modifiedCount },
        message: `${result.modifiedCount} notifications marked as read`,
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Delete notification
  deleteNotification = async (id) => {
    try {
      const notification = await notificationModel.findByIdAndDelete(id);
      
      if (!notification) {
        return {
          code: "404",
          message: "Notification not found",
          status: "error",
        };
      }

      return {
        code: "200",
        message: "Notification deleted successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Delete multiple notifications
  deleteMultipleNotifications = async (ids) => {
    try {
      const result = await notificationModel.deleteMany({ _id: { $in: ids } });

      return {
        code: "200",
        metadata: { deletedCount: result.deletedCount },
        message: `${result.deletedCount} notifications deleted successfully`,
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Get notification statistics
  getNotificationStats = async () => {
    try {
      const [
        totalNotifications,
        unreadNotifications,
        todayNotifications,
        thisWeekNotifications,
        thisMonthNotifications,
        typeStats,
        categoryStats,
        priorityStats
      ] = await Promise.all([
        notificationModel.countDocuments(),
        notificationModel.countDocuments({ read: false }),
        notificationModel.countDocuments({
          createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
        }),
        notificationModel.countDocuments({
          createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 7)) }
        }),
        notificationModel.countDocuments({
          createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
        }),
        notificationModel.aggregate([
          { $group: { _id: "$type", count: { $sum: 1 } } }
        ]),
        notificationModel.aggregate([
          { $group: { _id: "$category", count: { $sum: 1 } } }
        ]),
        notificationModel.aggregate([
          { $group: { _id: "$priority", count: { $sum: 1 } } }
        ])
      ]);

      return {
        code: "200",
        metadata: {
          summary: {
            total: totalNotifications,
            unread: unreadNotifications,
            read: totalNotifications - unreadNotifications,
            today: todayNotifications,
            thisWeek: thisWeekNotifications,
            thisMonth: thisMonthNotifications
          },
          breakdown: {
            byType: typeStats.reduce((acc, stat) => {
              acc[stat._id] = stat.count;
              return acc;
            }, {}),
            byCategory: categoryStats.reduce((acc, stat) => {
              acc[stat._id] = stat.count;
              return acc;
            }, {}),
            byPriority: priorityStats.reduce((acc, stat) => {
              acc[stat._id] = stat.count;
              return acc;
            }, {})
          }
        },
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Create system notification (helper method)
  createSystemNotification = async (data) => {
    try {
      const notification = await notificationModel.createSystemNotification(data);
      return {
        code: "201",
        metadata: { notification },
        message: "System notification created successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Create user notification (helper method)
  createUserNotification = async (userId, data) => {
    try {
      const notification = await notificationModel.createUserNotification(userId, data);
      return {
        code: "201",
        metadata: { notification },
        message: "User notification created successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Create shop notification (helper method)
  createShopNotification = async (shopId, data) => {
    try {
      const notification = await notificationModel.createShopNotification(shopId, data);
      return {
        code: "201",
        metadata: { notification },
        message: "Shop notification created successfully",
      };
    } catch (error) {
      return {
        code: "500",
        message: error.message,
        status: "error",
      };
    }
  };

  // Delete shop and all related data
  deleteShopById = async (shopId) => {
    try {
      console.log(`[AdminService] Starting shop deletion for shopId: ${shopId}`);
      
      // Check if shop exists
      const shop = await shopModel.findById(shopId);
      if (!shop) {
        console.log(`[AdminService] Shop not found: ${shopId}`);
        return {
          code: "404",
          message: "Shop not found",
          status: "error",
        };
      }

      console.log(`[AdminService] Found shop: ${shop.name}, starting deletion process`);

      // Import all related models
      const shopImageModel = require("../models/shopImage.model");
      const shopMenuItemModel = require("../models/shopMenuItem.model");
      const shopTimeSlotModel = require("../models/shopTimeSlot.model");
      const shopSeatModel = require("../models/shopSeat.model");
      const shopAmenityModel = require("../models/shopAmenity.model");
      const shopThemeModel = require("../models/shopTheme.model");
      const shopVerificationModel = require("../models/shopVerification.model");
      const checkinModel = require("../models/checkin.model");
      const checkinCommentModel = require("../models/checkinComment.model");
      const checkinLikeModel = require("../models/checkinLike.model");
      const reviewModel = require("../models/review.model");
      const reservationModel = require("../models/reservation.model");
      const paymentModel = require("../models/payment.model");
      const userPackageModel = require("../models/userPackage.model");
      const advertisementModel = require("../models/advertisement.model");

      // Start transaction for data consistency
      const session = await mongoose.startSession();
      let deletionResults = {};

      try {
        await session.withTransaction(async () => {
          console.log(`[AdminService] Starting transaction for shop deletion`);

          // 1. Delete shop images
          const deletedImages = await shopImageModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedImages.deletedCount} shop images`);
          deletionResults.images = deletedImages.deletedCount;

          // 2. Delete shop menu items
          const deletedMenuItems = await shopMenuItemModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedMenuItems.deletedCount} menu items`);
          deletionResults.menuItems = deletedMenuItems.deletedCount;

          // 3. Delete shop time slots
          const deletedTimeSlots = await shopTimeSlotModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedTimeSlots.deletedCount} time slots`);
          deletionResults.timeSlots = deletedTimeSlots.deletedCount;

          // 4. Delete shop seats
          const deletedSeats = await shopSeatModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedSeats.deletedCount} seats`);
          deletionResults.seats = deletedSeats.deletedCount;

          // 5. Delete shop amenities (junction table)
          const deletedAmenities = await shopAmenityModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedAmenities.deletedCount} shop amenities`);
          deletionResults.amenities = deletedAmenities.deletedCount;

          // 6. Delete shop themes (junction table)
          const deletedThemes = await shopThemeModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedThemes.deletedCount} shop themes`);
          deletionResults.themes = deletedThemes.deletedCount;

          // 7. Delete shop verifications
          const deletedVerifications = await shopVerificationModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedVerifications.deletedCount} verifications`);
          deletionResults.verifications = deletedVerifications.deletedCount;

          // 8. Delete checkins and related data
          const deletedCheckins = await checkinModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedCheckins.deletedCount} checkins`);
          deletionResults.checkins = deletedCheckins.deletedCount;

          // 9. Delete checkin comments
          const deletedCheckinComments = await checkinCommentModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedCheckinComments.deletedCount} checkin comments`);
          deletionResults.checkinComments = deletedCheckinComments.deletedCount;

          // 10. Delete checkin likes
          const deletedCheckinLikes = await checkinLikeModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedCheckinLikes.deletedCount} checkin likes`);
          deletionResults.checkinLikes = deletedCheckinLikes.deletedCount;

          // 11. Delete reviews
          const deletedReviews = await reviewModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedReviews.deletedCount} reviews`);
          deletionResults.reviews = deletedReviews.deletedCount;

          // 12. Get reservation IDs before deleting them
          const reservationIds = await reservationModel.find({ shop_id: shopId }).distinct('_id', { session });
          console.log(`[AdminService] Found ${reservationIds.length} reservations to delete`);

          // 13. Delete payments related to this shop's reservations
          const deletedPayments = await paymentModel.deleteMany({ 
            reservation_id: { $in: reservationIds }
          }, { session });
          console.log(`[AdminService] Deleted ${deletedPayments.deletedCount} payments`);
          deletionResults.payments = deletedPayments.deletedCount;

          // 14. Delete reservations
          const deletedReservations = await reservationModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedReservations.deletedCount} reservations`);
          deletionResults.reservations = deletedReservations.deletedCount;

          // 15. Delete user packages related to this shop
          const deletedUserPackages = await userPackageModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedUserPackages.deletedCount} user packages`);
          deletionResults.userPackages = deletedUserPackages.deletedCount;

          // 16. Delete advertisements
          const deletedAdvertisements = await advertisementModel.deleteMany({ shop_id: shopId }, { session });
          console.log(`[AdminService] Deleted ${deletedAdvertisements.deletedCount} advertisements`);
          deletionResults.advertisements = deletedAdvertisements.deletedCount;

          // 17. Finally, delete the shop itself
          const deletedShop = await shopModel.findByIdAndDelete(shopId, { session });
          console.log(`[AdminService] Deleted shop: ${deletedShop.name}`);
          deletionResults.shop = 1;

          console.log(`[AdminService] Shop deletion completed successfully`);
        });

        console.log(`[AdminService] Transaction completed successfully`);

        return {
          code: "200",
          message: "Shop and all related data deleted successfully",
          metadata: {
            shopId,
            shopName: shop.name,
            deletionSummary: deletionResults,
            totalDeletedItems: Object.values(deletionResults).reduce((sum, count) => sum + count, 0)
          }
        };

      } catch (transactionError) {
        console.error(`[AdminService] Transaction failed:`, transactionError);
        throw transactionError;
      } finally {
        await session.endSession();
      }

    } catch (error) {
      console.error(`[AdminService] Error deleting shop ${shopId}:`, error);
      return {
        code: "500",
        message: `Failed to delete shop: ${error.message}`,
        status: "error",
      };
    }
  };
}

module.exports = new AdminService();