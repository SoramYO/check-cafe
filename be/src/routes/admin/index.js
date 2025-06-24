"use strict";

const express = require("express");
const adminController = require("../../controllers/admin.controller");
const { checkAdmin } = require("../../middlewares/auth");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");
const router = express.Router();

// Auth routes
router.use(checkAuth);
router.use(checkRole([USER_ROLE.ADMIN]));

router.get("/users", adminController.getUsers);
router.get("/users/:id", adminController.getUserById);
router.put("/users", adminController.manageUserAccount);
router.put("/users/:id", adminController.updateUserById);
router.delete("/users/:id", adminController.deleteUserById);
router.post("/users", adminController.createUser);

// Dashboard Stats
router.get("/stats", adminController.getDashboardStats);

// Shop owners without shops
router.get("/shop-owners-without-shops", adminController.getShopOwnersWithoutShops);

// Reports API
router.get("/reports/users", adminController.getUserReports);
router.get("/reports/shops", adminController.getShopReports);
router.get("/reports/orders", adminController.getOrderReports);
router.get("/reports/revenue", adminController.getRevenueReports);

// ===== SHOP DETAILED INFORMATION ROUTES =====
router.get("/shops/:shopId/reviews", adminController.getShopReviews);
router.get("/shops/:shopId/statistics", adminController.getShopDetailedStats);
router.get("/shops/:shopId/verifications", adminController.getShopVerifications);
router.get("/shops/:shopId/activity-history", adminController.getShopActivityHistory);
router.get("/shops/:shopId/owner", adminController.getShopOwnerInfo);
router.get("/shops/:shopId/checkins", adminController.getShopCheckins);
router.get("/shops/:shopId/reservations", adminController.getShopReservations);

// Shop management by admin
const shopController = require("../../controllers/shop.controller");
const discountController = require("../../controllers/discount.controller");
router.post("/shops", shopController.createShopByAdmin);

// Ads Management
router.get("/ads", checkAdmin, adminController.getAds);
router.post("/ads", checkAdmin, adminController.createAd);
router.put("/ads/:id", checkAdmin, adminController.updateAd);
router.delete("/ads/:id", checkAdmin, adminController.deleteAd);

// Statistics
router.get("/statistics/users", checkAdmin, adminController.getUserStats);
router.get("/statistics/bookings", checkAdmin, adminController.getBookingStats);
router.get("/statistics/shops", checkAdmin, adminController.getShopStats);
router.get(
  "/statistics/overview",
  checkAdmin,
  adminController.getOverviewStats
);

// Enhanced Booking Statistics
router.get("/statistics/bookings/period", checkAdmin, adminController.getBookingStatsByPeriod);
router.get("/statistics/bookings/shops", checkAdmin, adminController.getShopBookingStats);
router.get("/statistics/bookings/shops/:shopId/timeline", checkAdmin, adminController.getShopBookingTimeline);

// Account Management
router.get("/accounts", checkAdmin, adminController.getAccounts);
router.put("/accounts/:id/block", checkAdmin, adminController.blockAccount);
router.put("/accounts/:id/unblock", checkAdmin, adminController.unblockAccount);

module.exports = router;
