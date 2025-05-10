'use strict';

const express = require('express');
const router = express.Router();
const advertisementController = require('../../controllers/advertisement.controller');

router.get('/', advertisementController.getAdvertisements);
router.get('/:id', advertisementController.getAdvertisementById);

module.exports = router;
