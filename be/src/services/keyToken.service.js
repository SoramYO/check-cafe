"use strict";

const keytokenModel = require("../models/keytoken.model");

class KeyTokenService {
  static createKeyToken = async ({ userId, publicKey }) => {
    try {
      const publicKeyString = publicKey.toString();
      const tokens = await keytokenModel.create({
        user: userId,
        publicKey: publicKeyString,
      });
      return tokens ? tokens.publicKey : null;
    } catch (error) {
      return error;
    }
  };

  static findByUserId = async (userId) => {
    return await keytokenModel.findOne({ user: userId });
  };

  static removeKeyById = async (userId) => {
    return await keytokenModel.findOneAndDelete({ user: userId });
  };
}

module.exports = KeyTokenService;