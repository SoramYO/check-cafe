"use strict";

const express = require("express");
const router = express.Router();
const shopThemeController = require("../../controllers/shopTheme.controller");
const uploadCloud = require("../../configs/cloudinary.config");
const { USER_ROLE } = require("../../constants/enum");
const { checkAuth, checkRole } = require("../../auth/checkAuth");

// PUBLIC ROUTES
// Get all themes
router.get("/", shopThemeController.getAllThemes);

// Get theme by ID
router.get("/:themeId", shopThemeController.getThemeById);

router.use(checkAuth);
router.use(checkRole([USER_ROLE.ADMIN]));

// Create theme
router.post(
  "/",
  uploadCloud.single("theme_image"),
  shopThemeController.createTheme
);

// Update theme
router.patch(
  "/:themeId",
  uploadCloud.single("theme_image"),
  shopThemeController.updateTheme
);

// Delete theme
router.delete("/:themeId", shopThemeController.deleteTheme);

module.exports = router;
