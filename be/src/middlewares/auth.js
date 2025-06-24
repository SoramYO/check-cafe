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
    // Lấy accessToken từ header với format Bearer
    const authHeader = req.headers[HEADER.AUTHORIZATION];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        code: "xxx",
        message: "No access token provided or invalid format",
        status: "error",
      });
    }
    const accessToken = authHeader.split(" ")[1];

    // Xác minh accessToken sử dụng ACCESS_TOKEN_SECRET_SIGNATURE
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    if (!accessTokenKey) {
      return res.status(500).json({
        code: "xxx",
        message: "Access token secret key not defined",
        status: "error",
      });
    }

    const decodeUser = JWT.verify(accessToken, accessTokenKey);
    if (decodeUser.role !== "ADMIN") {
      return res.status(403).json({
        code: "xxx",
        message: "Permission denied",
        status: "error",
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