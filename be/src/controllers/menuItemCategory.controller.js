"use strict";

const menuItemCategoryService = require("../services/menuItemCategory.service");
const { OK, CREATED } = require("../configs/success.response");
const { CATEGORY_MESSAGE } = require("../constants/message");


class MenuItemCategoryController {
  createCategory = async (req, res, next) => {
    try {
      const result = await menuItemCategoryService.createCategory(req);
      new CREATED({
        message: CATEGORY_MESSAGE.CREATE_CATEGORY_SUCCESS,
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

   getAllCategories = async (req, res, next) => {
    try {
      const result = await menuItemCategoryService.getAllCategories();
      new OK({
        message: CATEGORY_MESSAGE.GET_ALL_CATEGORY_SUCCESS,
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

   getPublicCategories = async (req, res, next) => {
    try {
      const result = await menuItemCategoryService.getPublicCategories();
      new OK({
        message: CATEGORY_MESSAGE.GET_PUBLIC_CATEGORY_LIST_SUCCESS,
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

   updateCategory = async (req, res, next) => {
    try {
      const result = await menuItemCategoryService.updateCategory(req);
      new OK({
        message: CATEGORY_MESSAGE.UPDATE_CATEGORY_SUCCESS,
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };

   deleteCategory = async (req, res, next) => {
    try {
      const result = await menuItemCategoryService.deleteCategory(req);
      new OK({
        message: CATEGORY_MESSAGE.DELETE_CATEGORY_SUCCESS,
        data: result,
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new MenuItemCategoryController();