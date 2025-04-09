"use strict";

const shopModel = require("../models/shop.model");
const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair } = require("../auth/authUtils");
const { getInfoData } = require("../utils");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

const RoleUser = {
  USER: "USER",
  ADMIN: "ADMIN",
};

class AccessService {
  signUp = async ({ name, email, password }) => {
    try {
      // Step 1 : Check email exists
      const hodelShop = await shopModel.findOne({ email });
      console.log("🚀 ~ AccessService ~ signUp= ~ hodelShop:", hodelShop);

      if (hodelShop) {
        return {
          code: "xxx",
          message: "Shop already registered",
          status: "error",
        };
      }

      // Step 2 : Create new shop
      const passwordHash = await bcrypt.hash(password, 10);
      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        // created privateKey, publicKey
        const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
          modulusLength: 4096,
          publicKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
          privateKeyEncoding: {
            type: "pkcs1",
            format: "pem",
          },
        });

        // created keyToken
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        if (!publicKeyString) {
          return {
            code: "xxx",
            message: "Sign-up failed, publicKey error",
            status: "error",
          };
        }

        // Create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKeyString,
          privateKey
        );

        return {
          code: "201",
          metadata: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
          message: "Sign-up success",
        };
      }

      return {
        code: "200",
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  login = async ({ email, password }) => {
    try {
      const shop = await shopModel.findOne({ email });
      if (!shop) {
        return {
          code: "xxx",
          message: "Shop not registered",
          status: "error",
        };
      }

      const match = await bcrypt.compare(password, shop.password);
      if (!match) {
        return {
          code: "xxx",
          message: "Authentication failed",
          status: "error",
        };
      }

      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });

      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: shop._id,
        publicKey,
      });

      const tokens = await createTokenPair(
        { userId: shop._id, email },
        publicKeyString,
        privateKey
      );

      return {
        code: "200",
        metadata: {
          shop: getInfoData({
            fields: ["_id", "name", "email"],
            object: shop,
          }),
          tokens,
        },
        message: "Login success",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  userSignUp = async ({ full_name, email, password, phone }) => {
    try {
      const existingUser = await userModel.findOne({ email });
      if (existingUser) {
        return {
          code: "xxx",
          message: "Email already registered",
          status: "error",
        };
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newUser = await userModel.create({
        full_name,
        email,
        password: passwordHash,
        phone,
        role: RoleUser.USER,
      });

      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });

      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: newUser._id,
        publicKey,
      });

      const tokens = await createTokenPair(
        { userId: newUser._id, email },
        publicKeyString,
        privateKey
      );

      return {
        code: "201",
        metadata: {
          user: getInfoData({
            fields: ["_id", "full_name", "email", "phone"],
            object: newUser,
          }),
          tokens,
        },
        message: "User registration successful",
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };

  userLogin = async ({ email, password }) => {
    try {
      const user = await userModel.findOne({ email });
      if (!user) {
        return {
          code: "xxx",
          message: "User not found",
          status: "error",
        };
      }

      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        return {
          code: "xxx",
          message: "Invalid password",
          status: "error",
        };
      }

      const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        modulusLength: 4096,
        publicKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
        privateKeyEncoding: {
          type: "pkcs1",
          format: "pem",
        },
      });

      const publicKeyString = await KeyTokenService.createKeyToken({
        userId: user._id,
        publicKey,
      });

      const tokens = await createTokenPair(
        { userId: user._id, email },
        publicKeyString,
        privateKey
      );

      return {
        code: "200",
        metadata: {
          user: getInfoData({
            fields: ["_id", "full_name", "email", "phone"],
            object: user,
          }),
          tokens,
        },
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
}

module.exports = new AccessService();