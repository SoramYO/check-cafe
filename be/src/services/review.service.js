"use strict";

const {
    BadRequestError,
    NotFoundError,
    ForbiddenError,
} = require("../configs/error.response");
const shopModel = require("../models/shop.model");
const shopImageModel = require("../models/shopImage.model");
const shopSeatModel = require("../models/shopSeat.model");
const shopMenuItemModel = require("../models/shopMenuItem.model");
const shopTimeSlotModel = require("../models/shopTimeSlot.model");
const shopVerificationModel = require("../models/shopVerification.model");
const cloudinary = require("cloudinary").v2;
const {
    getInfoData,
    getSelectData,
    removeUndefinedObject,
} = require("../utils");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const menuItemCategoryModel = require("../models/menuItemCategory.model");
const mongoose = require("mongoose");
const shopAmenityModel = require("../models/shopAmenity.model");
const reviewModel = require("../models/review.model");
const userModel = require("../models/user.model");
const { USER_ROLE } = require("../constants/enum");


class ReviewService {
    createReview = async (req) => {
        try {
            const { shopId, userId, reservationId, rating, comment, images } = req.body;

            // Validate required fields
            if (!shopId || !userId || !reservationId || !rating || !comment) {
                throw new BadRequestError("Missing required fields");
            }

            // Upload images to cloudinary if provided
            let imageUrls = [];
            if (images && images.length > 0) {
                imageUrls = await Promise.all(
                    images.map(async (image) => {
                        const result = await cloudinary.uploader.upload(image, {
                            folder: "reviews",
                        });
                        return result.secure_url;
                    })
                );
            }

            // Check if shop exists
            const shop = await shopModel.findById(shopId);
            if (!shop) {
                throw new NotFoundError("Shop not found");
            }

            // Check if user exists
            const user = await userModel.findById(userId);
            if (!user) {
                throw new NotFoundError("User not found");
            }

            // Check if user is shop owner
            if (user.role === USER_ROLE.SHOP_OWNER) {
                throw new ForbiddenError("Shop owners cannot create reviews");
            }

            // Create review with correct field names
            const review = await reviewModel.create({
                shop_id: shopId,
                user_id: userId,
                reservation_id: reservationId,
                rating,
                comment,
                images: imageUrls,
            });

            return {
                review: getInfoData({
                    fields: ["_id", "shop_id", "user_id", "reservation_id", "rating", "comment", "images", "createdAt", "updatedAt"],
                    object: review,
                }),
            };
        } catch (error) {
            throw error instanceof BadRequestError
                ? error
                : new BadRequestError(error.message || "Failed to create review");
        }
    }

    getReviews = async (req) => {
        try {
            const {
                page = 1,
                limit = 10,
                sortBy = "createdAt",
                sortOrder = "desc",
                search,
            } = req.query;

            const query = {};

            if (search) {
                query.$or = [
                    { comment: { $regex: search, $options: "i" } },
                ];
            }

            const paginateOptions = {
                model: reviewModel,
                query,
                page,
                limit,
                select: getSelectData([
                    "_id", "shop_id", "user_id", "reservation_id", "rating", "comment", "images", "createdAt", "updatedAt"
                ]),
                sort: { [sortBy]: sortOrder === "asc" ? 1 : -1 },
            };

            const { data: reviews, metadata } = await getPaginatedData(paginateOptions);

            // Fetch user info for each review
            const userIds = reviews.map(r => r.user_id);
            const users = await userModel.find({ _id: { $in: userIds } })
                .select(getSelectData(["_id", "full_name", "avatar"]))
                .lean();
            const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

            // Attach user info to each review
            const reviewsWithUser = reviews.map(r => ({
                ...r.toObject(),
                user: userMap[r.user_id.toString()] || null,
            }));

            return {
                reviews: reviewsWithUser,
                metadata,
            };
        } catch (error) {
            throw error instanceof BadRequestError
                ? error
                : new BadRequestError(error.message || "Failed to get reviews");
        }
    }
    getReviewsByShopId = async (req) => {
        try {
            const { shopId } = req.params;
            const reviews = await reviewModel.find({ shop_id: shopId })
                .populate([
                    { path: "user_id", select: "_id name avatar" },
                    { path: "reservation_id", select: "_id" }
                ])
                .select(getSelectData([
                    "_id", "shop_id", "user_id", "reservation_id", "rating", "comment", "images", "createdAt", "updatedAt"
                ]))
                .sort({ createdAt: -1 });

            return {
                reviews: getInfoData({
                    fields: ["_id", "shop_id", "user_id", "reservation_id", "rating", "comment", "images", "createdAt", "updatedAt"],
                    object: reviews,
                }),
            };
        } catch (error) {
            throw error instanceof BadRequestError
                ? error
                : new BadRequestError(error.message || "Failed to get reviews by shop id");
        }
    }
    getReviewById = async (req) => {
        try {
            const { reviewId } = req.params;
            const review = await reviewModel.findById(reviewId)
                .populate([
                    { path: "user_id", select: "_id name avatar" },
                    { path: "reservation_id", select: "_id" }
                ])
                .select(getSelectData([
                    "_id", "shop_id", "user_id", "reservation_id", "rating", "comment", "images", "createdAt", "updatedAt"
                ]))
                .lean();

            return {
                review: getInfoData({   
                    fields: ["_id", "shop_id", "user_id", "reservation_id", "rating", "comment", "images", "createdAt", "updatedAt"],
                    object: review,
                }),
            };
        } catch (error) {
            throw error instanceof BadRequestError
                ? error
                : new BadRequestError(error.message || "Failed to get review by id");
        }
    }
    updateReview = async (req) => {
        try {
            const { reviewId } = req.params;
            const { userId } = req.user;
            const { rating, comment, images } = req.body;


            // Check if review exists
            const review = await reviewModel.findById(reviewId);
            if (!review) {
                throw new NotFoundError("Review not found");
            }
            // Check if user is shop owner or review owner
            if (review.user_id.toString() !== userId && review.shop_id.owner_id.toString() !== userId) {
                throw new ForbiddenError("You are not authorized to update this review");
            }

            // Update review with correct field names
            const updatedReview = await reviewModel.findByIdAndUpdate(
                reviewId,
                { rating, comment, images },
                { new: true }
            );

            return {
                review: getInfoData({
                    fields: ["_id", "shop_id", "user_id", "reservation_id", "rating", "comment", "images", "createdAt", "updatedAt"],
                    object: updatedReview,
                }),
            };
        } catch (error) {
            throw error instanceof BadRequestError
                ? error
                : new BadRequestError(error.message || "Failed to update review");
        }
    }
    deleteReview = async (req) => {
        try {
            const { reviewId } = req.params;
            const { userId } = req.user;

            // Check if review exists
            const review = await reviewModel.findById(reviewId);
            if (!review) {
                throw new NotFoundError("Review not found");
            }

            // Check if user is shop owner or review owner
            if (review.user_id.toString() !== userId && review.shop_id.owner_id.toString() !== userId) {
                throw new ForbiddenError("You are not authorized to delete this review");
            }

            // Delete review
            await reviewModel.findByIdAndDelete(reviewId);

            return {
                message: "Review deleted successfully",
            };
        } catch (error) {
            throw error instanceof BadRequestError
                ? error
                : new BadRequestError(error.message || "Failed to delete review");
        }
    }
}

module.exports = new ReviewService();

