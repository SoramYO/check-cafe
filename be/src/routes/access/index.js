"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const { checkAuth } = require("../../auth/checkAuth");
const router = express.Router();

// access routes
router.post("/sign-up", accessController.signUp);
router.post("/sign-in", accessController.signIn);

// Protected routes
router.use(checkAuth);
router.post("/sign-out", accessController.signOut);

module.exports = router;
