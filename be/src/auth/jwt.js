import JWT from "jsonwebtoken";

export const createTokenPair = async (
  payload,
  accessTokenKey,
  refreshTokenKey
) => {
  try {
    // Tạo access token
    const accessToken = await JWT.sign(payload, accessTokenKey, {
      algorithm: "HS256",
      expiresIn: "2 days",
    });

    // Tạo refresh token
    const refreshToken = await JWT.sign(payload, refreshTokenKey, {
      algorithm: "HS256",
      expiresIn: "7 days",
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error creating token pair:", error.message);
    throw new Error("Failed to create token pair");
  }
};

export const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
