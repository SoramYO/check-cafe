"use strict";

const userModel = require("../models/user.model");
const userFavoriteModel = require("../models/userFavorite.model");
const { USER_ROLE } = require("../constants/enum");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const bcrypt = require("bcryptjs");
const {
  uploadImage,
  deleteImage,
  uploadSingleImage,
} = require("../helpers/cloudinaryHelper");
const reservationModel = require("../models/reservation.model");
const reviewModel = require("../models/review.model");
const packageModel = require("../models/package.model");
const paymentModel = require("../models/payment.model");
const payOS = require("../configs/payos.config");
const crypto = require('crypto');
const userPackageModel = require("../models/userPackage.model");
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
      select: "_id full_name email avatar role is_active createdAt",
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

  saveFcmToken = async (req) => {
    const foundUser = await userModel.findById(req.user.userId);
    if (!foundUser) {
      throw new BadRequestError("User not found");
    }
    foundUser.fcm_token = req.body.fcm_token;
    await foundUser.save();
    return {
      message: "FCM token saved successfully",
    };
  };

  addFavoriteShop = async (req) => {
    const { userId } = req.user;
    const { shopId } = req.body;
    let userFavorite = await userFavoriteModel.findOne({ user_id: userId });
    if (!userFavorite) {
      userFavorite = await userFavoriteModel.create({
        user_id: userId,
        favorite_shops: [shopId],
        favorite_menu_items: [],
      });
    } else {
      if (!userFavorite.favorite_shops.includes(shopId)) {
        userFavorite.favorite_shops.push(shopId);
        await userFavorite.save();
      }
    }
    return {
      message: "Favorite shop added successfully",
    };
  };

  addFavoriteMenuItem = async (req) => {
    const { userId } = req.user;
    const { menuItemId } = req.body;
    let userFavorite = await userFavoriteModel.findOne({ user_id: userId });
    if (!userFavorite) {
      userFavorite = await userFavoriteModel.create({
        user_id: userId,
        favorite_shops: [],
        favorite_menu_items: [menuItemId],
      });
    } else {
      if (!userFavorite.favorite_menu_items.includes(menuItemId)) {
        userFavorite.favorite_menu_items.push(menuItemId);
        await userFavorite.save();
      }
    }
    return {
      message: "Favorite menu item added successfully",
    };
  };

  getFavoriteShop = async (req) => {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const userFavorite = await userFavoriteModel
      .findOne({ user_id: userId })
      .populate({
        path: 'favorite_shops',
        populate: {
          path: 'shopImages',
        },
      });
    const favoriteShops = userFavorite ? userFavorite.favorite_shops : [];
    const total = favoriteShops.length;
    const paginated = favoriteShops.slice((page - 1) * limit, page * limit);
    return {
      data: paginated,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  getFavoriteProduct = async (req) => {
    const { userId } = req.user;
    const { page = 1, limit = 10 } = req.query;
    const userFavorite = await userFavoriteModel.findOne({ user_id: userId }).populate({
      path: 'favorite_menu_items',
      populate: {
        path: 'images',
      },
    });
    const favoriteMenuItems = userFavorite ? userFavorite.favorite_menu_items : [];
    const total = favoriteMenuItems.length;
    const paginated = favoriteMenuItems.slice((page - 1) * limit, page * limit);
    return {
      data: paginated,
      metadata: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  };

  removeFavoriteShop = async (req) => {
    const { userId } = req.user;
    const { shopId } = req.body;
    const userFavorite = await userFavoriteModel.findOne({ user_id: userId });
    if (!userFavorite) {
      throw new BadRequestError("User favorite not found");
    }
    userFavorite.favorite_shops = userFavorite.favorite_shops.filter(id => id.toString() !== shopId);
    await userFavorite.save();
    return {
      message: "Favorite shop removed successfully",
    };
  };

  removeFavoriteProduct = async (req) => {
    const { userId } = req.user;
    const { menuItemId } = req.body;
    const userFavorite = await userFavoriteModel.findOne({ user_id: userId });
    if (!userFavorite) {
      throw new BadRequestError("User favorite not found");
    }
    userFavorite.favorite_menu_items = userFavorite.favorite_menu_items.filter(id => id.toString() !== menuItemId);
    await userFavorite.save();
    return {
      message: "Favorite product removed successfully",
    };
  };

  buyVipPackage = async (req) => {
    const { userId } = req.user;
    const { packageId } = req.body;
    if (!packageId) {
      throw new BadRequestError("Package not found");
    }
    const packageVip = await packageModel.findById(packageId);
    if (!packageVip) {
      throw new BadRequestError("Package not found");
    }



    const body = {
      orderCode: crypto.randomInt(100000, 999999),
      amount: packageVip.price,
      description: `Mua gói ${packageVip.name}`,
      cancelUrl: `https://soramyo.id.vn/cancel.html`,
      returnUrl: `https://soramyo.id.vn/success.html`,
    }
    const paymentLinkResponse = await payOS.createPaymentLink(body);

    const payment = await paymentModel.create({
      orderCode: body.orderCode,
      user_id: userId,
      package_id: packageVip._id,
      amount: packageVip.price,
      status: "pending",
    });


    return {
      paymentLinkResponse
    };
  };

  receiveHook = async (req) => {
    const webhookData = payOS.verifyPaymentWebhookData(req.body)
    console.log(webhookData);
    const payment = await paymentModel.findOne({ orderCode: webhookData.orderCode });
    console.log("payment", payment);
    if (!payment) throw new NotFoundError("Payment not found");

    if (payment.status === "success") return;


    if (webhookData.code === '00') {

      payment.status = "success";
      payment.webhookData = webhookData;
      await payment.save();

      // Fetch the package to get duration
      const pkg = await packageModel.findById(payment.package_id).lean();
      if (!pkg) throw new NotFoundError("Package not found for user package creation");
      const durationDays = pkg.duration;
      // Check for existing active package
      const existingActive = await userPackageModel.findOne({ user_id: payment.user_id});
      if (existingActive) {
        console.log("existingActive", existingActive);
        // Nếu đã có gói còn hạn, cộng thêm thời gian vào end_date hiện tại
        const newEndDate = new Date(existingActive.end_date.getTime() + durationDays * 24 * 60 * 60 * 1000);
        existingActive.end_date = newEndDate;
        await existingActive.save();
      } else {
        // Nếu chưa có gói còn hạn, tạo mới từ thời điểm hiện tại (UTC+7)
        const now = new Date();
        const startDate = new Date(now.getTime() + 7 * 60 * 60 * 1000);
        const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);
        const newUserPackage = await userPackageModel.create({
          user_id: payment.user_id,
          package_id: payment.package_id,
          payment_id: payment._id,
          duration: durationDays,
          start_date: startDate,
          end_date: endDate,
          status: 'active',
        });
        console.log("Created userPackage:", newUserPackage);
      }

      await userModel.findByIdAndUpdate(payment.user_id, { vip_status: true });


    } else {
      payment.status = "failed";
      payment.webhookData = webhookData;
      await payment.save();
    }
  };
}

module.exports = new userService();
