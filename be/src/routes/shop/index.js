"use strict";

const express = require("express");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const router = express.Router();
const shopController = require("../../controllers/shop.controller");
const uploadCloud = require("../../configs/cloudinary.config");
const { USER_ROLE } = require("../../constants/enum");

// PUBLIC ROUTES
router.get("/public", shopController.getAllPublicShops);

// PRIVATE ROUTES
router.use(checkAuth);

// Get my shop (for shop owner) - MUST be before /:shopId
router.get("/my-shop", checkRole([USER_ROLE.SHOP_OWNER]), shopController.getMyShop);

// Get shop details - MUST be after /my-shop
router.get("/:shopId", shopController.getShop);

// Get shop stats (for shop owner)
router.get("/:shopId/stats", checkRole([USER_ROLE.SHOP_OWNER, USER_ROLE.ADMIN]), shopController.getShopStats);

router.use(checkRole([USER_ROLE.SHOP_OWNER, USER_ROLE.ADMIN, USER_ROLE.STAFF]));

router.get("/", shopController.getAllShops);
// Create shop
router.post("/", shopController.createShop);

router.get("/staff/list", shopController.getShopForStaff);

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

// ===== SEATS MANAGEMENT =====
// Get all seats
router.get("/:shopId/seats", shopController.getAllSeats);

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

// Delete seat
router.delete("/:shopId/seats/:seatId", shopController.deleteSeat);

// ===== MENU ITEMS MANAGEMENT =====
// Get all menu items
router.get("/:shopId/menu-items", shopController.getAllMenuItems);

// Create menu item (hỗ trợ upload 1-3 ảnh)
router.post(
  "/:shopId/menu-items",
  uploadCloud.array("images", 3),
  shopController.createMenuItem
);

// Update menu item (hỗ trợ upload 1-3 ảnh)
router.patch(
  "/:shopId/menu-items/:itemId",
  uploadCloud.array("images", 3),
  shopController.updateMenuItem
);

// Delete menu item
router.delete("/:shopId/menu-items/:itemId", shopController.deleteMenuItem);

// Create time slot
router.post("/:shopId/time-slots", shopController.createTimeSlot);

// Update time slot
router.patch("/:shopId/time-slots/:slotId", shopController.updateTimeSlot);

// Submit verification (hỗ trợ upload 1-5 ảnh)
router.post(
  "/:shopId/verifications",
  uploadCloud.array("documents", 5),
  shopController.submitVerification
);

module.exports = router;
