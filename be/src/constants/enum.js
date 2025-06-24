const USER_ROLE = {
  ADMIN: "ADMIN",
  SHOP_OWNER: "SHOP_OWNER",
  MANAGER: "MANAGER",
  STAFF: "STAFF",
  CUSTOMER: "CUSTOMER",
};

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESH_TOKEN: "x-refresh-token",
};

const RESERVATION_TYPE = {
  STANDARD: "Standard",
  PRIORITY: "Priority",
};

const RESERVATION_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CHECKED_IN: "CheckedIn",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

const NOTIFICATION_TYPE = {
  // Loại thông báo (type)
  INFO: "info",
  WARNING: "warning", 
  ERROR: "error",
  SUCCESS: "success",
  
  // Danh mục thông báo (category)
  SYSTEM: "system",
  USER: "user",
  SHOP: "shop",
  BOOKING: "booking",
  PAYMENT: "payment",
  VERIFICATION: "verification",
  
  // Độ ưu tiên (priority)
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
  
  // Legacy types cho backward compatibility
  RESERVATION_CREATED: "RESERVATION_CREATED",
  RESERVATION_CONFIRMED: "RESERVATION_CONFIRMED", 
  RESERVATION_CANCELLED: "RESERVATION_CANCELLED",
  RESERVATION_COMPLETED: "RESERVATION_COMPLETED",
  CHECK_IN: "CHECK_IN",
  PROMOTION: "promotion",
  REMINDER: "reminder",
  UPDATE: "update",
  REVIEW: "review",
  FRIEND_REQUEST: "FRIEND_REQUEST",
  FRIEND_ACCEPTED: "FRIEND_ACCEPTED",
  FRIEND_CHECKIN: "FRIEND_CHECKIN",
  CHECKIN_LIKE: "CHECKIN_LIKE",
  CHECKIN_COMMENT: "CHECKIN_COMMENT",
};

module.exports = {
  USER_ROLE,
  HEADER,
  RESERVATION_TYPE,
  RESERVATION_STATUS,
  NOTIFICATION_TYPE,
};
