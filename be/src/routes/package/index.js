"use strict";

const express = require("express");
const { checkAuth } = require("../../auth/checkAuth");
const router = express.Router();
const packageController = require("../../controllers/package.controller.js");


router.use(checkAuth);

router.post("/", packageController.createPackage);
router.get("/", packageController.getPackages);
router.get("/:packageId", packageController.getPackageById);
router.put("/:packageId", packageController.updatePackage);
router.delete("/:packageId", packageController.deletePackage);

module.exports = router;
