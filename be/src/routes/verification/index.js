"use strict";

const express = require("express");
const router = express.Router();
const verificationController = require("../../controllers/verification.controller");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const { USER_ROLE } = require("../../constants/enum");

router.use(checkAuth);
router.use(checkRole([USER_ROLE.ADMIN]));

router.get("/", verificationController.getAllVerifications);
router.get("/:verificationId", verificationController.getVerificationById);
router.patch("/:verificationId", verificationController.reviewVerification);
router.delete("/:verificationId", verificationController.deleteVerification);

module.exports = router;