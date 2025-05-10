'use strict'

const express = require('express');
const router = express.Router();

router.use('/v1/api', require('./access'));
router.use('/v1/api/admin', require('./admin'));
router.use('/v1/api/user', require('./user'));

module.exports = router;