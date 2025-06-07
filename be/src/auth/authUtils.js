"use strict";

const JWT = require("jsonwebtoken");
const User = require("../models/user.model");
const { AuthFailureError, NotFoundError } = require("../configs/error.response");

const createTokenPair = async (payload, accessTokenKey, refreshTokenKey) => {
  try {
    // Create a new access token and refresh token
    const accessToken = await JWT.sign(payload, accessTokenKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, refreshTokenKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

const authenticationV2 = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthFailureError('Authentication required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AuthFailureError('Authentication token required');
    }

    try {
      // Verify token (assuming you have a secret key in environment variables)
      const decoded = JWT.verify(token, process.env.JWT_ACCESS_SECRET || 'your-secret-key');
      
      // Get user from database
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!user.is_active) {
        throw new AuthFailureError('User account is deactivated');
      }

      // Add user to request object
      req.user = {
        userId: user._id,
        email: user.email,
        role: user.role,
        full_name: user.full_name
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        throw new AuthFailureError('Token expired');
      } else if (jwtError.name === 'JsonWebTokenError') {
        throw new AuthFailureError('Invalid token');
      } else {
        throw jwtError;
      }
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTokenPair,
  authenticationV2,
};
