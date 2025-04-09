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
}

module.exports = new AdminService();