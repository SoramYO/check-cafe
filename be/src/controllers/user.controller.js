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
}

module.exports = new UserController();
