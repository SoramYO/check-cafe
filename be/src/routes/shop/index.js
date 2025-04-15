"use strict";

const express = require("express");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const router = express.Router();
const shopController = require("../../controllers/shop.controller");
const uploadCloud = require("../../configs/cloudinary.config");
const { USER_ROLE } = require("../../constants/enum");

// PUBLIC ROUTES
// Get shop details
router.get("/:shopId", shopController.getShop);

router.use(checkAuth);
router.use(checkRole([USER_ROLE.SHOP_OWNER]));

// Create shop
router.post("/", shopController.createShop);

// Update shop
router.patch("/:shopId", shopController.updateShop);

// Upload shop image
router.post(
  "/:shopId/images",
  uploadCloud.single("image"),
  shopController.uploadShopImage
);

// Assign themes
router.patch("/:shopId/themes", shopController.assignThemes);

// Create seat
router.post(
  "/:shopId/seats",
  uploadCloud.single("image"),
  shopController.createSeat
);

// Update seat
router.patch(
  "/:shopId/seats/:seatId",
  uploadCloud.single("image"),
  shopController.updateSeat
);

// Create menu item
router.post("/:shopId/menu-items", shopController.createMenuItem);

// Update menu item
router.patch("/:shopId/menu-items/:itemId", shopController.updateMenuItem);

// Create time slot
router.post("/:shopId/time-slots", shopController.createTimeSlot);

// Update time slot
router.patch("/:shopId/time-slots/:slotId", shopController.updateTimeSlot);

// Submit verification
router.post(
  "/:shopId/verifications",
  uploadCloud.single("document"),
  shopController.submitVerification
);

module.exports = router;
