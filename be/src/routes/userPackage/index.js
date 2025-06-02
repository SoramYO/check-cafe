"use strict";

const express = require("express");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const router = express.Router();
const userPackageController = require("../../controllers/userPackage.controller.js");

router.use(checkAuth);
router.get("/my-packages", userPackageController.getMyPackages);
router.get("/", userPackageController.getUserPackages);
router.get("/:id", userPackageController.getUserPackageById);

module.exports = router;