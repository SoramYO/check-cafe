"use strict";

const JWT = require("jsonwebtoken");

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // Create a new access token and refresh token
    const accessToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "2 days",
    });
    const refreshToken = await JWT.sign(payload, privateKey, {
      algorithm: "RS256",
      expiresIn: "7 days",
    });

    // Verify the token
    JWT.verify(accessToken, publicKey, (err, decoded) => {
      if (err) {
        console.log({ error: "Invalid access token" });
      } else {
        console.log({ decoded });
      }
    });
    return { accessToken, refreshToken };
  } catch (error) {}
};

module.exports = {
  createTokenPair,
};
