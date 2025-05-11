"use strict";

const { BadRequestError, NotFoundError } = require("../configs/error.response");
const menuItemCategoryModel = require("../models/menuItemCategory.model");
const shopMenuItemModel = require("../models/shopMenuItem.model");
const { getSelectData, getInfoData } = require("../utils");

const createCategory = async (req) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      throw new BadRequestError("Name is required");
    }

    const existingCategory = await menuItemCategoryModel.findOne({ name });
    if (existingCategory) {
      throw new BadRequestError("Category name already exists");
    }

    const category = await menuItemCategoryModel.create({ name, description });

    return {
      category: getInfoData({
        fields: ["_id", "name", "description", "createdAt", "updatedAt"],
        object: category,
      }),
    };
  } catch (error) {
    throw error instanceof BadRequestError ? error : new BadRequestError("Failed to create category");
  }
};

const getAllCategories = async () => {
  try {
    const categories = await menuItemCategoryModel
      .find()
      .select(getSelectData(["_id", "name", "description", "createdAt", "updatedAt"]))
      .lean();

    return { categories };
  } catch (error) {
    throw new BadRequestError("Failed to retrieve categories");
  }
};

const getPublicCategories = async () => {
  try {
    const categories = await menuItemCategoryModel
      .find()
      .select(getSelectData(["_id", "name"]))
      .lean();

    return { categories };
  } catch (error) {
    throw new BadRequestError("Failed to retrieve public categories");
  }
};

const updateCategory = async (req) => {
  try {
    const { categoryId } = req.params;
    const { name, description } = req.body;

    if (!name) {
      throw new BadRequestError("Name is required");
    }

    const category = await menuItemCategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    const existingCategory = await menuItemCategoryModel.findOne({ name, _id: { $ne: categoryId } });
    if (existingCategory) {
      throw new BadRequestError("Category name already exists");
    }

    const updatedCategory = await menuItemCategoryModel.findByIdAndUpdate(
      categoryId,
      { name, description },
      { new: true }
    );

    return {
      category: getInfoData({
        fields: ["_id", "name", "description", "createdAt", "updatedAt"],
        object: updatedCategory,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof BadRequestError
      ? error
      : new BadRequestError("Failed to update category");
  }
};

const deleteCategory = async (req) => {
  try {
    const { categoryId } = req.params;

    const category = await menuItemCategoryModel.findById(categoryId);
    if (!category) {
      throw new NotFoundError("Category not found");
    }

    // Kiểm tra xem danh mục có được sử dụng trong menu item không
    const menuItem = await shopMenuItemModel.findOne({ category: categoryId });
    if (menuItem) {
      throw new BadRequestError("Category is in use by menu items");
    }

    await menuItemCategoryModel.findByIdAndDelete(categoryId);

    return { message: "Category deleted successfully" };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof BadRequestError
      ? error
      : new BadRequestError("Failed to delete category");
  }
};

module.exports = {
  createCategory,
  getAllCategories,
  getPublicCategories,
  updateCategory,
  deleteCategory,
};