"use strict";

const userModel = require("../models/user.model");
const { USER_ROLE } = require("../constants/enum");
const { BadRequestError } = require("../configs/error.response");

class userService {
  getUsers = async ({ page = 1, limit = 10, role }) => {
    try {
      // Step 1: Xây dựng query filter
      const query = {};
      if (role) {
        const validRoles = Object.values(USER_ROLE);
        if (!validRoles.includes(role)) {
          throw new BadRequestError(
            `Invalid role value. Allowed roles: ${validRoles.join(", ")}`
          );
        }
        query.role = role;
      }
      //   if (is_active !== undefined) {
      //     if (typeof is_active !== "boolean") {
      //       throw new BadRequestError("is_active must be a boolean value");
      //     }
      //     query.is_active = is_active;
      //   }

      // Step 2: Tính toán phân trang
      const skip = (page - 1) * limit;
      const limitNum = parseInt(limit);

      // Step 3: Lấy danh sách users
      const users = await userModel
        .find(query)
        .select("_id full_name email role is_active")
        .skip(skip)
        .limit(limitNum)
        .lean();

      // Step 4: Đếm tổng số users khớp với query
      const total = await userModel.countDocuments(query);

      // Step 5: Trả về kết quả với metadata
      return {
        users,
        metadata: {
          page: parseInt(page),
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };
    } catch (error) {
      throw new BadRequestError(error.message || "Failed to retrieve users");
    }
  };

  manageUserAccount = async ({ userId, role, is_active }) => {
    try {
      // Step 1: Kiểm tra input
      if (!userId) {
        throw new BadRequestError("userId is required");
      }
      if (role === undefined && is_active === undefined) {
        throw new BadRequestError(
          "At least one field (role or is_active) must be provided"
        );
      }

      // Step 2: Tìm user
      const foundUser = await userModel.findById(userId);
      if (!foundUser) {
        throw new BadRequestError("User not found");
      }

      // Step 3: Kiểm tra và cập nhật role (nếu có)
      if (role !== undefined) {
        const validRoles = Object.values(USER_ROLE);
        if (!validRoles.includes(role)) {
          throw new BadRequestError(
            `Invalid role value. Allowed roles: ${validRoles.join(", ")}`
          );
        }
        foundUser.role = role;
      }

      // Step 4: Cập nhật is_active (nếu có)
      if (is_active !== undefined) {
        if (typeof is_active !== "boolean") {
          throw new BadRequestError("is_active must be a boolean value");
        }
        foundUser.is_active = is_active;
      }

      // Step 5: Lưu thay đổi
      const updatedUser = await foundUser.save();

      // Step 6: Trả về thông tin user đã cập nhật
      return {
        user: {
          _id: updatedUser._id,
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          role: updatedUser.role,
          is_active: updatedUser.is_active,
        },
      };
    } catch (error) {
      throw new BadRequestError(
        error.message || "Failed to manage user account"
      );
    }
  };
}

module.exports = new userService();
