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
  GET_FCM_TOKEN_SUCCESS: "Get FCM token successfully",
  GET_FCM_TOKEN_FAILED: "Get FCM token failed",
};

const USER_MESSAGE = {
  USER_NOT_FOUND: "User not found",
  USER_ALREADY_EXISTS: "User already exists",
  USER_UPDATE_SUCCESS: "User updated successfully",
  USER_UPDATE_FAILED: "User update failed",
  USER_DELETE_SUCCESS: "User deleted successfully",
  USER_DELETE_FAILED: "User delete failed",
  USER_SAVE_EXPO_TOKEN_SUCCESS: "Save Expo token successfully",
  USER_GET_PROFILE_SUCCESS: "Get user profile successfully",
  USER_UPDATE_PROFILE_SUCCESS: "Update user profile successfully",
  USER_CHANGE_PASSWORD_SUCCESS: "Change password successfully",
  USER_CHANGE_AVATAR_SUCCESS: "Update avatar successfully",
  USER_SAVE_FCM_TOKEN_SUCCESS: "Save FCM token successfully",
  USER_ADD_FAVORITE_SHOP_SUCCESS: "Add favorite shop successfully",
  USER_GET_FAVORITE_SHOP_SUCCESS: "Get favorite shop successfully",
  USER_ADD_FAVORITE_PRODUCT_SUCCESS: "Add favorite product successfully",
  USER_GET_FAVORITE_PRODUCT_SUCCESS: "Get favorite product successfully",
  USER_REMOVE_FAVORITE_SHOP_SUCCESS: "Remove favorite shop successfully",
  USER_REMOVE_FAVORITE_PRODUCT_SUCCESS: "Remove favorite product successfully",
  USER_BUY_VIP_PACKAGE_SUCCESS: "Buy vip package successfully",
  USER_RECEIVE_HOOK_SUCCESS: "Receive hook successfully",
  USER_GET_USER_PACKAGES_SUCCESS: "Get user packages successfully",
  USER_GET_USER_PACKAGE_BY_ID_SUCCESS: "Get user package by ID successfully",
  USER_GET_MY_PACKAGES_SUCCESS: "Get my packages successfully",
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
  GET_ALL_SUCCESS: "Get all shops successfully",
  UPLOAD_IMAGE_SUCCESS: "Upload shop image successfully",
  ASSIGN_THEMES_SUCCESS: "Assign themes successfully",
  CREATE_SEAT_SUCCESS: "Create seat successfully",
  UPDATE_SEAT_SUCCESS: "Update seat successfully",
  DELETE_SEAT_SUCCESS: "Delete seat successfully",
  CREATE_MENU_ITEM_SUCCESS: "Create menu item successfully",
  UPDATE_MENU_ITEM_SUCCESS: "Update menu item successfully",
  DELETE_MENU_ITEM_SUCCESS: "Delete menu item successfully",
  CREATE_TIME_SLOT_SUCCESS: "Create time slot successfully",
  UPDATE_TIME_SLOT_SUCCESS: "Update time slot successfully",
  SUBMIT_VERIFICATION_SUCCESS: "Submit verification successfully",
  GET_ALL_PUBLIC_SUCCESS: "Get all public shops successfully",
  GET_SHOPS_IN_RANGE_SUCCESS: "Get shops in range successfully",
  GET_SHOP_FOR_STAFF_SUCCESS: "Get shop for staff successfully",
  GET_STAFF_LIST_SUCCESS: "Get staff list successfully",
  CREATE_STAFF_SUCCESS: "Create staff successfully",
  UPDATE_STAFF_SUCCESS: "Update staff successfully",
  GET_STAFF_BY_ID_SUCCESS: "Get staff by ID successfully",
};

