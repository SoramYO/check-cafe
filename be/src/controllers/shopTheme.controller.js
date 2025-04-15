"use strict";

const { OK, CREATED } = require("../configs/success.response");
const { SHOP_THEME_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const shopThemeService = require("../services/shopTheme.service");

class ShopThemeController {
  createTheme = asyncHandler(async (req, res) => {
    const result = await shopThemeService.createTheme(req);
    new CREATED({
      message: SHOP_THEME_MESSAGE.CREATE_SUCCESS,
      data: result,
    }).send(res);
  });

  getAllThemes = asyncHandler(async (req, res) => {
    const { page, limit, search } = req.query;
    const result = await shopThemeService.getAllThemes({ page, limit, search });
    new OK({
      message: SHOP_THEME_MESSAGE.GET_ALL_SUCCESS,
      data: result,
    }).send(res);
  });

  getThemeById = asyncHandler(async (req, res) => {
    const { themeId } = req.params;
    const result = await shopThemeService.getThemeById(themeId);
    new OK({
      message: SHOP_THEME_MESSAGE.GET_BY_ID_SUCCESS,
      data: result,
    }).send(res);
  });

  updateTheme = asyncHandler(async (req, res) => {
    const result = await shopThemeService.updateTheme(req);
    new OK({
      message: SHOP_THEME_MESSAGE.UPDATE_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteTheme = asyncHandler(async (req, res) => {
    const { themeId } = req.params;
    const result = await shopThemeService.deleteTheme(themeId);
    new OK({
      message: SHOP_THEME_MESSAGE.DELETE_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new ShopThemeController();
