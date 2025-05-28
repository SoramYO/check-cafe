"use strict";

const { OK } = require("../configs/success.response");
const { RESERVATION_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const reservationService = require("../services/reservation.service");

class ReservationController {
  createReservation = asyncHandler(async (req, res) => {
    const result = await reservationService.createReservation(req);
    new OK({
      message: RESERVATION_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  confirmReservation = asyncHandler(async (req, res) => {
    const result = await reservationService.confirmReservation(req);
    new OK({
      message: RESERVATION_MESSAGE.CONFIRM_SUCCESS,
      data: result,
    }).send(res);
  });

  cancelReservation = asyncHandler(async (req, res) => {
    const result = await reservationService.cancelReservation(req);
    new OK({
      message: RESERVATION_MESSAGE.CANCEL_SUCCESS,
      data: result,
    }).send(res);
  });

  getAllReservations = asyncHandler(async (req, res) => {
    const result = await reservationService.getAllReservations(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_ALL_SUCCESS,
      data: result,
    }).send(res);
  });

  getAllReservationsByUser = asyncHandler(async (req, res) => {
    const result = await reservationService.getAllReservationsByUser(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_ALL_SUCCESS,
      data: result,
    }).send(res);
  });

  getReservationDetail = asyncHandler(async (req, res) => {
    const result = await reservationService.getReservationDetail(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_DETAIL_SUCCESS,
      data: result,
    }).send(res);
  });

  completeReservation = asyncHandler(async (req, res) => {
    const result = await reservationService.completeReservation(req);
    new OK({
      message: RESERVATION_MESSAGE.COMPLETE_SUCCESS,
      data: result,
    }).send(res);
  });

  checkInReservationByShop = asyncHandler(async (req, res) => {
    const result = await reservationService.checkInReservationByShop(req);
    new OK({
      message: RESERVATION_MESSAGE.CHECK_IN_SUCCESS,
      data: result,
    }).send(res);
  });

  checkInReservationCustomer = asyncHandler(async (req, res) => {
    const result = await reservationService.checkInReservationCustomer(req);
    new OK({
      message: RESERVATION_MESSAGE.CHECK_IN_SUCCESS,
      data: result,
    }).send(res);
  });
  
  getReservationForShopStaff = asyncHandler(async (req, res) => {
    const result = await reservationService.getReservationForShopStaff(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_ALL_SUCCESS,
      data: result,
    }).send(res);
  });

  getShopReservations = asyncHandler(async (req, res) => {
    const result = await reservationService.getShopReservations(req);
    new OK({
      message: RESERVATION_MESSAGE.GET_ALL_SUCCESS,
      data: result,
    }).send(res);
  });


}

module.exports = new ReservationController();