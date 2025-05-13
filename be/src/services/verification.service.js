"use strict";

const { BadRequestError, NotFoundError } = require("../configs/error.response");
const shopVerificationModel = require("../models/shopVerification.model");
const shopModel = require("../models/shop.model");
const cloudinary = require("../configs/cloudinary.config");
const { getSelectData, getInfoData } = require("../utils");

const getAllVerifications = async (req) => {
  try {
    const { page = 1, limit = 10, status, shopId } = req.query;
    const skip = (page - 1) * limit;

    const query = {};
    if (status) query.status = status;
    if (shopId) query.shop_id = shopId;

    const verifications = await shopVerificationModel
      .find(query)
      .populate("shop_id", "name address owner_id")
      .select(
        getSelectData([
          "_id",
          "shop_id",
          "document_type",
          "documents",
          "status",
          "submitted_at",
          "reason",
          "createdAt",
          "updatedAt",
        ])
      )
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await shopVerificationModel.countDocuments(query);

    return {
      verifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    throw new BadRequestError("Failed to retrieve verifications");
  }
};

const getVerificationById = async (req) => {
  try {
    const { verificationId } = req.params;

    const verification = await shopVerificationModel
      .findById(verificationId)
      .populate("shop_id", "name address owner_id")
      .populate("reviewed_by", "email")
      .select(
        getSelectData([
          "_id",
          "shop_id",
          "document_type",
          "documents",
          "status",
          "submitted_at",
          "reviewed_by",
          "reviewed_at",
          "reason",
          "createdAt",
          "updatedAt",
        ])
      )
      .lean();

    if (!verification) {
      throw new NotFoundError("Verification not found");
    }

    return { verification };
  } catch (error) {
    throw error instanceof NotFoundError ? error : new BadRequestError("Failed to retrieve verification");
  }
};

const reviewVerification = async (req) => {
  try {
    const { verificationId } = req.params;
    const { userId } = req.user;
    const { status, reason } = req.body;

    if (!["Approved", "Rejected"].includes(status)) {
      throw new BadRequestError("Status must be Approved or Rejected");
    }

    const verification = await shopVerificationModel.findById(verificationId);
    if (!verification) {
      throw new NotFoundError("Verification not found");
    }

    if (verification.status !== "Pending") {
      throw new BadRequestError("Verification already reviewed");
    }

    verification.status = status;
    verification.reviewed_by = userId;
    verification.reviewed_at = new Date();
    if (reason) verification.reason = reason;

    await verification.save();

    // Cập nhật trạng thái shop nếu phê duyệt
    if (status === "Approved") {
      await shopModel.findByIdAndUpdate(verification.shop_id, { status: "Active" });
    }

    const updatedVerification = await shopVerificationModel
      .findById(verificationId)
      .populate("shop_id", "name address owner_id")
      .populate("reviewed_by", "email")
      .select(
        getSelectData([
          "_id",
          "shop_id",
          "document_type",
          "documents",
          "status",
          "submitted_at",
          "reviewed_by",
          "reviewed_at",
          "reason",
          "createdAt",
          "updatedAt",
        ])
      )
      .lean();

    return { verification: updatedVerification };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof BadRequestError
      ? error
      : new BadRequestError("Failed to review verification");
  }
};

const deleteVerification = async (req) => {
  try {
    const { verificationId } = req.params;

    const verification = await shopVerificationModel.findById(verificationId);
    if (!verification) {
      throw new NotFoundError("Verification not found");
    }

    // Xóa ảnh trên Cloudinary
    if (verification.documents && verification.documents.length > 0) {
      await Promise.all(
        verification.documents.map((doc) =>
          cloudinary.uploader.destroy(doc.publicId).catch((err) => console.error("Failed to delete document:", err))
        )
      );
    }

    await shopVerificationModel.findByIdAndDelete(verificationId);

    return { message: "Verification deleted successfully" };
  } catch (error) {
    throw error instanceof NotFoundError ? error : new BadRequestError("Failed to delete verification");
  }
};

module.exports = {
  getAllVerifications,
  getVerificationById,
  reviewVerification,
  deleteVerification,
};