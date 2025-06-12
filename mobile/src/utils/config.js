// API Configuration
export const API_ENDPOINTS = {
  // Notification endpoints
  NOTIFICATIONS: '/notifications',
  MARK_READ: '/notifications/:id/read',
  MARK_ALL_READ: '/notifications/mark-all-read',
  UNREAD_COUNT: '/notifications/unread-count',
  DELETE_NOTIFICATION: '/notifications/:id',
  SAVE_EXPO_TOKEN: '/user/save-expo_token',
  
  // Other endpoints
  USER_PROFILE: '/user/profile',
  SHOPS: '/shops',
  RESERVATIONS: '/reservations',
};

// Notification Types - matching backend enum
export const NOTIFICATION_TYPES = {
  // Main types
  BOOKING: 'booking',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
  UPDATE: 'update',
  REVIEW: 'review',
  SYSTEM: 'system',
  
  // Specific reservation types
  RESERVATION_CREATED: 'RESERVATION_CREATED',
  RESERVATION_CONFIRMED: 'RESERVATION_CONFIRMED',
  RESERVATION_CANCELLED: 'RESERVATION_CANCELLED',
  RESERVATION_COMPLETED: 'RESERVATION_COMPLETED',
  CHECK_IN: 'CHECK_IN',
  
  // Friend-related notification types
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
  FRIEND_CHECKIN: 'FRIEND_CHECKIN',
  
  // Checkin interaction notifications
  CHECKIN_LIKE: 'CHECKIN_LIKE',
  CHECKIN_COMMENT: 'CHECKIN_COMMENT',
};

// Navigation Routes
export const ROUTES = {
  HOME: 'Home',
  NOTIFICATIONS: 'Notifications',
  BOOKING_DETAIL: 'BookingDetail',
  SHOP_DETAIL: 'ShopDetail',
  PROMOTIONS: 'Promotions',
  PROFILE: 'Profile',
  SETTINGS: 'Settings',
};

// Theme Colors
export const COLORS = {
  PRIMARY: '#7a5545',
  SECONDARY: '#BFA58E',
  SUCCESS: '#2ECC71',
  WARNING: '#F39C12',
  ERROR: '#E74C3C',
  INFO: '#3498DB',
  
  // Notification Colors
  NOTIFICATION: {
    booking: '#4ECDC4',
    promotion: '#FF6B6B',
    reminder: '#FFD93D',
    update: '#6BCF7F',
    review: '#A8E6CF',
    system: '#95A5A6',
    RESERVATION_CREATED: '#3498DB',
    RESERVATION_CONFIRMED: '#2ECC71',
    RESERVATION_CANCELLED: '#E74C3C',
    RESERVATION_COMPLETED: '#27AE60',
    CHECK_IN: '#F39C12',
    FRIEND_REQUEST: '#9B59B6',
    FRIEND_ACCEPTED: '#2ECC71',
    FRIEND_CHECKIN: '#3498DB',
    CHECKIN_LIKE: '#E91E63',
    CHECKIN_COMMENT: '#FF9800',
  }
};

// App Configuration
export const APP_CONFIG = {
  NAME: 'CheckCafe',
  VERSION: '1.0.0',
  PAGINATION_LIMIT: 20,
  NOTIFICATION_LIMIT: 50,
  MAX_RETRY_ATTEMPTS: 3,
}; 