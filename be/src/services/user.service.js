"use strict";

const userModel = require("../models/user.model");
const { USER_ROLE } = require("../constants/enum");
const { BadRequestError } = require("../configs/error.response");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const bcrypt = require("bcryptjs");
const {
  uploadImage,
  deleteImage,
  uploadSingleImage,
} = require("../helpers/cloudinaryHelper");
const reservationModel = require("../models/reservation.model");
const reviewModel = require("../models/review.model");

class userService {
  getProfile = async (req) => {
    try {
      // Step 1: Lấy userId từ req.user (đã qua checkAuth)
      const { userId } = req.user;
      if (!userId) {
        throw new BadRequestError("User authentication data is missing");
      }

      // Step 2: Tìm user
      const user = await userModel
        .findById(userId)
        .select(
          "_id full_name email phone avatar role points vip_status is_active"
        )
        .lean();
      //lấy lượt đặt chỗ
      const reservation = await reservationModel.find({ user_id: userId }).lean();
      const reservationCount = reservation.length;
      user.reservation_count = reservationCount;
      //lấy lượt đánh giá
      const review = await reviewModel.find({ user_id: userId }).lean();
      const reviewCount = review.length;
      user.review_count = reviewCount;

      if (!user) {
        throw new BadRequestError("User not found");
      }

      return { user };
    } catch (error) {
      throw new BadRequestError(error.message || "Failed to retrieve profile");
    }
  };

  updateProfile = async (req, { full_name, phone }) => {
    try {
      // Step 1: Lấy userId từ req.user
      const { userId } = req.user;
      if (!userId) {
        throw new BadRequestError("User authentication data is missing");
      }

      // Step 2: Kiểm tra input
      if (!full_name && !phone) {
        throw new BadRequestError(
          "At least one field (full_name or phone) must be provided"
        );
      }

      // Step 3: Tìm và cập nhật user
      const updateData = {};
      if (full_name) updateData.full_name = full_name;
      if (phone) updateData.phone = phone;

      const updatedUser = await userModel
        .findByIdAndUpdate(userId, updateData, {
          new: true,
          runValidators: true,
        })
        .select(
          "_id full_name email phone avatar role points vip_status is_active"
        );

      if (!updatedUser) {
        throw new BadRequestError("User not found");
      }

      return { user: updatedUser };
    } catch (error) {
      throw new BadRequestError(error.message || "Failed to update profile");
    }
  };

  changePassword = async (req, { oldPassword, newPassword }) => {
    try {
      // Step 1: Lấy userId từ req.user
      const { userId } = req.user;
      if (!userId) {
        throw new BadRequestError("User authentication data is missing");
      }

      // Step 2: Kiểm tra input
      if (!oldPassword || !newPassword) {
        throw new BadRequestError(
          "Both oldPassword and newPassword are required"
        );
      }

      // Step 3: Tìm user
      const user = await userModel.findById(userId);
      if (!user) {
        throw new BadRequestError("User not found");
      }

      // Step 4: Kiểm tra mật khẩu cũ
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        throw new BadRequestError("Old password is incorrect");
      }

      // Step 5: Mã hóa và cập nhật mật khẩu mới
      const passwordHash = await bcrypt.hash(newPassword, 10);
      user.password = passwordHash;
      await user.save();

      return { message: "Password changed successfully" };
    } catch (error) {
      throw new BadRequestError(error.message || "Failed to change password");
    }
  };

  updateAvatar = async (req) => {
    try {
      // Step 1: Lấy userId từ req.user
      const { userId } = req.user;
      if (!userId) {
        throw new BadRequestError("User authentication data is missing");
      }

      // Step 2: Kiểm tra file từ request
      const file = req.file; // File từ multer-storage-cloudinary
      if (!file) {
        throw new BadRequestError("Avatar file is required");
      }

      // Step 3: Tìm user hiện tại
      const user = await userModel.findById(userId);
      if (!user) {
        throw new BadRequestError("User not found");
      }

      // Step 4: Upload đã được multer-storage-cloudinary xử lý, chỉ cần lấy kết quả
      const { url, publicId } = await uploadSingleImage({
        file,
        folder: "checkafe/avatars",
        transformations: [{ width: 200, height: 200, crop: "fill" }],
      });

      // Step 5: Xóa avatar cũ (nếu có)
      if (user.avatarPublicId) {
        await deleteImage(user.avatarPublicId);
      }

      // Step 6: Cập nhật avatar và publicId
      user.avatar = url;
      user.avatarPublicId = publicId;
      const updatedUser = await user.save();

      return {
        user: {
          _id: updatedUser._id,
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          phone: updatedUser.phone,
          avatar: updatedUser.avatar,
          role: updatedUser.role,
          points: updatedUser.points,
          vip_status: updatedUser.vip_status,
          is_active: updatedUser.is_active,
        },
      };
    } catch (error) {
      throw new BadRequestError(error.message || "Failed to update avatar");
    }
  };

  // Admin manage users
  getUsers = async ({ page = 1, limit = 10, role, is_active, search }) => {
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
    if (is_active !== undefined) {
      query.is_active = is_active;
    }

    return await getPaginatedData({
      model: userModel,
      query,
      page,
      limit,
      select: "_id full_name email role is_active",
      search,
      searchFields: ["full_name", "email"],
    });
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
