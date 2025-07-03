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
    name,
    description,
    address,
    phone,
    website,
    latitude,
    longitude,
    owner_name,
    email,
    password,
    city = "",
    city_code = "",
    district = "",
    district_code = "",
    ward = "",
    category = "Cafe & Coffee Shop", // Default category
    amenities = [],
    theme_ids = [],
    opening_hours = [],
  }) => {
    let newUser = null;
    
    try {
      // Step 1: Check if email exists
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        throw new BadRequestError("Email already exists");
      }

      // Step 2: Find shop category by name (only if category is provided)
      let shopCategory = null;
      if (category) {
        shopCategory = await shopCategoryModel.findOne({ 
          name: category,
          is_active: true 
        });
        if (!shopCategory) {
          // If category not found, try to find a default category
          shopCategory = await shopCategoryModel.findOne({ 
            is_active: true 
          });
          if (!shopCategory) {
            throw new NotFoundError("No active shop categories found");
          }
        }
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
        name,
        address,
        description,
        phone,
        website,
        location: {
          type: "Point",
          coordinates: [longitude, latitude], // MongoDB expects [longitude, latitude]
        },
        owner_id: newUser._id,
        category_id: shopCategory ? shopCategory._id : null,
        city,
        city_code,
        district,
        district_code,
        ward,
        amenities,
        theme_ids,
        opening_hours,
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
}

module.exports = new ShopOwnerService(); 