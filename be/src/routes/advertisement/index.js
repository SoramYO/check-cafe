"use strict";

const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const advertisementController = require("../../controllers/advertisement.controller.js");
const { USER_ROLE } = require("../../constants/enum");
const uploadCloud = require("../../configs/cloudinary.config");

router.use(checkAuth);

router.post(
  "/",
  uploadCloud.single("image"),
  advertisementController.createAdvertisement
);
router.get("/", advertisementController.getAdvertisements);
router.get("/:advertisementId", advertisementController.getAdvertisementById);

router.put("/:advertisementId", advertisementController.updateAdvertisement);
router.delete("/:advertisementId", advertisementController.deleteAdvertisement);

module.exports = router;
