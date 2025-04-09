"use strict";

const JWT = require("jsonwebtoken");
const KeyTokenService = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const checkAdmin = async (req, res, next) => {
  try {
    const userId = req.headers[HEADER.CLIENT_ID];
    if (!userId) throw new Error("Invalid Request");

    const keyStore = await KeyTokenService.findByUserId(userId);
    if (!keyStore) throw new Error("Not found keyStore");

    const accessToken = req.headers[HEADER.AUTHORIZATION];
    if (!accessToken) throw new Error("Invalid Request");

    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (decodeUser.role !== "ADMIN") {
      return res.status(403).json({
        code: "xxx",
        message: "Permission denied",
      });
    }

    req.user = decodeUser;
    return next();
  } catch (error) {
    return res.status(401).json({
      code: "xxx",
      message: error.message,
      status: "error",
    });
  }
};

module.exports = {
  checkAdmin,
};