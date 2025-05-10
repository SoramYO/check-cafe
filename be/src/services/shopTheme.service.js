"use strict";

const { BadRequestError, NotFoundError } = require("../configs/error.response");
const shopThemeModel = require("../models/shopTheme.model");
const cloudinary = require("cloudinary").v2;
const {
  getInfoData,
  getSelectData,
  removeUndefinedObject,
} = require("../utils");
const { getPaginatedData } = require("../helpers/mongooseHelper");

const createTheme = async (req) => {
  try {
    const { name, description } = req.body;
    const file = req.file; // Ảnh từ multer-storage-cloudinary

    // Kiểm tra input
    if (!name) {
      throw new BadRequestError("Name is required");
    }

    // Xử lý theme_image
    let themeImage = shopThemeModel.schema.paths.theme_image.default();
    let themeImagePublicId = null;

    if (file) {
      themeImage = file.path; // URL từ Cloudinary
      themeImagePublicId = file.filename || file.public_id;
    }

    // Tạo theme mới
    const theme = await shopThemeModel.create({
      name,
      description,
      theme_image: themeImage,
      theme_image_public_id: themeImagePublicId,
    });

    // Lọc dữ liệu trả về
    return {
      theme: getInfoData({
        fields: [
          "_id",
          "name",
          "description",
          "theme_image",
          "createdAt",
          "updatedAt",
        ],
        object: theme,
      }),
    };
  } catch (error) {
    // Xóa ảnh nếu upload thất bại
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw new BadRequestError(error.message || "Failed to create shop theme");
  }
};

const getAllThemes = async ({ page = 1, limit = 10, search = "" }) => {
  try {
    const result = await getPaginatedData({
      model: shopThemeModel,
      page,
      limit,
      select: getSelectData([
        "_id",
        "name",
        "description",
        "theme_image",
        "createdAt",
        "updatedAt",
      ]),
      search,
      searchFields: ["name", "description"],
      sort: { createdAt: -1 },
    });

    return {
      themes: result.data,
      metadata: result.metadata,
    };
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to retrieve shop themes"
    );
  }
};

const getThemeById = async (themeId) => {
  try {
    if (!themeId) {
      throw new BadRequestError("Theme ID is required");
    }

    const theme = await shopThemeModel
      .findById(themeId)
      .select(
        getSelectData([
          "_id",
          "name",
          "description",
          "theme_image",
          "createdAt",
          "updatedAt",
        ])
      )
      .lean();

    if (!theme) {
      throw new NotFoundError("Shop theme not found");
    }

    return { theme };
  } catch (error) {
    throw error instanceof NotFoundError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve shop theme");
  }
};

const updateTheme = async (req) => {
  try {
    const { themeId } = req.params;
    const { name, description } = req.body;
    const file = req.file;

    if (!themeId) {
      throw new BadRequestError("Theme ID is required");
    }

    const theme = await shopThemeModel.findById(themeId);
    if (!theme) {
      throw new NotFoundError("Shop theme not found");
    }

    // Xây dựng dữ liệu cập nhật
    const updateData = removeUndefinedObject({ name, description });

    // Xử lý theme_image
    if (file) {
      // Xóa ảnh cũ nếu có
      if (theme.theme_image_public_id) {
        await cloudinary.uploader.destroy(theme.theme_image_public_id);
      }
      updateData.theme_image = file.path;
      updateData.theme_image_public_id = file.filename || file.public_id;
    }

    // Cập nhật theme
    const updatedTheme = await shopThemeModel
      .findByIdAndUpdate(themeId, updateData, {
        new: true,
        runValidators: true,
      })
      .select(
        getSelectData([
          "_id",
          "name",
          "description",
          "theme_image",
          "createdAt",
          "updatedAt",
        ])
      );

    if (!updatedTheme) {
      throw new NotFoundError("Shop theme not found");
    }

    return {
      theme: getInfoData({
        fields: [
          "_id",
          "name",
          "description",
          "theme_image",
          "createdAt",
          "updatedAt",
        ],
        object: updatedTheme,
      }),
    };
  } catch (error) {
    // Xóa ảnh nếu upload thất bại
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error instanceof NotFoundError
      ? error
      : new BadRequestError(error.message || "Failed to update shop theme");
  }
};

const deleteTheme = async (themeId) => {
  try {
    if (!themeId) {
      throw new BadRequestError("Theme ID is required");
    }

    const theme = await shopThemeModel.findById(themeId);
    if (!theme) {
      throw new NotFoundError("Shop theme not found");
    }

    // Xóa ảnh trên Cloudinary
    if (theme.theme_image_public_id) {
      await cloudinary.uploader.destroy(theme.theme_image_public_id);
    }

    await theme.deleteOne();

    return { message: "Shop theme deleted successfully" };
  } catch (error) {
    throw error instanceof NotFoundError
      ? error
      : new BadRequestError(error.message || "Failed to delete shop theme");
  }
};

module.exports = {
  createTheme,
  getAllThemes,
  getThemeById,
  updateTheme,
  deleteTheme,
};
