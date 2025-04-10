"use strict";

const JWT = require("jsonwebtoken");
const { createTokenPair } = require("./jwt");
const {
  AuthFailureError,
  BadRequestError,
  ForbiddenError,
} = require("../configs/error.response");
const { HEADER } = require("../constants/enum");
// Hàm kiểm tra xác thực
const checkAuth = async (req, res, next) => {
  try {
    // Step 1: Lấy accessToken từ header
    const authHeader = req.headers[HEADER.AUTHORIZATION];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new BadRequestError("No access token provided or invalid format");
    }
    const accessToken = authHeader.split(" ")[1];

    // Step 2: Lấy refreshToken từ header (nếu có)
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN];

    // Step 3: Xác minh accessToken
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    if (!accessTokenKey) {
      throw new BadRequestError("Access token secret key not defined");
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
      // Nếu accessToken hết hạn và có refreshToken trong header
      if (error.name === "TokenExpiredError" && refreshToken) {
        const newTokens = await refreshTokenHandler(refreshToken);
        req.user = newTokens.user; // Gắn thông tin user vào req
        res.set("x-access-token", newTokens.accessToken); // Gửi token mới trong header
        res.set("x-refresh-token", newTokens.refreshToken);
        next();
      } else {
        throw new BadRequestError("Invalid or expired access token");
      }
    }
  } catch (error) {
    throw new AuthFailureError("Authentication failed");
  }
};

// Hàm xử lý làm mới token
const refreshTokenHandler = async (refreshToken) => {
  try {
    // Step 1: Xác minh refreshToken
    const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;
    if (!refreshTokenKey) {
      throw new BadRequestError("Refresh token secret key not defined");
    }

    const decodedRefresh = JWT.verify(refreshToken, refreshTokenKey);

    // Step 2: Tạo token pair mới
    const newTokens = await createTokenPair(
      {
        userId: decodedRefresh.userId,
        email: decodedRefresh.email,
        role: decodedRefresh.role,
      },
      process.env.ACCESS_TOKEN_SECRET_SIGNATURE,
      refreshTokenKey
    );

    // Step 3: Trả về thông tin user và token mới
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
    throw new BadRequestError("Invalid or expired refresh token");
  }
};

const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Step 1: Kiểm tra xem req.user có tồn tại không (từ checkAuth)
      if (!req.user || !req.user.role) {
        throw new BadRequestError("User information or role not found");
      }

      const userRole = req.user.role;

      // Step 2: Kiểm tra xem role của user có trong allowedRoles không
      if (!allowedRoles.includes(userRole)) {
        throw new BadRequestError(
          `Access denied. Required roles: ${allowedRoles.join(
            ", "
          )}. Your role: ${userRole}`
        );
      }

      next();
    } catch (error) {
      throw new ForbiddenError(
        `Access denied. Required roles: ${allowedRoles.join(
          ", "
        )}. Your role: ${req.user.role}`
      );
    }
  };
};

module.exports = { checkAuth, checkRole };
