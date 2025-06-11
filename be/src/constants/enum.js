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
  RESERVATION_CREATED: "RESERVATION_CREATED",
  RESERVATION_CONFIRMED: "RESERVATION_CONFIRMED",
  RESERVATION_CANCELLED: "RESERVATION_CANCELLED",
  RESERVATION_COMPLETED: "RESERVATION_COMPLETED",
  CHECK_IN: "CHECK_IN",
  // Thêm các loại thông báo khác theo NotificationScreen.jsx
  BOOKING: "booking",
  PROMOTION: "promotion", 
  REMINDER: "reminder",
  UPDATE: "update",
  REVIEW: "review",
  SYSTEM: "system",
  // Friend notifications
  FRIEND_REQUEST: "FRIEND_REQUEST",
  FRIEND_ACCEPTED: "FRIEND_ACCEPTED",
  // Checkin notifications
  FRIEND_CHECKIN: "FRIEND_CHECKIN",
};

module.exports = {
  USER_ROLE,
  HEADER,
  RESERVATION_TYPE,
  RESERVATION_STATUS,
  NOTIFICATION_TYPE,
};
