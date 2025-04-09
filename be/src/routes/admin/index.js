'use strict';

const express = require('express');
const adminController = require('../../controllers/admin.controller');
const { checkAdmin } = require('../../middlewares/auth');
const router = express.Router();

// Auth routes
router.post('/login', adminController.login);
router.post('/logout', checkAdmin, adminController.logout);
router.put('/change-password', checkAdmin, adminController.changePassword);

// Ads Management
router.get('/ads', checkAdmin, adminController.getAds);
router.post('/ads', checkAdmin, adminController.createAd);
router.put('/ads/:id', checkAdmin, adminController.updateAd);
router.delete('/ads/:id', checkAdmin, adminController.deleteAd);

// Statistics
router.get('/statistics/users', checkAdmin, adminController.getUserStats);
router.get('/statistics/bookings', checkAdmin, adminController.getBookingStats);
router.get('/statistics/shops', checkAdmin, adminController.getShopStats);
router.get('/statistics/overview', checkAdmin, adminController.getOverviewStats);

// Account Management
router.get('/accounts', checkAdmin, adminController.getAccounts);
router.put('/accounts/:id/block', checkAdmin, adminController.blockAccount);
router.put('/accounts/:id/unblock', checkAdmin, adminController.unblockAccount);

module.exports = router;