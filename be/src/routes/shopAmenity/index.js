"use strict";

const express = require("express");
const router = express.Router();
const shopAmenityController = require("../../controllers/shopAmenity.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

// Public route to get all amenities
router.get("/", shopAmenityController.getAllAmenities);

router.use(checkAuth);
router.use(checkRole([USER_ROLE.ADMIN]));

// Admin routes
router.post("/", shopAmenityController.createAmenity);
router.patch("/:amenityId", shopAmenityController.updateAmenity);
router.delete("/:amenityId", shopAmenityController.deleteAmenity);

module.exports = router; 