"use strict";

const JWT = require("jsonwebtoken");

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

module.exports = {
  createTokenPair,
};
