"use strict";

const { OK } = require("../configs/success.response");
const { USER_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const userService = require("../services/user.service");

class UserController {
  getProfile = asyncHandler(async (req, res) => {
    const result = await userService.getProfile(req);
    new OK({
      message: USER_MESSAGE.USER_GET_PROFILE_SUCCESS,
      data: result,
    }).send(res);
  });

  updateProfile = asyncHandler(async (req, res) => {
    const result = await userService.updateProfile(req, req.body);
    new OK({
      message: USER_MESSAGE.USER_UPDATE_PROFILE_SUCCESS,
      data: result,
    }).send(res);
  });

  changePassword = asyncHandler(async (req, res) => {
    const result = await userService.changePassword(req, req.body);
    new OK({
      message: USER_MESSAGE.USER_CHANGE_PASSWORD_SUCCESS,
      data: result,
    }).send(res);
  });

  updateAvatar = asyncHandler(async (req, res) => {
    const result = await userService.updateAvatar(req, req.body);
    new OK({
      message: USER_MESSAGE.USER_CHANGE_AVATAR_SUCCESS,
      data: result,
    }).send(res);
  });

  saveFcmToken = asyncHandler(async (req, res) => {
    const result = await userService.saveFcmToken(req);
    new OK({ message: USER_MESSAGE.USER_SAVE_FCM_TOKEN_SUCCESS, data: result }).send(res);
  });

  addFavoriteShop = asyncHandler(async (req, res) => {
    const result = await userService.addFavoriteShop(req);
    new OK({ message: USER_MESSAGE.USER_ADD_FAVORITE_SHOP_SUCCESS, data: result }).send(res);
  });

  addFavoriteProduct = asyncHandler(async (req, res) => {
    const result = await userService.addFavoriteMenuItem(req);
    new OK({ message: USER_MESSAGE.USER_ADD_FAVORITE_PRODUCT_SUCCESS, data: result }).send(res);
  });

  getFavoriteShop = asyncHandler(async (req, res) => {
    const result = await userService.getFavoriteShop(req);
    new OK({ message: USER_MESSAGE.USER_GET_FAVORITE_SHOP_SUCCESS, data: result }).send(res);
  });  

  getFavoriteProduct = asyncHandler(async (req, res) => {
    const result = await userService.getFavoriteProduct(req);
    new OK({ message: USER_MESSAGE.USER_GET_FAVORITE_PRODUCT_SUCCESS, data: result }).send(res);
  });

  removeFavoriteShop = asyncHandler(async (req, res) => {
    const result = await userService.removeFavoriteShop(req);
    new OK({ message: USER_MESSAGE.USER_REMOVE_FAVORITE_SHOP_SUCCESS, data: result }).send(res);
  });

  removeFavoriteProduct = asyncHandler(async (req, res) => {
    const result = await userService.removeFavoriteProduct(req);
    new OK({ message: USER_MESSAGE.USER_REMOVE_FAVORITE_PRODUCT_SUCCESS, data: result }).send(res);
  });

  buyVipPackage = asyncHandler(async (req, res) => {
    const result = await userService.buyVipPackage(req);
    new OK({ message: USER_MESSAGE.USER_BUY_VIP_PACKAGE_SUCCESS, data: result }).send(res);
  });

  receiveHook = asyncHandler(async (req, res) => {
    const result = await userService.receiveHook(req);
    new OK({ message: USER_MESSAGE.USER_RECEIVE_HOOK_SUCCESS, data: result }).send(res);
  });

}

module.exports = new UserController();