const ADVERTISEMENT_MESSAGE = {
  GET_ADVERTISEMENT_LIST_SUCCESS: "Get advertisement list successfully",
  GET_ADVERTISEMENT_BY_ID_SUCCESS: "Get advertisement by ID successfully",
  CREATE_ADVERTISEMENT_SUCCESS: "Create advertisement successfully",
  UPDATE_ADVERTISEMENT_SUCCESS: "Update advertisement successfully",
  DELETE_ADVERTISEMENT_SUCCESS: "Delete advertisement successfully",
};

const CATEGORY_MESSAGE = {
  GET_CATEGORY_LIST_SUCCESS: "Get category list successfully",
  GET_ALL_CATEGORY_SUCCESS: "Get all categories successfully",
  CREATE_CATEGORY_SUCCESS: "Create category successfully",
  UPDATE_CATEGORY_SUCCESS: "Update category successfully",
  GET_PUBLIC_CATEGORY_LIST_SUCCESS: "Get public category list successfully",
  DELETE_CATEGORY_SUCCESS: "Delete category successfully",
};

const CUSTOMER_MESSAGE = {
  GET_COFFEE_SHOPS_SUCCESS: "Get coffee shops successfully",
};

const RESERVATION_MESSAGE = {
  CREATE_SUCCESS: "Reservation created successfully",
  CONFIRM_SUCCESS: "Reservation confirmed successfully",
  CANCEL_SUCCESS: "Reservation cancelled successfully",
  COMPLETE_SUCCESS: "Reservation completed successfully",
  GET_ALL_SUCCESS: "Get all reservations successfully",
  GET_DETAIL_SUCCESS: "Get reservation details successfully",
  CHECK_IN_SUCCESS: "Check in reservation successfully",
};

const NOTIFICATION_MESSAGE = {
  GET_ALL_SUCCESS: "Get all notifications successfully",
  MARK_READ_SUCCESS: "Notification marked as read",
  MARK_ALL_READ_SUCCESS: "All notifications marked as read",
  DELETE_SUCCESS: "Notification deleted successfully",
  GET_UNREAD_COUNT_SUCCESS: "Get unread count successfully",
  CREATE_SUCCESS: "Notification created successfully",
};

const VERIFICATION_MESSAGE = {
  GET_VERIFICATIONS_SUCCESS: "Retrieved verifications successfully",
  GET_VERIFICATION_SUCCESS: "Retrieved verification successfully",
  REVIEW_VERIFICATION_SUCCESS: "Reviewed verification successfully",
  DELETE_VERIFICATION_SUCCESS: "Deleted verification successfully",
};

const PACKAGE_MESSAGE = {
  CREATE_SUCCESS: "Create package successfully",
  GET_SUCCESS: "Get package successfully",
  UPDATE_SUCCESS: "Update package successfully",
  DELETE_SUCCESS: "Delete package successfully",
  GET_ALL_SUCCESS: "Get all packages successfully",
  GET_PAYMENT_STATUS_SUCCESS: "Get payment status successfully",
  GET_MY_PAYMENT_SUCCESS: "Get my payment successfully",
};

const DISCOUNT_MESSAGE = {
  CREATE_DISCOUNT_SUCCESS: "Create discount successfully",
  GET_DISCOUNTS_SUCCESS: "Get discounts successfully",
  UPDATE_DISCOUNT_SUCCESS: "Update discount successfully",
  DELETE_DISCOUNT_SUCCESS: "Delete discount successfully",
  GET_DISCOUNT_BY_ID_SUCCESS: "Get discount by ID successfully",
};
module.exports = {
  ACCESS_MESSAGE,
  USER_MESSAGE,
  ADMIN_MESSAGE,
  SHOP_THEME_MESSAGE,
  SHOP_MESSAGE,
  ADVERTISEMENT_MESSAGE,
  CUSTOMER_MESSAGE,
  RESERVATION_MESSAGE,
  NOTIFICATION_MESSAGE,
  CATEGORY_MESSAGE,
  VERIFICATION_MESSAGE,
  PACKAGE_MESSAGE,
  DISCOUNT_MESSAGE,
};
