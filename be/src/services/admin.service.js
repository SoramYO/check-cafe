"use strict";

const userModel = require("../models/user.model");
const advertisementModel = require("../models/advertisement.model");
const reservationModel = require("../models/reservation.model");
const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const { createTokenPair } = require("../auth/authUtils");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");

class AdminService {
  // Auth
  login = async ({ email, password }) => {
    try {
      const admin = await userModel.findOne({ email, role: "ADMIN" });
      if (!admin) {
        return {
          code: "xxx",
          message: "Admin not found",
          status: "error",
        };
      }

      const match = await bcrypt.compare(password, admin.password);
      if (!match) {
        return {
          code: "xxx",
          message: "Invalid password",
          status: "error",
        };
      }

      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: { type: "pkcs1", format: "pem" },
        privateKeyEncoding: { type: "pkcs1", format: "pem" },
      });

      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: admin._id,
        publicKey,
      });

      const tokens = await createTokenPair(
        { userId: admin._id, email, role: "ADMIN" },
        publicKeyString,
        privateKey
      );

      return {
        code: "200",
        metadata: { tokens },
        message: "Login successful",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  logout = async (user) => {
    try {
      await KeyTokenService.removeKeyById(user._id);
      return {
        code: "200",
        message: "Logout successful",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  changePassword = async (user, { currentPassword, newPassword }) => {
    try {
      const admin = await userModel.findById(user._id);
      const match = await bcrypt.compare(currentPassword, admin.password);
      if (!match) {
        return {
          code: "xxx",
          message: "Current password is incorrect",
          status: "error",
        };
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await userModel.findByIdAndUpdate(user._id, { password: passwordHash });

      return {
        code: "200",
        message: "Password changed successfully",
      };
    } catch (error) {
      return {
        code: "xxx",
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
}

module.exports = new AdminService();