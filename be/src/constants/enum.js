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
  PREMIUM: "Premium",
  EVENT: "Event",
};

const RESERVATION_STATUS = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  COMPLETED: "Completed",
};

module.exports = {
  USER_ROLE,
  HEADER,
  RESERVATION_TYPE,
  RESERVATION_STATUS,
};
