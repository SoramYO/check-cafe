"use strict";

const express = require("express");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const router = express.Router();
const userController = require("../../controllers/user.controller");
const uploadCloud = require("../../configs/cloudinary.config");
const { updateAvatar } = require("../../services/user.service");
const { USER_ROLE } = require("../../constants/enum");

router.use(checkAuth);


// Get profile
router.get("/profile", userController.getProfile);

// Update profile
router.patch("/profile", userController.updateProfile);

// Change password
router.patch("/profile/password", userController.changePassword);

// Update avatar
// router.patch("/profile/avatar", userController.updateAvatar);

router.patch(
  "/profile/avatar",
  uploadCloud.single("avatar"),
  async (req, res) => {
    try {
      const result = await updateAvatar(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
);

module.exports = router;
