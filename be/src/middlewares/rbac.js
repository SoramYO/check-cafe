"use strict";

const { ForbiddenError } = require("../configs/error.response");

// Define permissions for each role
const ROLE_PERMISSIONS = {
  ADMIN: [
    'users:read',
    'users:write',
    'users:delete',
    'shops:read',
    'shops:write',
    'shops:delete',
    'analytics:read',
    'analytics:write',
    'advertisements:read',
    'advertisements:write',
    'advertisements:delete',
    'themes:read',
    'themes:write',
    'themes:delete',
    'promotions:read',
    'promotions:write',
    'promotions:delete',
    'reports:read',
    'notifications:read',
    'notifications:write',
    'settings:read',
    'settings:write'
  ],
  SHOP_OWNER: [
    'shop:read',
    'shop:write',
    'reservations:read',
    'reservations:write',
    'menu:read',
    'menu:write',
    'staff:read',
    'staff:write',
    'analytics:read_own',
    'reviews:read',
    'profile:read',
    'profile:write'
  ],
  USER: [
    'shops:read',
    'reservations:read_own',
    'reservations:write_own',
    'reviews:read',
    'reviews:write_own',
    'profile:read_own',
    'profile:write_own',
    'favorites:read_own',
    'favorites:write_own'
  ]
};

// Check if user has specific permission
const hasPermission = (userRole, requiredPermission) => {
  const rolePermissions = ROLE_PERMISSIONS[userRole] || [];
  return rolePermissions.includes(requiredPermission);
};

// Middleware to check permissions
const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      // Authentication should be done before this middleware
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { role } = req.user;
      
      if (!hasPermission(role, requiredPermission)) {
        throw new ForbiddenError(`Access denied. Required permission: ${requiredPermission}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check multiple permissions (user needs at least one)
const checkAnyPermission = (permissions = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { role } = req.user;
      const hasAnyPermission = permissions.some(permission => 
        hasPermission(role, permission)
      );

      if (!hasAnyPermission) {
        throw new ForbiddenError(`Access denied. Required one of: ${permissions.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check all permissions (user needs all)
const checkAllPermissions = (permissions = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ForbiddenError('Authentication required');
      }

      const { role } = req.user;
      const hasAllPermissions = permissions.every(permission => 
        hasPermission(role, permission)
      );

      if (!hasAllPermissions) {
        throw new ForbiddenError(`Access denied. Required all of: ${permissions.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    if (req.user.role !== 'ADMIN') {
      throw new ForbiddenError('Admin access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user is shop owner
const isShopOwner = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    if (req.user.role !== 'SHOP_OWNER') {
      throw new ForbiddenError('Shop owner access required');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if user can access own resource
const canAccessOwnResource = (req, res, next) => {
  try {
    if (!req.user) {
      throw new ForbiddenError('Authentication required');
    }

    // Admin can access all resources
    if (req.user.role === 'ADMIN') {
      return next();
    }

    // For other users, check if they're accessing their own resource
    const resourceUserId = req.params.userId || req.body.userId || req.query.userId;
    
    if (resourceUserId && resourceUserId !== req.user.userId.toString()) {
      throw new ForbiddenError('You can only access your own resources');
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  isAdmin,
  isShopOwner,
  canAccessOwnResource,
  hasPermission,
  ROLE_PERMISSIONS
}; 