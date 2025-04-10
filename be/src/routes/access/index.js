"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();

// access routes
router.post("/sign-up", accessController.signUp);
router.post("/sign-in", accessController.signIn);
router.post("/sign-out", accessController.signOut);

module.exports = router;
