"use strict";

const { OK } = require("../configs/success.response");
const { RESERVATION_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const reviewService = require("../services/review.service.js");

class ReviewController {
  createReview = asyncHandler(async (req, res) => {
    const result = await reviewService.createReview(req);
    new OK({
      message: RESERVATION_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  getReviews = asyncHandler(async (req, res) => {
    const result = await reviewService.getReviews(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getReviewsByShopId = asyncHandler(async (req, res) => {
    const result = await reviewService.getReviewsByShopId(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getReviewById = asyncHandler(async (req, res) => {
    const result = await reviewService.getReviewById(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  updateReview = asyncHandler(async (req, res) => {
    const result = await reviewService.updateReview(req);
    new OK({
      message: RESERVATION_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteReview = asyncHandler(async (req, res) => {
    const result = await reviewService.deleteReview(req);
    new OK({
      message: RESERVATION_MESSAGE.DELETE_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new ReviewController();

