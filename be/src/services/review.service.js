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
            const { shop_id, rating, comment } = req.body;
            const  images = req.files;
            const userId = req.user.userId;

            // Validate required fields
            if (!shop_id || !rating || !comment) {
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
            const shop = await shopModel.findById(shop_id);
            if (!shop) {
                throw new NotFoundError("Shop not found");
            }

            //one person can only review one time one shop 
            const existingReview = await reviewModel.findOne({ shop_id: shop_id, user_id: userId });
            if (existingReview) {
                throw new BadRequestError("You have already reviewed this shop");
            }

            shop.rating_avg = (shop.rating_avg * shop.rating_count + rating) / (shop.rating_count + 1);

            shop.rating_count = shop.rating_count + 1;
            await shop.save();


            // Create review with correct field names
            const review = await reviewModel.create({
                shop_id: shop_id,
                user_id: userId,
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
            console.log(error);
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
            const reviewDocs = await reviewModel.find({ shop_id: shopId })
                .populate([
                    { path: "user_id", select: "_id full_name avatar" },
                ])
                .select(getSelectData([
                    "_id", "shop_id", "user_id", "rating", "comment", "images", "createdAt", "updatedAt"
                ]))
                .sort({ createdAt: -1 });

            const reviews = reviewDocs.map((review)  =>
                getInfoData({
                    fields: ["_id", "shop_id", "user_id", "rating", "comment", "images", "createdAt", "updatedAt"],
                    object: review,
                })
            );

            // Calculate star counts
            const starCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            reviewDocs.forEach(r => {
                const star = Math.round(r.rating);
                if (starCounts[star] !== undefined) starCounts[star]++;
            });

            return {
                reviews,
                starCounts,
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
                ])
                .select(getSelectData([
                    "_id", "shop_id", "user_id", "rating", "comment", "images", "createdAt", "updatedAt"
                ]))
                .lean();

            return {
                review: getInfoData({   
                    fields: ["_id", "shop_id", "user_id", "rating", "comment", "images", "createdAt", "updatedAt"],
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
            const review = await reviewModel.findById(reviewId).populate("shop_id");
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
                    fields: ["_id", "shop_id", "user_id", "rating", "comment", "images", "createdAt", "updatedAt"],
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

