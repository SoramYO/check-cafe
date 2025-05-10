"use strict";

const express = require("express");
const router = express.Router();
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const reservationController = require("../../controllers/reservation.controller");
const { USER_ROLE } = require("../../constants/enum");

router.use(checkAuth);
router.use(checkRole([USER_ROLE.CUSTOMER, USER_ROLE.SHOP_OWNER, USER_ROLE.ADMIN]));

router.post("/", reservationController.createReservation);
router.patch("/:reservationId/confirm", reservationController.confirmReservation);
router.patch("/:reservationId/cancel", reservationController.cancelReservation);

module.exports = router;