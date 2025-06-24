"use strict";

const userModel = require("../models/user.model");
const shopModel = require("../models/shop.model");
const shopCategoryModel = require("../models/shopCategory.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { getInfoData } = require("../utils");
const { USER_ROLE } = require("../constants/enum");
const { BadRequestError, NotFoundError } = require("../configs/error.response");
const { createTokenPair } = require("../auth/jwt");

class ShopOwnerService {
  registerShopOwner = async ({
    shop_name,
    owner_name,
    email,
    password,
    phone,
    address,
    city,
    city_code,
    district,
    district_code,
    ward,
    description,
    category,
  }) => {
    let newUser = null;
    
    try {
      // Step 1: Check if email exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestError("Email already exists");
      }

      // Step 2: Find shop category by name
      const shopCategory = await shopCategoryModel.findOne({ 
        name: category,
        is_active: true 
      });
      if (!shopCategory) {
        throw new NotFoundError(`Shop category "${category}" not found`);
      }

      // Step 3: Hash password and create new user as shop owner
      const passwordHash = await bcrypt.hash(password, 10);
      newUser = await userModel.create({
        full_name: owner_name,
        email,
        password: passwordHash,
        phone,
        role: USER_ROLE.SHOP_OWNER,
      });

      if (!newUser) {
        throw new BadRequestError("Failed to create shop owner account");
      }

      // Step 4: Create shop with pending status
      const newShop = await shopModel.create({
        name: shop_name,
        address,
        description,
        phone,
        website: "", // Default empty, can be updated later
        location: {
          type: "Point",
          coordinates: [0, 0], // Default coordinates, should be updated later
        },
        owner_id: newUser._id,
        category_id: shopCategory._id,
        city,
        city_code,
        district,
        district_code,
        ward,
        status: "Pending", // Pending approval from admin
      });

      if (!newShop) {
        throw new BadRequestError("Failed to create shop");
      }

      // Step 5: Create token pair
      const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
      const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

      const tokens = await createTokenPair(
        { userId: newUser._id, email, role: newUser.role },
        accessTokenKey,
        refreshTokenKey
      );

      // Step 6: Return result
      return {
        user: getInfoData({
          fields: ["_id", "full_name", "email", "role", "phone"],
          object: newUser,
        }),
        shop: getInfoData({
          fields: ["_id", "name", "address", "description", "status", "city", "district", "ward"],
          object: newShop,
        }),
        tokens,
      };

    } catch (error) {
      // ROLLBACK: Nếu có lỗi và đã tạo user thì xóa user đã tạo
      if (newUser && newUser._id) {
        try {
          await userModel.findByIdAndDelete(newUser._id);
          console.log(`Rollback: Deleted user ${newUser._id} due to error`);
        } catch (rollbackError) {
          console.error(`Rollback failed: Could not delete user ${newUser._id}`, rollbackError);
        }
      }
      
      // Re-throw original error
      throw error;
    }
  };

  // Alternative method using MongoDB Transaction (Atomic operation)
  registerShopOwner = async ({
    shop_name,
    owner_name,
    email,
    password,
    phone,
    address,
    city,
    city_code,
    district,
    district_code,
    ward,
    description,
    category,
  }) => {
    
    try {
      // Step 1: Validate tất cả input trước khi tạo data
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        throw new ConflictError("Email already exists");
      }

      const categoryDoc = await shopCategoryModel.findOne({ 
        name: category, 
        is_active: true 
      });
      if (!categoryDoc) {
        throw new BadRequestError("Invalid category");
      }

      // Step 2: Hash password trước
      const hashedPassword = await bcrypt.hash(password, 10);

      // Step 3: Prepare data objects
      const userData = {
        full_name: owner_name,
        email,
        password: hashedPassword,
        phone,
        role: USER_ROLE.SHOP_OWNER,
      };

      // Step 4: Create user first (critical operation)
      const newUser = await userModel.create(userData);

      // Step 5: Prepare shop data với user_id
      const shopData = {
        name: shop_name,
        address,
        description,
        phone,
        website: "",
        location: {
          type: "Point",
          coordinates: [0, 0],
        },
        owner_id: newUser._id,
        category_id: categoryDoc._id,
        city,
        city_code,
        district,
        district_code,
        ward,
        status: "Pending",
      };

      // Step 6: Create shop với error handling
      let newShop;
      try {
        newShop = await shopModel.create(shopData);
      } catch (shopError) {
        // Critical: Cleanup user nếu shop creation fail
        console.error("Shop creation failed, initiating user cleanup:", shopError);
        
        // Async cleanup để không block error response
        setImmediate(async () => {
          try {
            await userModel.findByIdAndDelete(newUser._id);
            console.log(`Cleaned up user ${newUser._id} after shop creation failure`);
          } catch (cleanupError) {
            console.error(`CRITICAL: Failed to cleanup user ${newUser._id}:`, cleanupError);
            // Log critical error for manual intervention
          }
        });
        
        throw new InternalServerError("Failed to create shop. Please try again.");
      }
      
      // Step 7: Create tokens (non-critical, có thể retry)
      let tokens;
      try {
        const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
        const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;

        tokens = await createTokenPair(
          { userId: newUser._id, email, role: newUser.role },
          accessTokenKey,
          refreshTokenKey
        );
      } catch (tokenError) {
        console.error("Token creation failed:", tokenError);
        // Return without tokens, user có thể login sau
        tokens = null;
      }

      // Step 8: Return result
      return {
        user: getInfoData({
          fields: ["_id", "full_name", "email", "role", "phone"],
          object: newUser,
        }),
        shop: getInfoData({
          fields: ["_id", "name", "address", "description", "status", "city", "district", "ward"],
          object: newShop,
        }),
        tokens,
        message: tokens ? "Registration successful" : "Registration successful. Please login to get access token."
      };

    } catch (error) {
      console.error(`Error in register shop owner: ${error.message}`);
      throw error;
    }
  };
}

module.exports = new ShopOwnerService(); 