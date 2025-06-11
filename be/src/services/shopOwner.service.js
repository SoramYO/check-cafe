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
  registerShopOwnerWithTransaction = async ({
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
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
      
      // Tất cả operations trong transaction
      const existingUser = await userModel.findOne({ email }).session(session);
      const [newUser] = await userModel.create([{
        full_name: owner_name,
        email,
        password: await bcrypt.hash(password, 10),
        phone,
        role: USER_ROLE.SHOP_OWNER,
      }], { session });
      const [newShop] = await shopModel.create([{
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
        category_id: await shopCategoryModel.findOne({ name: category, is_active: true }).session(session)._id,
        city,
        city_code,
        district,
        district_code,
        ward,
        status: "Pending", // Pending approval from admin
      }], { session });
      
      // Commit transaction
      await session.commitTransaction();
      
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
      // 🔄 ROLLBACK: MongoDB tự động rollback TẤT CẢ thay đổi
      await session.abortTransaction();
      console.log(`Transaction aborted due to error: ${error.message}`);
      throw error;
    } finally {
      session.endSession();
    }
  };
}

module.exports = new ShopOwnerService(); 