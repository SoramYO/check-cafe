"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
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
class AccessService {
  signUp = async ({ name, email, password }) => {
    try {
      // Step 1 : Check email exists
      const hodelShop = await shopModel.findOne({ email });
      console.log("🚀 ~ AccessService ~ signUp= ~ hodelShop:", hodelShop);

      if (hodelShop) {
        return {
          code: "xxx",
          message: "Shop already resgistered",
          status: "error",
        };
      }

      // Step 2 : Create new shop
      const passwordHash = await bcrypt.hash(password, 10);
      const newShop = new shopModel({
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

        console.log({ privateKey, publicKey });

        // created keyToken
        const publicKeyString = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
        });

        console.log({ publicKeyString });

        if (!publicKeyString) {
          return {
            code: "xxx",
            message: "Sign-up failed, publicKey error",
            status: "error",
          };
        }

        const publicKeyObject = crypto.createPublicKey(publicKeyString);
        console.log(
          "🚀 ~ AccessService ~ signUp= ~ publicKeyObject:",
          publicKeyObject
        );

        // Create token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email, roles: newShop.roles },
          publicKeyString,
          privateKey
        );
        console.log("Created token success", { tokens });

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
        metadata: nul,
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
