"use strict";

const express = require("express");
const { checkAuth, checkRole } = require("../../auth/checkAuth");
const router = express.Router();
const reviewController = require("../../controllers/review.controller");
const { USER_ROLE } = require("../../constants/enum");

router.use(checkAuth);

router.use(checkRole([USER_ROLE.SHOP_OWNER, USER_ROLE.ADMIN]));

router.post("/", reviewController.createReview);

router.get("/", reviewController.getReviews);

router.get("/shop/:shopId", reviewController.getReviewsByShopId);

router.get("/:reviewId", reviewController.getReviewById);

router.put("/:reviewId", reviewController.updateReview);

router.delete("/:reviewId", reviewController.deleteReview);

module.exports = router;

