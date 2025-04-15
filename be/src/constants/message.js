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

module.exports = {
  ACCESS_MESSAGE,
  USER_MESSAGE,
  ADMIN_MESSAGE,
  SHOP_THEME_MESSAGE,
};
