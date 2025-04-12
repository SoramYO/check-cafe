"use strict";

const { BadRequestError } = require("../configs/error.response");

const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const processUploadResult = (file) => ({
  url: file.path, // URL từ Cloudinary được gán vào file.path
  publicId: file.filename || file.public_id, // publicId có thể là filename hoặc public_id
});

const uploadSingleImage = async ({
  file,
  folder = "checkafe",
  transformations = [],
  options = {},
}) => {
  try {
    if (!file) {
      throw new BadRequestError("No file provided for upload");
    }

    // Với multer-storage-cloudinary, file đã được upload trực tiếp
    // Kết quả nằm trong file.path (url) và file.filename/public_id (publicId)
    return processUploadResult(file);
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to upload single image to Cloudinary"
    );
  }
};

const uploadMultipleImages = async ({
  files,
  folder = "checkafe",
  transformations = [],
  options = {},
}) => {
  try {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestError("No files provided for upload");
    }

    return files.map(processUploadResult);
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to upload multiple images to Cloudinary"
    );
  }
};

const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new BadRequestError("Public ID is required to delete image");
    }
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to delete image from Cloudinary"
    );
  }
};

const deleteMultipleImages = async (publicIds) => {
  try {
    if (!publicIds || !Array.isArray(publicIds) || publicIds.length === 0) {
      throw new BadRequestError("No public IDs provided for deletion");
    }
    await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
  } catch (error) {
    throw new BadRequestError(
      error.message || "Failed to delete multiple images from Cloudinary"
    );
  }
};

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteImage,
  deleteMultipleImages,
};
