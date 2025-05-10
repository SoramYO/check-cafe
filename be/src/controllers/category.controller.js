"use strict";

const { OK } = require("../configs/success.response");
const { CATEGORY_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const categoryService = require("../services/category.service");

class CategoryController {
    getCategories = asyncHandler(async (req, res, next) => {
        const result = await categoryService.getCategories(req.query);
        new OK({ message: CATEGORY_MESSAGE.GET_CATEGORY_LIST_SUCCESS, data: result }).send(res);
    });
    createCategory = asyncHandler(async (req, res, next) => {
        const result = await categoryService.createCategory(req.body);
        new OK({ message: CATEGORY_MESSAGE.CREATE_CATEGORY_SUCCESS, data: result }).send(res);
    });
    updateCategory = asyncHandler(async (req, res, next) => {
        const result = await categoryService.updateCategory(req.params.id, req.body);
        new OK({ message: CATEGORY_MESSAGE.UPDATE_CATEGORY_SUCCESS, data: result }).send(res);
    });
}

module.exports = new CategoryController();
