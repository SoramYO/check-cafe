"use strict";

const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const notificationController = require("../../controllers/notification.controller");
const { USER_ROLE } = require("../../constants/enum");
const { BadRequestError } = require("../../configs/error.response");
const { isValidObjectId } = require("mongoose");

const validateNotificationId = (req, res, next) => {
  const { notificationId } = req.params;
  if (!isValidObjectId(notificationId)) {
    throw new BadRequestError("Invalid notificationId");
  }
  next();
};

router.use(checkAuth);
router.use(checkRole([USER_ROLE.CUSTOMER, USER_ROLE.SHOP_OWNER, USER_ROLE.STAFF, USER_ROLE.ADMIN]));

router.get("/", notificationController.getUserNotifications);
router.patch("/:notificationId/read", validateNotificationId, notificationController.markNotificationAsRead);
router.delete("/:notificationId", validateNotificationId, notificationController.deleteNotification);

module.exports = router;