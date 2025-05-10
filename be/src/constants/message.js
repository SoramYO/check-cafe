const ACCESS_MESSAGE = {
  LOGIN_SUCCESS: "Login successfully",
  LOGIN_FAILED: "Login failed",
  REGISTER_SUCCESS: "Register successfully",
  REGISTER_FAILED: "Register failed",
  LOGOUT_SUCCESS: "Logout successfully",
  LOGOUT_FAILED: "Logout failed",
  REFRESH_TOKEN_SUCCESS: "Refresh token successfully",
  REFRESH_TOKEN_FAILED: "Refresh token failed",
  FORGOT_PASSWORD_SUCCESS: "Forgot password successfully",
  FORGOT_PASSWORD_FAILED: "Forgot password failed",
  RESET_PASSWORD_SUCCESS: "Reset password successfully",
  RESET_PASSWORD_FAILED: "Reset password failed",
  VERIFY_EMAIL_SUCCESS: "Verify email successfully",
  VERIFY_EMAIL_FAILED: "Verify email failed",
};

const USER_MESSAGE = {
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  USER_UPDATE_SUCCESS: "User updated successfully",
  USER_UPDATE_FAILED: "User update failed",
  USER_DELETE_SUCCESS: "User deleted successfully",
  USER_DELETE_FAILED: "User delete failed",
  USER_GET_PROFILE_SUCCESS: "Get user profile successfully",
  USER_UPDATE_PROFILE_SUCCESS: "Update user profile successfully",
  USER_CHANGE_PASSWORD_SUCCESS: "Change password successfully",
  USER_CHANGE_AVATAR_SUCCESS: "Update avatar successfully",
};

const ADMIN_MESSAGE = {
  ADMIN_NOT_FOUND: "Admin not found",
  ADMIN_ALREADY_EXISTS: "Admin already exists",
  ADMIN_UPDATE_SUCCESS: "Admin updated successfully",
  ADMIN_UPDATE_FAILED: "Admin update failed",
  ADMIN_DELETE_SUCCESS: "Admin deleted successfully",
  ADMIN_DELETE_FAILED: "Admin delete failed",
  GET_USER_LIST_SUCCESS: "Get user list successfully",
  UPDATE_USER_STATUS_SUCCESS: "Update user status successfully",
  MANAGE_USER_ACCOUNT_SUCCESS: "Manage user account successfully",
};

const SHOP_THEME_MESSAGE = {
  CREATE_SUCCESS: "Create shop theme successfully",
  GET_ALL_SUCCESS: "Get shop themes successfully",
  GET_BY_ID_SUCCESS: "Get shop theme by ID successfully",
  UPDATE_SUCCESS: "Update shop theme successfully",
  DELETE_SUCCESS: "Delete shop theme successfully",
};

const SHOP_MESSAGE = {
  CREATE_SUCCESS: "Create shop successfully",
  UPDATE_SUCCESS: "Update shop successfully",
  GET_SUCCESS: "Get shop successfully",
  UPLOAD_IMAGE_SUCCESS: "Upload shop image successfully",
  ASSIGN_THEMES_SUCCESS: "Assign themes successfully",
  CREATE_SEAT_SUCCESS: "Create seat successfully",
  UPDATE_SEAT_SUCCESS: "Update seat successfully",
  CREATE_MENU_ITEM_SUCCESS: "Create menu item successfully",
  UPDATE_MENU_ITEM_SUCCESS: "Update menu item successfully",
  CREATE_TIME_SLOT_SUCCESS: "Create time slot successfully",
  UPDATE_TIME_SLOT_SUCCESS: "Update time slot successfully",
  SUBMIT_VERIFICATION_SUCCESS: "Submit verification successfully",
};

const ADVERTISEMENT_MESSAGE = {
  GET_ADVERTISEMENT_LIST_SUCCESS: "Get advertisement list successfully",
  GET_ADVERTISEMENT_BY_ID_SUCCESS: "Get advertisement by ID successfully",
};

const CATEGORY_MESSAGE = {
  GET_CATEGORY_LIST_SUCCESS: "Get category list successfully",
  CREATE_CATEGORY_SUCCESS: "Create category successfully",
  UPDATE_CATEGORY_SUCCESS: "Update category successfully",
};

const CUSTOMER_MESSAGE = {
  GET_COFFEE_SHOPS_SUCCESS: "Get coffee shops successfully",
};

module.exports = {
  ACCESS_MESSAGE,
  USER_MESSAGE,
  ADMIN_MESSAGE,
  SHOP_THEME_MESSAGE,
  SHOP_MESSAGE,
};
