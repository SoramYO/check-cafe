"use strict";

const { OK } = require("../configs/success.response");
const { VERIFICATION_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const verificationService = require("../services/verification.service");

class VerificationController {
  getAllVerifications = asyncHandler(async (req, res, next) => {
    const result = await verificationService.getAllVerifications(req);
    new OK({
      message: VERIFICATION_MESSAGE.GET_VERIFICATIONS_SUCCESS,
      data: result,
    }).send(res);
  });

  getVerificationById = asyncHandler(async (req, res, next) => {
    const result = await verificationService.getVerificationById(req);
    new OK({
      message: VERIFICATION_MESSAGE.GET_VERIFICATION_SUCCESS,
      data: result,
    }).send(res);
  });

  reviewVerification = asyncHandler(async (req, res, next) => {
    const result = await verificationService.reviewVerification(req);
    new OK({
      message: VERIFICATION_MESSAGE.REVIEW_VERIFICATION_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteVerification = asyncHandler(async (req, res, next) => {
    const result = await verificationService.deleteVerification(req);
    new OK({
      message: VERIFICATION_MESSAGE.DELETE_VERIFICATION_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new VerificationController();