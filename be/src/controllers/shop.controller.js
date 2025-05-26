"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { SHOP_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const shopService = require("../services/shop.service");

class ShopController {
  getAllPublicShops = asyncHandler(async (req, res) => {
    const result = await shopService.getAllPublicShops(req);
    new OK({
      message: SHOP_MESSAGE.GET_ALL_PUBLIC_SUCCESS,
      data: result,
    }).send(res);
  });


  createShop = asyncHandler(async (req, res) => {
    const result = await shopService.createShop(req);
    new CREATED({
      message: SHOP_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  createShopByAdmin = asyncHandler(async (req, res) => {
    const result = await shopService.createShopByAdmin(req);
    new CREATED({
      message: SHOP_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  updateShop = asyncHandler(async (req, res) => {
    const result = await shopService.updateShop(req);
    new OK({
      message: SHOP_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  getShop = asyncHandler(async (req, res) => {
    const result = await shopService.getShop(req);
    new OK({
      message: SHOP_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getAllShops = asyncHandler(async (req, res) => {
    const result = await shopService.getAllShops(req);
    new OK({
      message: SHOP_MESSAGE.GET_ALL_SUCCESS,
      data: result,
    }).send(res);
  });

  getMyShop = asyncHandler(async (req, res) => {
    const result = await shopService.getMyShop(req);
    new OK({
      message: SHOP_MESSAGE.GET_SUCCESS,
      data: result,
    }).send(res);
  });

  getShopStats = asyncHandler(async (req, res) => {
    const result = await shopService.getShopStats(req);
    new OK({
      message: "Get shop stats successfully",
      data: result,
    }).send(res);
  });

  uploadShopImage = asyncHandler(async (req, res) => {
    const result = await shopService.uploadShopImage(req);
    new OK({
      message: SHOP_MESSAGE.UPLOAD_IMAGE_SUCCESS,
      data: result,
    }).send(res);
  });

  assignThemes = asyncHandler(async (req, res) => {
    const result = await shopService.assignThemes(req);
    new OK({
      message: SHOP_MESSAGE.ASSIGN_THEMES_SUCCESS,
      data: result,
    }).send(res);
  });

  createSeat = asyncHandler(async (req, res) => {
    const result = await shopService.createSeat(req);
    new OK({
      message: SHOP_MESSAGE.CREATE_SEAT_SUCCESS,
      data: result,
    }).send(res);
  });

  updateSeat = asyncHandler(async (req, res) => {
    const result = await shopService.updateSeat(req);
    new OK({
      message: SHOP_MESSAGE.UPDATE_SEAT_SUCCESS,
      data: result,
    }).send(res);
  });

  createMenuItem = asyncHandler(async (req, res) => {
    const result = await shopService.createMenuItem(req);
    new OK({
      message: SHOP_MESSAGE.CREATE_MENU_ITEM_SUCCESS,
      data: result,
    }).send(res);
  });

  updateMenuItem = asyncHandler(async (req, res) => {
    const result = await shopService.updateMenuItem(req);
    new OK({
      message: SHOP_MESSAGE.UPDATE_MENU_ITEM_SUCCESS,
      data: result,
    }).send(res);
  });

  createTimeSlot = asyncHandler(async (req, res) => {
    const result = await shopService.createTimeSlot(req);
    new OK({
      message: SHOP_MESSAGE.CREATE_TIME_SLOT_SUCCESS,
      data: result,
    }).send(res);
  });

  updateTimeSlot = asyncHandler(async (req, res) => {
    const result = await shopService.updateTimeSlot(req);
    new OK({
      message: SHOP_MESSAGE.UPDATE_TIME_SLOT_SUCCESS,
      data: result,
    }).send(res);
  });

  submitVerification = asyncHandler(async (req, res) => {
    const result = await shopService.submitVerification(req);
    new OK({
      message: SHOP_MESSAGE.SUBMIT_VERIFICATION_SUCCESS,
      data: result,
    }).send(res);
  });


  // ===== SEATS MANAGEMENT =====
  getAllSeats = asyncHandler(async (req, res) => {
    const result = await shopService.getAllSeats(req);
    new OK({
      message: "Get all seats successfully",
      data: result,
    }).send(res);
  });

  deleteSeat = asyncHandler(async (req, res) => {
    const result = await shopService.deleteSeat(req);
    new OK({
      message: SHOP_MESSAGE.DELETE_SEAT_SUCCESS,
      data: result,
    }).send(res);
  });

  // ===== MENU ITEMS MANAGEMENT =====
  getAllMenuItems = asyncHandler(async (req, res) => {
    const result = await shopService.getAllMenuItems(req);
    new OK({
      message: "Get all menu items successfully",
      data: result,
    }).send(res);
  });

  deleteMenuItem = asyncHandler(async (req, res) => {
    const result = await shopService.deleteMenuItem(req);
    new OK({
      message: SHOP_MESSAGE.DELETE_MENU_ITEM_SUCCESS,
      data: result,
    }).send(res);
  });

  getShopForStaff = asyncHandler(async (req, res) => {
    const result = await shopService.getShopForStaff(req);
    new OK({
      message: SHOP_MESSAGE.GET_SHOP_FOR_STAFF_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new ShopController();
