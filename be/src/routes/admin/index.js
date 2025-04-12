"use strict";

const express = require("express");
const adminController = require("../../controllers/admin.controller");
const { checkAdmin } = require("../../middlewares/auth");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");
const router = express.Router();

// Auth routes
router.use(checkAuth);
router.use(checkRole(USER_ROLE.ADMIN));

router.get("/users", adminController.getUsers);
router.patch("/users", adminController.manageUserAccount);

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

// Account Management
router.get("/accounts", checkAdmin, adminController.getAccounts);
router.put("/accounts/:id/block", checkAdmin, adminController.blockAccount);
router.put("/accounts/:id/unblock", checkAdmin, adminController.unblockAccount);

module.exports = router;
