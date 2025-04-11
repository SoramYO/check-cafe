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
      return res.status(BadRequestError.prototype.status).json({
        message: "No access token provided or invalid format",
        status: BadRequestError.prototype.status,
      });
    }
    const accessToken = authHeader.split(" ")[1];

    // Step 2: Lấy refreshToken từ header (nếu có)
    const refreshToken = req.headers[HEADER.REFRESH_TOKEN];

    // Step 3: Xác minh accessToken
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET_SIGNATURE;
    if (!accessTokenKey) {
      return res.status(BadRequestError.prototype.status).json({
        message: "Access token secret key not defined",
        status: BadRequestError.prototype.status,
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
      // Nếu accessToken hết hạn và có refreshToken trong header
      if (error.name === "TokenExpiredError" && refreshToken) {
        const newTokens = await refreshTokenHandler(refreshToken);
        req.user = newTokens.user;
        res.set("x-access-token", newTokens.accessToken);
        res.set("x-refresh-token", newTokens.refreshToken);
        next();
      } else {
        return res.status(AuthFailureError.prototype.status).json({
          message: "Invalid or expired access token",
          status: AuthFailureError.prototype.status,
        });
      }
    }
  } catch (error) {
    // Bắt lỗi tổng quát và trả về response
    const status = error.status || 401; // Mặc định là 401 nếu không có status
    return res.status(status).json({
      message: "User không có quyền" || error.message,
      status,
    });
  }
};

// Hàm xử lý làm mới token
const refreshTokenHandler = async (refreshToken) => {
  try {
    const refreshTokenKey = process.env.REFRESH_TOKEN_SECRET_SIGNATURE;
    if (!refreshTokenKey) {
      throw new BadRequestError("Refresh token secret key not defined");
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
    throw new BadRequestError("Invalid or expired refresh token");
  }
};

// Hàm kiểm tra role
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(ForbiddenError.prototype.status).json({
          message: "User information or role not found",
          status: ForbiddenError.prototype.status,
        });
      }

      const userRole = req.user.role;

      if (!allowedRoles.includes(userRole)) {
        return res.status(ForbiddenError.prototype.status).json({
          message: `User không có quyền. Required roles: ${allowedRoles.join(
            ", "
          )}. Your role: ${userRole}`,
          status: ForbiddenError.prototype.status,
        });
      }

      next();
    } catch (error) {
      return res.status(ForbiddenError.prototype.status).json({
        message: `User không có quyền. Required roles: ${allowedRoles.join(
          ", "
        )}. Your role: ${req.user?.role || "unknown"}`,
        status: ForbiddenError.prototype.status,
      });
    }
  };
};

module.exports = { checkAuth, checkRole };
