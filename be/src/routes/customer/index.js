'use strict';

const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customer.controller');

router.get('/coffee-shops', customerController.getCoffeeShops);

module.exports = router;
