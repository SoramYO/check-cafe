'use strict'

const express = require('express');
const accessController = require('../../controllers/access.controller');
const router = express.Router();

// Shop routes
router.post('/shop/sign-up', accessController.signUp);
router.post('/shop/login', accessController.login);

// User routes
router.post('/user/sign-up', accessController.userSignUp);
router.post('/user/login', accessController.userLogin);

module.exports = router;