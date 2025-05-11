"use strict";

const JWT = require("jsonwebtoken");
const { createTokenPair } = require("./jwt");
const { HEADER, USER_ROLE } = require("../constants/enum");
const shopModel = require("../models/shop.model");

// Hàm kiểm tra xác thực
const checkAuth = async (req, res, next) => {
  try {
    // Step 1: Lấy accessToken từ header
    const authHeader = req.headers[HEADER.AUTHORIZATION];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "No access token provided or invalid format",
      });
    }
    const accessToken = authHeader.split(" ")[1];

    // Step 2: Lấy refreshToken từ header (nếu có)
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN];

    // Step 3: Xác minh accessToken
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    if (!accessTokenKey) {
      return res.status(500).json({
        status: "error",
        code: 500,
        message: "Access token secret key not defined",
      });
    }

    try {
      // Decode accessToken nếu hợp lệ
      const decoded = JWT.verify(accessToken, accessTokenKey);
      req.user = {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch (error) {
      // Nếu accessToken hết hạn và có refreshToken
      if (error.name === "TokenExpiredError" && refreshToken) {
        const newTokens = await refreshTokenHandler(refreshToken);
        req.user = newTokens.user;
        res.set("x-access-token", newTokens.accessToken);
        res.set("x-refresh-token", newTokens.refreshToken);
        next();
      } else {
        return res.status(401).json({
          status: "error",
          code: 401,
          message: "Invalid or expired access token",
        });
      }
    }
  } catch (error) {
    console.error("checkAuth error:", error.message);
    return res.status(error.code || 401).json({
      status: "error",
      code: error.code || 401,
      message: error.message || "Authentication failed",
    });
  }
};

// Hàm xử lý làm mới token
const refreshTokenHandler = async (refreshToken) => {
  try {
    const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;
    if (!refreshTokenKey) {
      return {
        status: "error",
        code: 500,
        message: "Refresh token secret key not defined",
      };
    }

    const decodedRefresh = JWT.verify(refreshToken, refreshTokenKey);

    const newTokens = await createTokenPair(
      {
        userId: decodedRefresh.userId,
        email: decodedRefresh.email,
        role: decodedRefresh.role,
      },
      process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
      refreshTokenKey
    );

    return {
      user: {
        userId: decodedRefresh.userId,
        email: decodedRefresh.email,
        role: decodedRefresh.role,
      },
      accessToken: newTokens.accessToken,
      refreshToken: newTokens.refreshToken,
    };
  } catch (error) {
    console.error("refreshTokenHandler error:", error.message);
    return {
      status: "error",
      code: 401,
      message: error.message || "Invalid or expired refresh token",
    };
  }
};

// Hàm kiểm tra role
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({
          status: "error",
          code: 403,
          message: "User information or role not found",
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          status: "error",
          code: 403,
          message: `User does not have permission. Required roles: ${allowedRoles.join(
            ", "
          )}. Your role: ${userRole}`,
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: `User does not have permission. Required roles: ${allowedRoles.join(
          ", "
        )}. Your role: ${req.user?.role || "unknown"}`,
      });
    }
  };
};

// Middleware kiểm tra quyền sở hữu quán
const checkShopOwnership = async (req, res, next) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;

  if (role === USER_ROLE.ADMIN) return next();
  const shop = await shopModel.findById(shopId);
  if (!shop) {
    return res.status(404).json({
      status: "error",
      code: 404,
      message: "Shop not found",
    });
  }
  if (shop.owner_id.toString() !== userId) {
      return res.status(403).json({
        status: "error",
        code: 403,
        message: "You are not authorized to perform this action",
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({
      status: "error",
      code: 403,
      message: "You are not authorized to perform this action",
    });
  }
};

module.exports = { checkAuth, checkRole, checkShopOwnership };
