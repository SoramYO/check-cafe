// Application Enums and Constants
// This file centralizes all enum definitions used throughout the app

/**
 * Notification Types Enum
 * These should match the backend notification types exactly
 */
export const NOTIFICATION_TYPES = {
  // Main notification categories
  BOOKING: 'booking',
  PROMOTION: 'promotion',
  REMINDER: 'reminder',
  UPDATE: 'update',
  REVIEW: 'review',
  SYSTEM: 'system',
  
  // Reservation-specific notifications
  RESERVATION_CREATED: 'RESERVATION_CREATED',
  RESERVATION_CONFIRMED: 'RESERVATION_CONFIRMED',
  RESERVATION_CANCELLED: 'RESERVATION_CANCELLED',
  RESERVATION_COMPLETED: 'RESERVATION_COMPLETED',
  CHECK_IN: 'CHECK_IN',
  
  // Friend-related notifications
  FRIEND_REQUEST: 'FRIEND_REQUEST',
  FRIEND_ACCEPTED: 'FRIEND_ACCEPTED',
  FRIEND_CHECKIN: 'FRIEND_CHECKIN',
};

/**
 * Friend Request Status Enum
 */
export const FRIEND_STATUS = {
  NONE: 'none',
  REQUEST_SENT: 'request_sent',
  REQUEST_RECEIVED: 'request_received',
  FRIENDS: 'friends',
  BLOCKED: 'blocked',
};

/**
 * Checkin Visibility Enum
 */
export const CHECKIN_VISIBILITY = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  PRIVATE: 'private',
};

/**
 * User Role Enum
 */
export const USER_ROLES = {
  CUSTOMER: 'customer',
  STAFF: 'staff',
  ADMIN: 'admin',
  OWNER: 'owner',
};

/**
 * Booking Status Enum
 */
export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
};

/**
 * Payment Status Enum
 */
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  REFUNDED: 'refunded',
  FAILED: 'failed',
};

export default {
  NOTIFICATION_TYPES,
  FRIEND_STATUS,
  CHECKIN_VISIBILITY,
  USER_ROLES,
  BOOKING_STATUS,
  PAYMENT_STATUS,
}; 