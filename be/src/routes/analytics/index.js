"use strict";

const express = require("express");
const analyticsController = require("../../controllers/analytics.controller");
const  asyncHandler  = require("../../helpers/asyncHandler");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

const router = express.Router();
router.use(checkAuth);
router.use(checkRole([USER_ROLE.CUSTOMER, USER_ROLE.SHOP_OWNER, USER_ROLE.ADMIN]));
// User routes - For tracking user activities (optional auth)
router.post("/session/create", asyncHandler(analyticsController.createSession));
router.post("/activity/record", asyncHandler(analyticsController.recordActivity));
router.post("/session/end", asyncHandler(analyticsController.endSession));

// Admin routes - For viewing analytics (require auth)
router.get("/overview",  asyncHandler(analyticsController.getOverallAnalytics));
router.get("/dashboard",  asyncHandler(analyticsController.getDashboardAnalytics));
router.get("/users/top",  asyncHandler(analyticsController.getTopActiveUsers));
router.get("/users/:userId",  asyncHandler(analyticsController.getUserAnalytics));
router.get("/activity/timeline",  asyncHandler(analyticsController.getActivityByTime));
router.get("/platforms",  asyncHandler(analyticsController.getPlatformAnalytics));
router.get("/actions",  asyncHandler(analyticsController.getActionAnalytics));

module.exports = router; 