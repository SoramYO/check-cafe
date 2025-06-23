"use strict";

const userModel = require("../models/user.model");
const shopModel = require("../models/shop.model");
const bcrypt = require("bcryptjs");
const { getInfoData } = require("../utils");
const { USER_ROLE } = require("../constants/enum");
const { BadRequestError } = require("../configs/error.response");
const { createTokenPair } = require("../auth/jwt");

class AccessService {
  signUp = async ({ full_name, email, password, phone }) => {
    // Step 1: Check if email exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }

    // Step 2: Hash password and create new user
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      full_name,
      email,
      password: passwordHash,
      role: USER_ROLE.CUSTOMER,
      phone,
    });

    if (newUser) {
      // Step 3: Create token pair
      const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
      const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

      // Tạo payload cho token
      const tokenPayload = { 
        userId: newUser._id, 
        email, 
        role: newUser.role 
      };

      // Nếu user là SHOP_OWNER, thêm shop_id vào token (nếu có)
      if (newUser.role === USER_ROLE.SHOP_OWNER) {
        const userShop = await shopModel.findOne({ owner_id: newUser._id });
        if (userShop) {
          tokenPayload.shop_id = userShop._id;
        }
      }

      const tokens = await createTokenPair(
        tokenPayload,
        accessTokenKey,
        refreshTokenKey
      );

      // Step 5: Trả về kết quả
      return {
        user: getInfoData({
          fields: ["_id", "full_name", "email", "role", "phone"],
          object: newUser,
        }),
        tokens,
      };
    }

    return {
      data: null,
    };
  };

  signIn = async ({ email, password, refreshToken = null }) => {
    // Step 1: Check if email exists
    const foundUser = await userModel.findOne({ email });
    if (!foundUser) {
      throw new BadRequestError("Email not exists");
    }

    // Step 2: Check if account is active
    if (!foundUser.is_active) {
      throw new BadRequestError("Account is inactive");
    }

    // Step 3: Check if password is correct
    const isMatch = await bcrypt.compare(password, foundUser.password);
    if (!isMatch) {
      throw new BadRequestError("Password is incorrect");
    }

    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

    // Kiểm tra xem các khóa có tồn tại không
    if (!accessTokenKey || !refreshTokenKey) {
      throw new Error("Secret keys are not defined in environment variables");
    }

    // Step 5: Create token pair
    // Tạo payload cho token
    const tokenPayload = { 
      userId: foundUser._id, 
      email, 
      role: foundUser.role 
    };

    // Nếu user là SHOP_OWNER, thêm shop_id vào token (nếu có)
    if (foundUser.role === USER_ROLE.SHOP_OWNER) {
      const userShop = await shopModel.findOne({ owner_id: foundUser._id });
      if (userShop) {
        tokenPayload.shop_id = userShop._id;
      }
    }

    const tokens = await createTokenPair(
      tokenPayload,
      accessTokenKey,
      refreshTokenKey
    );

    return {
      user: getInfoData({
        fields: ["_id", "full_name", "email", "role", "avatar", "is_active", "points", "vip_status", "phone"],
        object: foundUser,
      }),
      tokens,
    };
  };

  signOut = async ({ userId }) => {
    try {
      if (!userId) {
        throw new BadRequestError("userId is required");
      }

      const foundUser = await userModel.findById(userId);
      if (!foundUser) {
        throw new BadRequestError("User not found");
      }
      return {
        message: "Logout successful",
      };
    } catch (error) {
      throw new BadRequestError(error.message || "Logout failed");
    }
  };

  // Method để refresh token khi shop owner được assign shop mới
  refreshTokenWithShopInfo = async ({ userId }) => {
    try {
      const foundUser = await userModel.findById(userId);
      if (!foundUser) {
        throw new BadRequestError("User not found");
      }

      const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
      const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

      if (!accessTokenKey || !refreshTokenKey) {
        throw new Error("Secret keys are not defined in environment variables");
      }

      // Tạo payload cho token
      const tokenPayload = { 
        userId: foundUser._id, 
        email: foundUser.email, 
        role: foundUser.role 
      };

      // Nếu user là SHOP_OWNER, thêm shop_id vào token (nếu có)
      if (foundUser.role === USER_ROLE.SHOP_OWNER) {
        const userShop = await shopModel.findOne({ owner_id: foundUser._id });
        if (userShop) {
          tokenPayload.shop_id = userShop._id;
        }
      }

      const tokens = await createTokenPair(
        tokenPayload,
        accessTokenKey,
        refreshTokenKey
      );

      return {
        user: getInfoData({
          fields: ["_id", "full_name", "email", "role", "avatar", "is_active", "points", "vip_status", "phone"],
          object: foundUser,
        }),
        tokens,
        shop_id: tokenPayload.shop_id || null,
      };
    } catch (error) {
      throw new BadRequestError(error.message || "Failed to refresh token");
    }
  };

}

module.exports = new AccessService();
