"use strict";

const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const { getInfoData } = require("../utils");
const { USER_ROLE } = require("../constants/enum");
const { BadRequestError } = require("../configs/error.response");
const { createTokenPair } = require("../auth/jwt");

class AccessService {
  signUp = async ({ full_name, email, password }) => {
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
    });

    if (newUser) {
      // Step 3: Create token pair
      const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
      const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

      const tokens = await createTokenPair(
        { userId: newUser._id, email, role: newUser.role },
        accessTokenKey,
        refreshTokenKey
      );

      // Step 5: Trả về kết quả
      return {
        user: getInfoData({
          fields: ["_id", "full_name", "email", "role"],
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
    const tokens = await createTokenPair(
      { userId: foundUser._id, email, role: foundUser.role },
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

}

module.exports = new AccessService();
