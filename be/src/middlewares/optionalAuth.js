"use strict";

const JWT = require("jsonwebtoken");
const { findByUserId } = require("../services/keyToken.service");

const optionalAuth = async (req, res, next) => {
  try {
    const authorization = req.headers.authorization;
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      // No authorization header, continue as anonymous user
      req.user = null;
      return next();
    }

    const accessToken = authorization.split(' ')[1];
    
    if (!accessToken) {
      req.user = null;
      return next();
    }

    try {
      const decodeUser = JWT.verify(accessToken, process.env.JWT_SECRET);
      
      if (!decodeUser) {
        req.user = null;
        return next();
      }

      const keyStore = await findByUserId(decodeUser.userId);
      
      if (!keyStore) {
        req.user = null;
        return next();
      }

      req.user = decodeUser;
      return next();
    } catch (verifyError) {
      // Token invalid, continue as anonymous
      req.user = null;
      return next();
    }
  } catch (error) {
    // Any error, continue as anonymous
    req.user = null;
    return next();
  }
};

module.exports = optionalAuth; 