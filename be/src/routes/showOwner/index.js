"use strict";

const express = require("express");
const { checkAuth, checkRole, checkShopOwnership } = require("../../auth/checkAuth");
const router = express.Router();
const reservationController = require("../../controllers/reservation.controller");
const shopOwnerController = require("../../controllers/shopOwner.controller");
const { USER_ROLE } = require("../../constants/enum");
const shopController = require("../../controllers/shop.controller");
const { validateShopOwnerRegistration } = require("../../middlewares/validation");

// Public routes (no authentication required)
router.post("/register", validateShopOwnerRegistration, shopOwnerController.registerShopOwner);

// Authenticated routes
router.use(checkAuth);

router.get("/shops", shopController.getAllShops);

// Shop owner specific routes
router.use(checkRole([USER_ROLE.SHOP_OWNER]));


// Reservation management
router.get("/shops/:shopId/reservations", checkShopOwnership, reservationController.getAllReservations);
router.get("/shops/:shopId/reservations/:reservationId", checkShopOwnership, reservationController.getReservationDetail);
router.patch("/shops/:shopId/reservations/:reservationId/confirm", checkShopOwnership, reservationController.confirmReservation);
router.patch("/shops/:shopId/reservations/:reservationId/cancel", checkShopOwnership, reservationController.cancelReservation);
router.patch("/shops/:shopId/reservations/:reservationId/complete", checkShopOwnership, reservationController.completeReservation);
router.post("/shops/:shopId/reservations/checkin", checkShopOwnership, reservationController.checkInReservationByShop);

module.exports = router;