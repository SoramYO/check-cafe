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
const { calculateDistance, getDistanceFromLatLonInKm } = require("../utils/distanceCaculate");
const userModel = require("../models/user.model");
const { signUp } = require("./access.service");
const reviewModel = require("../models/review.model");
const reservationModel = require("../models/reservation.model");
const paymentModel = require("../models/payment.model");
const bcrypt = require("bcryptjs");
const getAllPublicShops = async (req) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = "rating_avg",
      sortOrder = "desc",
      amenities,
      search,
      latitude,
      longitude,
      themes,
      radius = 5000
    } = req.query;

    // Kiểm tra tham số đầu vào
    if ((latitude && !longitude) || (!latitude && longitude)) {
      throw new BadRequestError("Both latitude and longitude must be provided");
    }
    if (latitude && longitude) {
      if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
        throw new BadRequestError("latitude and longitude must be valid numbers");
      }
      if (isNaN(parseInt(radius)) || parseInt(radius) < 0) {
        throw new BadRequestError("radius must be a non-negative number");
      }
    }
    if (amenities && !Array.isArray(amenities.split(","))) {
      throw new BadRequestError("amenities must be a comma-separated string");
    }
    if (themes && !Array.isArray(themes.split(","))) {
      throw new BadRequestError("themes must be a comma-separated string");
    }


    // Xây dựng query
    const query = {
      status: "Active",
    };

    // Lọc theo amenities
    if (amenities) {
      const amenityIds = amenities.split(",").map(id =>
        new mongoose.Types.ObjectId(id.trim())
      );
      query.amenities = { $all: amenityIds };
    }

    if (themes) {
      const themeIds = themes.split(",").map(id =>
        new mongoose.Types.ObjectId(id.trim())
      );
      query.theme_ids = { $all: themeIds };
    }

    // Tìm kiếm theo vị trí gần (nếu có latitude và longitude)
    if (latitude && longitude) {
      // $geoWithin with $centerSphere for radius in kilometers
      query.location = {
        $geoWithin: {
          $centerSphere: [
            [parseFloat(longitude), parseFloat(latitude)],
            parseFloat(radius) / 6378.1 // radius in radians (km / earth radius in km)
          ]
        }
      };
    }

    // Xây dựng sort
    const validSortFields = [
      "rating_avg",
      "rating_count",
      "name",
      "createdAt",
      "updatedAt",
    ];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestError(
        `Invalid sortBy. Must be one of: ${validSortFields.join(", ")}`
      );
    }
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Cấu hình cho getPaginatedData
    const paginateOptions = {
      model: shopModel,
      query,
      page,
      limit,
      select: getSelectData([
        "_id",
        "name",
        "address",
        "description",
        "location",
        "phone",
        "website",
        "theme_ids",
        "vip_status",
        "rating_avg",
        "rating_count",
        "amenities",
        "opening_hours",
        "formatted_opening_hours",
        "is_open",
        "createdAt",
        "updatedAt",
      ]),
      populate: [
        { path: "theme_ids", select: "_id name description theme_image" },
        { path: "amenities", select: "_id icon label" },
      ],
      search,
      searchFields: ["name"],
      sort,
    };

    // Lấy dữ liệu phân trang
    const result = await getPaginatedData(paginateOptions);

    // Lấy ảnh chính cho mỗi quán
    const shopsWithImage = await Promise.all(
      result.data.map(async (shop) => {


        const mainImage = await shopImageModel
          .findOne({ shop_id: shop._id })
          .select("url publicId")
          .lean();
        return {
          ...getInfoData({
            fields: [
              "_id",
              "name",
              "address",
              "location",
              "description",
              "phone",
              "website",
              "theme_ids",
              "vip_status",
              "rating_avg",
              "rating_count",
              "amenities",
              "opening_hours",
              "formatted_opening_hours",
              "is_open",
              "createdAt",
              "updatedAt",
            ],
            object: shop,
          }),
          mainImage: mainImage
            ? { url: mainImage.url, publicId: mainImage.publicId }
            : null,
        };
      })
    );

    const shopsWithDistance = shopsWithImage.map(shop => {
      const distance = getDistanceFromLatLonInKm(parseFloat(longitude), parseFloat(latitude), parseFloat(shop.location.coordinates[0]), parseFloat(shop.location.coordinates[1]));

      return {
        ...shop,
        distance: distance
      };
    });

    return {
      shops: shopsWithDistance,
      metadata: {
        totalItems: result.metadata.total,
        totalPages: result.metadata.totalPages,
        currentPage: result.metadata.page,
        limit: result.metadata.limit,
      },
      message: shopsWithImage.length === 0 ? "No public shops found" : undefined,
    };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve public shops");
  }
};

const createShop = async (req) => {
  try {
    const { userId } = req.user;
    const {
      name,
      address,
      description,
      phone,
      website,
      latitude,
      longitude,
      amenities,
      theme_ids,
      opening_hours
    } = req.body;

    // Kiểm tra input bắt buộc
    if (!name || !address || !description || !phone || !website || typeof latitude === 'undefined' || typeof longitude === 'undefined') {
      throw new BadRequestError("Name, address, description, phone, website, latitude, and longitude are required");
    }

    // Validate opening_hours
    if (opening_hours) {
      if (!Array.isArray(opening_hours)) {
        throw new BadRequestError("opening_hours must be an array");
      }
      const validDays = [0, 1, 2, 3, 4, 5, 6];
      const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
      for (const entry of opening_hours) {
        if (!validDays.includes(entry.day)) {
          throw new BadRequestError("Invalid day in opening_hours (must be 0-6)");
        }
        // Nếu là ngày đóng cửa thì bỏ qua kiểm tra hours
        if (entry.is_closed) continue;
        if (!entry.hours || !Array.isArray(entry.hours) || entry.hours.length === 0) {
          throw new BadRequestError(`Hours required for day ${entry.day} when not closed`);
        }
        for (const h of entry.hours) {
          if (!timeRegex.test(h.open) || !timeRegex.test(h.close)) {
            throw new BadRequestError(`Invalid time format in hours for day ${entry.day}`);
          }
          // Nếu mở 24/24 thì open: 00:00, close: 23:59 là hợp lệ
          const [openHour, openMinute] = h.open.split(":").map(Number);
          const [closeHour, closeMinute] = h.close.split(":").map(Number);
          const openTime = openHour * 60 + openMinute;
          const closeTime = closeHour * 60 + closeMinute;
          if (openTime >= closeTime) {
            throw new BadRequestError(`Open time must be before close time for day ${entry.day}`);
          }
        }
      }
    }

    // Convert amenities sang ObjectId nếu là string
    let amenitiesIds = undefined;
    if (Array.isArray(amenities)) {
      amenitiesIds = amenities
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    // Convert theme_ids sang ObjectId nếu là string
    let themeIds = undefined;
    if (Array.isArray(theme_ids)) {
      themeIds = theme_ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    // Tạo quán mới
    const shop = await shopModel.create({
      name,
      address,
      description,
      phone,
      website,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(longitude),
          parseFloat(latitude)
        ],
      },
      owner_id: userId,
      amenities: amenitiesIds,
      theme_ids: themeIds,
      opening_hours,
      status: "Active"
    });

    return {
      shop: getInfoData({
        fields: [
          "_id",
          "name",
          "address",
          "description",
          "phone",
          "website",
          "location",
          "owner_id",
          "theme_ids",
          "amenities",
          "opening_hours",
          "createdAt",
          "updatedAt",
        ],
        object: shop,
      }),
    };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to create shop");
  }
};

const createShopByAdmin = async (req) => {
  try {
    const {
      name,
      address,
      description,
      phone,
      website,
      latitude,
      longitude,
      amenities,
      theme_ids,
      opening_hours,
      owner_id
    } = req.body;

    // Kiểm tra input bắt buộc
    if (!name || !address || !description || !phone || !website || typeof latitude === 'undefined' || typeof longitude === 'undefined' || !owner_id) {
      throw new BadRequestError("Name, address, description, phone, website, latitude, longitude, and owner_id are required");
    }

    // Kiểm tra owner_id có tồn tại và là SHOP_OWNER
    const owner = await userModel.findById(owner_id);
    if (!owner) {
      throw new BadRequestError("Owner not found");
    }
    if (owner.role !== "SHOP_OWNER") {
      throw new BadRequestError("Owner must be a SHOP_OWNER");
    }

    // Kiểm tra owner đã có shop chưa
    const existingShop = await shopModel.findOne({ owner_id });
    if (existingShop) {
      throw new BadRequestError("This shop owner already has a shop");
    }

    // Validate opening_hours
    if (opening_hours) {
      if (!Array.isArray(opening_hours)) {
        throw new BadRequestError("opening_hours must be an array");
      }
      const validDays = [0, 1, 2, 3, 4, 5, 6];
      const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
      for (const entry of opening_hours) {
        if (!validDays.includes(entry.day)) {
          throw new BadRequestError("Invalid day in opening_hours (must be 0-6)");
        }
        if (entry.is_closed) continue;
        if (!entry.hours || !Array.isArray(entry.hours) || entry.hours.length === 0) {
          throw new BadRequestError(`Hours required for day ${entry.day} when not closed`);
        }
        for (const h of entry.hours) {
          if (!timeRegex.test(h.open) || !timeRegex.test(h.close)) {
            throw new BadRequestError(`Invalid time format in hours for day ${entry.day}`);
          }
          const [openHour, openMinute] = h.open.split(":").map(Number);
          const [closeHour, closeMinute] = h.close.split(":").map(Number);
          const openTime = openHour * 60 + openMinute;
          const closeTime = closeHour * 60 + closeMinute;
          if (openTime >= closeTime) {
            throw new BadRequestError(`Open time must be before close time for day ${entry.day}`);
          }
        }
      }
    }

    // Convert amenities sang ObjectId nếu là string
    let amenitiesIds = undefined;
    if (Array.isArray(amenities)) {
      amenitiesIds = amenities
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    // Convert theme_ids sang ObjectId nếu là string
    let themeIds = undefined;
    if (Array.isArray(theme_ids)) {
      themeIds = theme_ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    // Tạo quán mới
    const shop = await shopModel.create({
      name,
      address,
      description,
      phone,
      website,
      location: {
        type: "Point",
        coordinates: [
          parseFloat(longitude),
          parseFloat(latitude)
        ],
      },
      owner_id,
      amenities: amenitiesIds,
      theme_ids: themeIds,
      opening_hours,
      status: "Active"
    });

    return {
      shop: getInfoData({
        fields: [
          "_id",
          "name",
          "address",
          "description",
          "phone",
          "website",
          "location",
          "owner_id",
          "theme_ids",
          "amenities",
          "opening_hours",
          "createdAt",
          "updatedAt",
        ],
        object: shop,
      }),
    };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to create shop");
  }
};

const updateShop = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId } = req.user;
    const { name, address, description, phone, website, latitude, longitude, amenities, theme_ids, opening_hours } = req.body;

    // Tìm shop
    const shop = await shopModel.findById(shopId);
    if (!shop) throw new NotFoundError("Shop not found");

    // Kiểm tra quyền sở hữu
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Validate opening_hours nếu có
    if (opening_hours) {
      if (!Array.isArray(opening_hours)) {
        throw new BadRequestError("opening_hours must be an array");
      }
      const validDays = [0, 1, 2, 3, 4, 5, 6];
      const timeRegex = /^([0-1]\d|2[0-3]):[0-5]\d$/;
      for (const entry of opening_hours) {
        if (!validDays.includes(entry.day)) {
          throw new BadRequestError("Invalid day in opening_hours (must be 0-6)");
        }
        if (entry.is_closed) continue;
        if (!entry.hours || !Array.isArray(entry.hours) || entry.hours.length === 0) {
          throw new BadRequestError(`Hours required for day ${entry.day} when not closed`);
        }
        for (const h of entry.hours) {
          if (!timeRegex.test(h.open) || !timeRegex.test(h.close)) {
            throw new BadRequestError(`Invalid time format in hours for day ${entry.day}`);
          }
          const [openHour, openMinute] = h.open.split(":").map(Number);
          const [closeHour, closeMinute] = h.close.split(":").map(Number);
          const openTime = openHour * 60 + openMinute;
          const closeTime = closeHour * 60 + closeMinute;
          if (openTime >= closeTime) {
            throw new BadRequestError(`Open time must be before close time for day ${entry.day}`);
          }
        }
      }
    }

    // amenities: convert sang ObjectId nếu là string
    let amenitiesIds;
    if (Array.isArray(amenities)) {
      amenitiesIds = amenities
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    // theme_ids: convert sang ObjectId nếu là string
    let themeIds;
    if (Array.isArray(theme_ids)) {
      themeIds = theme_ids
        .filter((id) => mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    // location: chỉ update nếu có cả latitude và longitude
    let location;
    if (typeof latitude !== 'undefined' && typeof longitude !== 'undefined') {
      location = {
        type: "Point",
        coordinates: [parseFloat(longitude), parseFloat(latitude)],
      };
    }

    // Chuẩn bị dữ liệu update
    const updateData = removeUndefinedObject({
      name,
      address,
      description,
      phone,
      website,
      location,
      amenities: amenitiesIds,
      theme_ids: themeIds,
      opening_hours,
    });

    // Update shop
    const updatedShop = await shopModel.findByIdAndUpdate(
      shopId,
      updateData,
      { new: true, runValidators: true }
    ).select(
      getSelectData([
        "_id",
        "name",
        "address",
        "description",
        "phone",
        "website",
        "location",
        "owner_id",
        "theme_ids",
        "vip_status",
        "rating_avg",
        "rating_count",
        "status",
        "amenities",
        "opening_hours",
        "createdAt",
        "updatedAt",
      ])
    );

    return {
      shop: getInfoData({
        fields: [
          "_id",
          "name",
          "address",
          "location",
          "description",
          "phone",
          "website",
          "owner_id",
          "theme_ids",
          "vip_status",
          "rating_avg",
          "rating_count",
          "status",
          "description",
          "amenities",
          "opening_hours",
          "createdAt",
          "updatedAt",
        ],
        object: updatedShop,
      }),
    };
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof ForbiddenError) throw error;
    throw new BadRequestError(error.message || "Failed to update shop");
  }
};


const getShop = async (req) => {
  try {
    const { shopId } = req.params;

    const shop = await shopModel
      .findById(shopId)
      .populate([
        { path: "theme_ids", select: "_id name description theme_image" },
        { path: "amenities", select: "_id icon label" }

      ])
      .select(
        getSelectData([
          "_id",
          "name",
          "address",
          "description",
          "phone",
          "website",
          "location",
          "owner_id",
          "theme_ids",
          "vip_status",
          "rating_avg",
          "rating_count",
          "status",
          "amenities",
          "opening_hours",
          "formatted_opening_hours",
          "is_open",
          "createdAt",
          "updatedAt",
        ])
      )

    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Lấy main image
    const mainImageDoc = await shopImageModel
      .findOne({ shop_id: shopId })
      .select("url publicId")
      .lean();
    const mainImage = mainImageDoc ? { url: mainImageDoc.url, publicId: mainImageDoc.publicId } : null;

    // Lấy thông tin liên quan
    const images = await shopImageModel
      .find({ shop_id: shopId })
      .select("url caption created_at")
      .lean();
    const seats = await shopSeatModel
      .find({ shop_id: shopId })
      .select("seat_name description image is_premium is_available capacity")
      .lean();
    const menuItems = await shopMenuItemModel
      .find({ shop_id: shopId })
      .select("_id shop_id name description price category images is_available").populate([
        { path: "category", select: "_id name description" },
      ])
      .lean();
    const timeSlots = await shopTimeSlotModel
      .find({ shop_id: shopId })
      .select(
        "day_of_week start_time end_time max_regular_reservations max_premium_reservations is_active"
      )
      .lean();
    const verifications = await shopVerificationModel
      .find({ shop_id: shopId })
      .select(
        "document_type document_url status submitted_at reviewed_at reason"
      )
      .lean();

    const result = {
      shop: {
        ...getInfoData({
          fields: [
            "_id",
            "name",
            "address",
            "description",
            "phone",
            "website",
            "location",
            "owner_id",
            "theme_ids",
            "vip_status",
            "rating_avg",
            "rating_count",
            "status",
            "amenities",
            "opening_hours",
            "formatted_opening_hours",
            "is_open",
            "createdAt",
            "updatedAt",
          ],
          object: shop,
        }),
        mainImage,
        images,
        seats,
        menuItems,
        timeSlots,
        verifications,
      },
    };


    return result;
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve shop");
  }
};

const getAllShops = async (req) => {
  try {
    const { userId, role } = req.user;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      amenities,
      search,
    } = req.query;

    // Kiểm tra tham số đầu vào
    if (amenities && !Array.isArray(amenities.split(","))) {
      throw new BadRequestError("amenities must be a comma-separated string");
    }
    if (status && !["Active", "Inactive", "Pending", "Rejected"].includes(status)) {
      throw new BadRequestError("Invalid status");
    }

    // Xây dựng query
    const query = {};

    // Lọc theo owner_id nếu không phải ADMIN
    if (role !== "ADMIN") {
      query.owner_id = userId;
    }

    // Lọc theo status
    if (status) {
      query.status = status;
    }

    // Lọc theo amenities
    if (amenities) {
      query.amenities = { $all: amenities.split(",").map((item) => item.trim()) };
    }

    // Xây dựng sort
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "name",
      "rating_avg",
      "rating_count",
      "status",
    ];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestError(
        `Invalid sortBy. Must be one of: ${validSortFields.join(", ")}`
      );
    }
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Cấu hình cho getPaginatedData
    const paginateOptions = {
      model: shopModel,
      query,
      page,
      limit,
      select: getSelectData([
        "_id",
        "name",
        "address",
        "description",
        "phone",
        "website",
        "location",
        "owner_id",
        "theme_ids",
        "vip_status",
        "rating_avg",
        "rating_count",
        "status",
        "amenities",
        "opening_hours",
        "formatted_opening_hours",
        "is_open",
        "createdAt",
        "updatedAt",
      ]),
      populate: [
        { path: "theme_ids", select: "_id name description theme_image" },
        { path: "amenities", select: "_id icon label" },
        { path: "owner_id", select: "_id full_name email avatar" }
      ],
      search,
      searchFields: ["name"],
      sort,
    };

    // Lấy dữ liệu phân trang
    const result = await getPaginatedData(paginateOptions);

    // Format dữ liệu
    const shops = result.data.map((shop) =>
      getInfoData({
        fields: [
          "_id",
          "name",
          "address",
          "description",
          "phone",
          "website",
          "location",
          "owner_id",
          "theme_ids",
          "vip_status",
          "rating_avg",
          "rating_count",
          "status",
          "amenities",
          "opening_hours",
          "formatted_opening_hours",
          "is_open",
          "createdAt",
          "updatedAt",
        ],
        object: shop,
      })
    );

    return {
      shops,
      metadata: {
        totalItems: result.metadata.total,
        totalPages: result.metadata.totalPages,
        currentPage: result.metadata.page,
        limit: result.metadata.limit,
      },
      message: shops.length === 0 ? "No shops found" : undefined,
    };
  } catch (error) {
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve shops");
  }
};


const uploadShopImage = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId } = req.user;
    const { caption } = req.body;
    const file = req.file;

    // Tìm quán
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Kiểm tra file
    if (!file) {
      throw new BadRequestError("Image file is required");
    }

    // Tạo ảnh mới
    const image = await shopImageModel.create({
      shop_id: shopId,
      url: file.path,
      caption,
    });

    return {
      image: getInfoData({
        fields: ["_id", "shop_id", "url", "caption", "created_at"],
        object: image,
      }),
    };
  } catch (error) {
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to upload shop image");
  }
};

const assignThemes = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId } = req.user;
    const { theme_ids } = req.body;

    // Tìm quán
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Cập nhật theme_ids
    if (!Array.isArray(theme_ids)) {
      throw new BadRequestError("Theme IDs must be an array");
    }
    if (theme_ids.length === 0) {
      throw new BadRequestError("Theme IDs cannot be empty");
    }
    if (theme_ids.length > 5) {
      throw new BadRequestError("Maximum 5 theme IDs allowed");
    }
    shop.theme_ids = theme_ids || [];
    await shop.save();

    return {
      shop: getInfoData({
        fields: ["_id", "name", "theme_ids"],
        object: shop,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to assign themes");
  }
};

const createSeat = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId } = req.user;
    const { seat_name, description, is_premium, capacity } = req.body;
    const file = req.file;

    // Tìm quán
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Kiểm tra input chi tiết
    if (!seat_name || seat_name.trim().length === 0) {
      throw new BadRequestError("Seat name is required and cannot be empty");
    }

    if (!capacity || capacity < 1 || capacity > 20) {
      throw new BadRequestError("Capacity must be between 1 and 20 people");
    }

    // Kiểm tra tên chỗ ngồi đã tồn tại chưa
    const existingSeat = await shopSeatModel.findOne({
      shop_id: shopId,
      seat_name: seat_name.trim()
    });
    if (existingSeat) {
      throw new BadRequestError("Seat name already exists in this shop");
    }

    // Validate description length
    if (description && description.length > 500) {
      throw new BadRequestError("Description cannot exceed 500 characters");
    }

    // Tạo ghế
    const seat = await shopSeatModel.create({
      shop_id: shopId,
      seat_name: seat_name.trim(),
      description: description ? description.trim() : undefined,
      image: file ? file.path : undefined,
      is_premium: Boolean(is_premium),
      is_available: true, // Mặc định là có sẵn khi tạo mới
      capacity: parseInt(capacity),
    });

    return {
      seat: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "seat_name",
          "description",
          "image",
          "is_premium",
          "is_available",
          "capacity",
          "createdAt",
          "updatedAt",
        ],
        object: seat,
      }),
    };
  } catch (error) {
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to create seat");
  }
};

const updateSeat = async (req) => {
  try {
    const { shopId, seatId } = req.params;
    const { userId } = req.user;
    const { seat_name, description, is_premium, is_available, capacity } = req.body;
    const file = req.file;

    // Tìm quán
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Tìm ghế
    const seat = await shopSeatModel.findOne({ _id: seatId, shop_id: shopId });
    if (!seat) {
      throw new NotFoundError("Seat not found");
    }

    // Validate input nếu có
    if (seat_name !== undefined) {
      if (!seat_name || seat_name.trim().length === 0) {
        throw new BadRequestError("Seat name cannot be empty");
      }

      // Kiểm tra tên chỗ ngồi đã tồn tại chưa (trừ chính nó)
      const existingSeat = await shopSeatModel.findOne({
        shop_id: shopId,
        seat_name: seat_name.trim(),
        _id: { $ne: seatId }
      });
      if (existingSeat) {
        throw new BadRequestError("Seat name already exists in this shop");
      }
    }

    if (capacity !== undefined) {
      if (capacity < 1 || capacity > 20) {
        throw new BadRequestError("Capacity must be between 1 and 20 people");
      }
    }

    if (description !== undefined && description.length > 500) {
      throw new BadRequestError("Description cannot exceed 500 characters");
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = removeUndefinedObject({
      seat_name: seat_name ? seat_name.trim() : undefined,
      description: description !== undefined ? (description ? description.trim() : '') : undefined,
      is_premium: is_premium !== undefined ? Boolean(is_premium) : undefined,
      is_available: is_available !== undefined ? Boolean(is_available) : undefined,
      capacity: capacity !== undefined ? parseInt(capacity) : undefined,
      image: file ? file.path : undefined,
    });

    // Xóa ảnh cũ nếu có ảnh mới
    if (file && seat.image && seat.image.includes("cloudinary")) {
      const publicId = seat.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    const updatedSeat = await shopSeatModel
      .findByIdAndUpdate(seatId, updateData, { new: true, runValidators: true })
      .select(
        getSelectData([
          "_id",
          "shop_id",
          "seat_name",
          "description",
          "image",
          "is_premium",
          "is_available",
          "capacity",
          "createdAt",
          "updatedAt",
        ])
      );

    return {
      seat: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "seat_name",
          "description",
          "image",
          "is_premium",
          "is_available",
          "capacity",
          "createdAt",
          "updatedAt",
        ],
        object: updatedSeat,
      }),
    };
  } catch (error) {
    if (req.file && req.file.filename) {
      await cloudinary.uploader.destroy(req.file.filename);
    }
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to update seat");
  }
};

const createMenuItem = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId } = req.user;
    const { name, description, price, category, is_available } = req.body;

    // Kiểm tra shop tồn tại
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền sở hữu
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Kiểm tra danh mục
    if (!category) {
      throw new BadRequestError("Category is required");
    }
    const categoryExists = await menuItemCategoryModel.findById(category);
    if (!categoryExists) {
      throw new BadRequestError("Invalid category");
    }

    // Kiểm tra và xử lý ảnh
    let images = [];
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        throw new BadRequestError("Maximum 3 images allowed");
      }
      images = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `shops/${shopId}/menu-items`,
          });
          return { url: result.secure_url, publicId: result.public_id };
        })
      );
    } else {
      // Sử dụng ảnh mặc định nếu không có ảnh được upload
      images = [{
        url: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop',
        publicId: 'default_food_image'
      }];
    }

    // Validate các trường bắt buộc
    if (!name || !price) {
      throw new BadRequestError("Name and price are required");
    }

    // Tạo menu item
    const menuItem = await shopMenuItemModel.create({
      shop_id: shopId,
      name,
      description,
      price: Number(price),
      category,
      is_available: is_available !== undefined ? is_available : true,
      images,
    });

    return {
      menuItem: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "name",
          "description",
          "price",
          "category",
          "is_available",
          "images",
          "createdAt",
          "updatedAt",
        ],
        object: menuItem,
      }),
    };
  } catch (error) {
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.destroy(file.filename).catch((err) => console.error("Failed to delete image:", err))
        )
      );
    }
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to create menu item");
  }
};

const updateMenuItem = async (req) => {
  try {
    const { shopId, itemId } = req.params;
    const { userId } = req.user;
    const { name, description, price, category, is_available } = req.body;

    // Kiểm tra shop tồn tại
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền sở hữu
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Tìm menu item
    const menuItem = await shopMenuItemModel.findOne({ _id: itemId, shop_id: shopId });
    if (!menuItem) {
      throw new NotFoundError("Menu item not found");
    }

    // Kiểm tra danh mục nếu được cung cấp
    if (category) {
      const categoryExists = await menuItemCategoryModel.findById(category);
      if (!categoryExists) {
        throw new BadRequestError("Invalid category");
      }
    }

    // Xử lý ảnh
    let images = menuItem.images;
    if (req.files && req.files.length > 0) {
      if (req.files.length > 3) {
        throw new BadRequestError("Maximum 3 images allowed");
      }
      images = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `shops/${shopId}/menu-items`,
          });
          return { url: result.secure_url, publicId: result.public_id };
        })
      );
      if (menuItem.images && menuItem.images.length > 0) {
        await Promise.all(
          menuItem.images.map((img) => cloudinary.uploader.destroy(img.publicId))
        );
      }
    } else if (req.body.images) {
      images = req.body.images;
      if (!Array.isArray(images) || images.length < 1 || images.length > 3) {
        throw new BadRequestError("Images must be an array with 1 to 3 items");
      }
      for (const img of images) {
        if (!img.url || !img.publicId) {
          throw new BadRequestError("Each image must have url and publicId");
        }
      }
      if (menuItem.images && menuItem.images.length > 0) {
        await Promise.all(
          menuItem.images.map((img) => cloudinary.uploader.destroy(img.publicId))
        );
      }
    }

    // Cập nhật menu item
    const updatedMenuItem = await shopMenuItemModel.findOneAndUpdate(
      { _id: itemId, shop_id: shopId },
      removeUndefinedObject({
        name,
        description,
        price: price ? Number(price) : undefined,
        category,
        is_available,
        images,
      }),
      { new: true }
    );

    return {
      menuItem: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "name",
          "description",
          "price",
          "category",
          "is_available",
          "images",
          "createdAt",
          "updatedAt",
        ],
        object: updatedMenuItem,
      }),
    };
  } catch (error) {
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.destroy(file.filename).catch((err) => console.error("Failed to delete image:", err))
        )
      );
    }
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to update menu item");
  }
};

const createTimeSlot = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId } = req.user;
    const {
      day_of_week,
      start_time,
      end_time,
      max_regular_reservations,
      max_premium_reservations,
      is_active,
    } = req.body;

    // Tìm quán
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Kiểm tra input
    if (!day_of_week || !start_time || !end_time) {
      throw new BadRequestError(
        "Day of week, start time, and end time are required"
      );
    }

    // Tạo khung giờ
    const timeSlot = await shopTimeSlotModel.create({
      shop_id: shopId,
      day_of_week,
      start_time,
      end_time,
      max_regular_reservations,
      max_premium_reservations,
      is_active: is_active !== undefined ? is_active : true,
    });

    return {
      timeSlot: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "day_of_week",
          "start_time",
          "end_time",
          "max_regular_reservations",
          "max_premium_reservations",
          "is_active",
        ],
        object: timeSlot,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to create time slot");
  }
};

const updateTimeSlot = async (req) => {
  try {
    const { shopId, slotId } = req.params;
    const { userId } = req.user;
    const {
      day_of_week,
      start_time,
      end_time,
      max_regular_reservations,
      max_premium_reservations,
      is_active,
    } = req.body;

    // Tìm quán
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Tìm khung giờ
    const timeSlot = await shopTimeSlotModel.findById(slotId);
    if (!timeSlot) {
      throw new NotFoundError("Time slot not found");
    }

    // Cập nhật dữ liệu
    const updateData = removeUndefinedObject({
      day_of_week,
      start_time,
      end_time,
      max_regular_reservations,
      max_premium_reservations,
      is_active,
    });

    const updatedTimeSlot = await shopTimeSlotModel
      .findByIdAndUpdate(slotId, updateData, { new: true, runValidators: true })
      .select(
        getSelectData([
          "_id",
          "shop_id",
          "day_of_week",
          "start_time",
          "end_time",
          "max_regular_reservations",
          "max_premium_reservations",
          "is_active",
        ])
      );

    return {
      timeSlot: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "day_of_week",
          "start_time",
          "end_time",
          "max_regular_reservations",
          "max_premium_reservations",
          "is_active",
        ],
        object: updatedTimeSlot,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to update time slot");
  }
};

const submitVerification = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId } = req.user;
    const { document_type, reason } = req.body;

    // Kiểm tra shop tồn tại
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Kiểm tra quyền
    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not the owner of this shop");
    }

    // Kiểm tra và xử lý ảnh
    let documents = [];
    if (req.files && req.files.length > 0) {
      // Validate số lượng ảnh
      if (req.files.length > 5) {
        throw new BadRequestError("Maximum 5 documents allowed");
      }
      documents = await Promise.all(
        req.files.map(async (file) => {
          const result = await cloudinary.uploader.upload(file.path, {
            folder: `shops/${shopId}/verifications`,
          });
          return { url: result.secure_url, publicId: result.public_id };
        })
      );
    } else {
      throw new BadRequestError("At least one document is required");
    }

    // Validate document_type
    if (!document_type) {
      throw new BadRequestError("Document type is required");
    }

    // Tạo xác minh
    const verification = await shopVerificationModel.create({
      shop_id: shopId,
      document_type,
      documents,
      reason,
      submitted_at: new Date(),
      status: "Pending",
    });

    return {
      verification: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "document_type",
          "documents",
          "status",
          "submitted_at",
          "reason",
          "createdAt",
          "updatedAt",
        ],
        object: verification,
      }),
    };
  } catch (error) {
    // Xóa ảnh đã upload nếu có lỗi
    if (req.files && req.files.length > 0) {
      await Promise.all(
        req.files.map((file) =>
          cloudinary.uploader.destroy(file.filename).catch((err) => console.error("Failed to delete image:", err))
        )
      );
    }
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to submit verification");
  }
};

const getMyShop = async (req) => {
  try {
    const { userId } = req.user;

    // Tìm shop của user
    const shop = await shopModel
      .findOne({ owner_id: userId })
      .populate([
        { path: "theme_ids", select: "_id name description theme_image" },
        { path: "amenities", select: "_id icon label" },
        { path: "owner_id", select: "_id full_name email avatar" }
      ])
      .select(
        getSelectData([
          "_id",
          "name",
          "address",
          "description",
          "phone",
          "website",
          "location",
          "owner_id",
          "theme_ids",
          "vip_status",
          "rating_avg",
          "rating_count",
          "status",
          "amenities",
          "opening_hours",
          "formatted_opening_hours",
          "is_open",
          "createdAt",
          "updatedAt",
        ])
      );

    if (!shop) {
      throw new NotFoundError("Shop not found for this user");
    }

    // Lấy thông tin liên quan
    const images = await shopImageModel
      .find({ shop_id: shop._id })
      .select("url caption created_at")
      .lean();
    const seats = await shopSeatModel
      .find({ shop_id: shop._id })
      .select("seat_name description image is_premium is_available capacity")
      .lean();
    const menuItems = await shopMenuItemModel
      .find({ shop_id: shop._id })
      .populate("category", "name")
      .select("name description price category images is_available")
      .lean();
    const timeSlots = await shopTimeSlotModel
      .find({ shop_id: shop._id })
      .select(
        "day_of_week start_time end_time max_regular_reservations max_premium_reservations is_active"
      )
      .lean();
    const verifications = await shopVerificationModel
      .find({ shop_id: shop._id })
      .select(
        "document_type documents status submitted_at reviewed_at reason"
      )
      .lean();

    const result = {
      shop: {
        ...getInfoData({
          fields: [
            "_id",
            "name",
            "address",
            "description",
            "phone",
            "website",
            "location",
            "owner_id",
            "theme_ids",
            "vip_status",
            "rating_avg",
            "rating_count",
            "status",
            "amenities",
            "opening_hours",
            "formatted_opening_hours",
            "is_open",
            "createdAt",
            "updatedAt",
          ],
          object: shop,
        }),
        images,
        seats,
        menuItems,
        timeSlots,
        verifications,
      },
    };

    return result;
  } catch (error) {
    throw error instanceof NotFoundError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve my shop");
  }
};

const getShopStats = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's stats");
    }

    // Thống kê tổng quan
    const totalReservations = await reservationModel.countDocuments({ shop_id: shopId });
    const totalReviews = await reviewModel.countDocuments({ shop_id: shopId });
    const totalSeats = await shopSeatModel.countDocuments({ shop_id: shopId });
    const totalMenuItems = await shopMenuItemModel.countDocuments({ shop_id: shopId });

    // Thống kê đặt chỗ theo trạng thái
    const reservationStats = await reservationModel.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Thống kê đặt chỗ 30 ngày gần đây
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReservations = await reservationModel.countDocuments({
      shop_id: shopId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Thống kê đánh giá
    const reviewStats = await reviewModel.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" }
        }
      }
    ]);

    // Phân bố đánh giá theo sao
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (reviewStats.length > 0) {
      reviewStats[0].ratings.forEach(rating => {
        const star = Math.round(rating);
        if (ratingDistribution[star] !== undefined) {
          ratingDistribution[star]++;
        }
      });
    }

    // Thống kê đặt chỗ theo tháng (12 tháng gần đây)
    const monthlyReservations = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Top 5 món ăn được đặt nhiều nhất (giả sử có order system)
    const popularMenuItems = await shopMenuItemModel
      .find({ shop_id: shopId, is_available: true })
      .select("name price category images")
      .limit(5)
      .lean();

    // Thống kê ghế
    const seatStats = await shopSeatModel.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: null,
          totalSeats: { $sum: 1 },
          premiumSeats: { $sum: { $cond: ["$is_premium", 1, 0] } },
          availableSeats: { $sum: { $cond: ["$is_available", 1, 0] } },
          totalCapacity: { $sum: "$capacity" }
        }
      }
    ]);

    return {
      overview: {
        totalReservations,
        totalReviews,
        totalSeats,
        totalMenuItems,
        recentReservations,
        avgRating: reviewStats.length > 0 ? reviewStats[0].avgRating : 0,
        shopStatus: shop.status,
        verificationStatus: shop.verification_status || "Pending"
      },
      reservations: {
        byStatus: reservationStats.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        monthly: monthlyReservations
      },
      reviews: {
        total: totalReviews,
        avgRating: reviewStats.length > 0 ? reviewStats[0].avgRating : 0,
        distribution: ratingDistribution
      },
      seats: seatStats.length > 0 ? seatStats[0] : {
        totalSeats: 0,
        premiumSeats: 0,
        availableSeats: 0,
        totalCapacity: 0
      },
      popularMenuItems
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop stats");
  }
};

// ===== SEATS MANAGEMENT =====
const getAllSeats = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's seats");
    }

    const seats = await shopSeatModel
      .find({ shop_id: shopId })
      .select(
        getSelectData([
          "_id",
          "shop_id",
          "seat_name",
          "description",
          "image",
          "is_premium",
          "is_available",
          "capacity",
          "createdAt",
          "updatedAt",
        ])
      )
      .sort({ createdAt: -1 });

    return {
      seats: seats.map((seat) =>
        getInfoData({
          fields: [
            "_id",
            "shop_id",
            "seat_name",
            "description",
            "image",
            "is_premium",
            "is_available",
            "capacity",
            "createdAt",
            "updatedAt",
          ],
          object: seat,
        })
      ),
      total: seats.length,
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get seats");
  }
};

const deleteSeat = async (req) => {
  try {
    const { shopId, seatId } = req.params;
    const { userId, role } = req.user;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to delete seats from this shop");
    }

    // Tìm và xóa seat
    const seat = await shopSeatModel.findOneAndDelete({
      _id: seatId,
      shop_id: shopId,
    });

    if (!seat) {
      throw new NotFoundError("Seat not found");
    }

    // Xóa ảnh trên cloudinary nếu có
    if (seat.image && seat.image.includes("cloudinary")) {
      const publicId = seat.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    return {
      message: "Seat deleted successfully",
      deletedSeat: getInfoData({
        fields: ["_id", "seat_name"],
        object: seat,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to delete seat");
  }
};

// ===== MENU ITEMS MANAGEMENT =====
const getAllMenuItems = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const { category, is_available, search } = req.query;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's menu items");
    }

    // Xây dựng query
    const query = { shop_id: shopId };

    if (category) {
      query.category = category;
    }

    if (is_available !== undefined) {
      query.is_available = is_available === "true";
    }

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const menuItems = await shopMenuItemModel
      .find(query)
      .populate("category", "name description")
      .select(
        getSelectData([
          "_id",
          "shop_id",
          "name",
          "description",
          "price",
          "category",
          "is_available",
          "images",
          "createdAt",
          "updatedAt",
        ])
      )
      .sort({ createdAt: -1 });

    return {
      menuItems: menuItems.map((item) =>
        getInfoData({
          fields: [
            "_id",
            "shop_id",
            "name",
            "description",
            "price",
            "category",
            "is_available",
            "images",
            "createdAt",
            "updatedAt",
          ],
          object: item,
        })
      ),
      total: menuItems.length,
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get menu items");
  }
};

const deleteMenuItem = async (req) => {
  try {
    const { shopId, itemId } = req.params;
    const { userId, role } = req.user;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to delete menu items from this shop");
    }

    // Tìm và xóa menu item
    const menuItem = await shopMenuItemModel.findOneAndDelete({
      _id: itemId,
      shop_id: shopId,
    });

    if (!menuItem) {
      throw new NotFoundError("Menu item not found");
    }

    // Xóa ảnh trên cloudinary
    if (menuItem.images && menuItem.images.length > 0) {
      await Promise.all(
        menuItem.images.map((img) => cloudinary.uploader.destroy(img.publicId))
      );
    }

    return {
      message: "Menu item deleted successfully",
      deletedMenuItem: getInfoData({
        fields: ["_id", "name"],
        object: menuItem,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to delete menu item");
  }
};

const getShopForStaff = async (req) => {
  try {
    const { userId } = req.user;
    const shop = await shopModel.findOne({ staff_ids: { $in: [userId] } });
    return shop;
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop for staff");
  }
};

const getStaffList = async (req) => {
  const { shopId } = req.params;

  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search
  } = req.query;

  try {
    // First, get the shop to find staff_ids
    const shop = await shopModel.findById(shopId).select('staff_ids');
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // Build query for users who are staff of this shop
    let query = {
      _id: { $in: shop.staff_ids || [] },
      role: 'STAFF'
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { full_name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    // Use User model for pagination
    const paginateOptions = {
      model: require('../models/user.model'),
      query,
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      select: getSelectData([
        "_id",
        "full_name",
        "email",
        "phone",
        "avatar",
        "role",
        "is_active",
        "createdAt",
        "updatedAt",
      ])
    };

    const result = await getPaginatedData(paginateOptions);

    return {
      data: result.data,
      metadata: result.metadata
    };
  } catch (error) {
    throw error instanceof NotFoundError 
      ? error 
      : new BadRequestError(error.message || "Failed to get staff list");
  }
}

const getStaffById = async (req) => {
  try {
    const { staffId, shopId } = req.params;
    const { userId, role } = req.user;

    // Find the staff user
    const staffUser = await userModel.findById(staffId);
    if (!staffUser) {
      throw new NotFoundError("Staff not found");
    }

    if (staffUser.role !== 'STAFF') {
      throw new BadRequestError("User is not a staff member");
    }

    return staffUser;
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get staff by ID");
  }
};

const createStaff = async (req) => {
  try {
    const { full_name, email, password, phone } = req.body;
    const { shopId } = req.params;
    const { userId, role } = req.user;

    // Validate required fields
    if (!full_name || !email || !password) {
      throw new BadRequestError("Full name, email and password are required");
    }

    // Check if shop exists and user has permission
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to create staff for this shop");
    }

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestError("Email already exists");
    }
    const passwordHash = await bcrypt.hash(password, 10);

    // Create staff user
    const staffData = {
      full_name,
      email,
      password: passwordHash,
      phone,
      role: 'STAFF'
    };

    const user = await userModel.create(staffData);

    // Add staff to shop
    shop.staff_ids.push(user._id);
    await shop.save();

    return getInfoData({
      fields: [
        "_id",
        "full_name", 
        "email",
        "phone",
        "role",
        "is_active",
        "createdAt"
      ],
      object: user
    });
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to create staff");
  }
}

const updateStaff = async (req) => {
  try {
    const { staffId } = req.params;
    const { full_name, phone, is_active } = req.body;
    const { userId, role } = req.user;

    // Find the staff user
    const staffUser = await userModel.findById(staffId);
    if (!staffUser) {
      throw new NotFoundError("Staff not found");
    }

    if (staffUser.role !== 'STAFF') {
      throw new BadRequestError("User is not a staff member");
    }

    // Check if user has permission to update this staff
    if (role !== "ADMIN") {
      // Find shop that contains this staff
      const shop = await shopModel.findOne({ 
        $and: [
          { staff_ids: { $in: [staffId] } },
          { owner_id: userId }
        ]
      });
      
      if (!shop) {
        throw new ForbiddenError("You are not authorized to update this staff member");
      }
    }

    // Update staff user
    const updateData = {};
    if (full_name) updateData.full_name = full_name;
    if (phone !== undefined) updateData.phone = phone;
    if (is_active !== undefined) updateData.is_active = is_active;

    const updatedUser = await userModel.findByIdAndUpdate(
      staffId, 
      updateData, 
      { new: true }
    );

    return getInfoData({
      fields: [
        "_id",
        "full_name", 
        "email",
        "phone",
        "role",
        "is_active",
        "createdAt",
        "updatedAt"
      ],
      object: updatedUser
    });
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to update staff");
  }
}

// ===== SHOP FEEDBACK/REVIEWS MANAGEMENT =====
const getShopFeedback = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      rating,
      hasReply,
      search
    } = req.query;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's feedback");
    }

    // Xây dựng query
    const query = { shop_id: shopId };

    if (rating) {
      query.rating = parseInt(rating);
    }

    if (hasReply === "true") {
      query["shop_reply.reply"] = { $exists: true, $ne: null };
    } else if (hasReply === "false") {
      query["shop_reply.reply"] = { $exists: false };
    }

    if (search) {
      query.$or = [
        { comment: { $regex: search, $options: "i" } },
        { "shop_reply.reply": { $regex: search, $options: "i" } }
      ];
    }

    // Xây dựng sort
    const validSortFields = [
      "createdAt",
      "updatedAt",
      "rating",
      "shop_reply.replied_at"
    ];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestError(
        `Invalid sortBy. Must be one of: ${validSortFields.join(", ")}`
      );
    }
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    // Cấu hình cho getPaginatedData
    const paginateOptions = {
      model: reviewModel,
      query,
      page,
      limit,
      select: getSelectData([
        "_id",
        "shop_id",
        "user_id",
        "rating",
        "comment",
        "images",
        "shop_reply",
        "createdAt",
        "updatedAt"
      ]),
      populate: [
        { path: "user_id", select: "_id full_name avatar vip_status" },
        { path: "shop_reply.replied_by", select: "_id full_name" }
      ],
      search,
      searchFields: ["comment", "shop_reply.reply"],
      sort,
    };

    // Lấy dữ liệu phân trang
    const result = await getPaginatedData(paginateOptions);

    // Format dữ liệu
    const reviews = result.data.map((review) =>
      getInfoData({
        fields: [
          "_id",
          "shop_id",
          "user_id",
          "rating",
          "comment",
          "images",
          "shop_reply",
          "createdAt",
          "updatedAt"
        ],
        object: review,
      })
    );

    return {
      reviews,
      metadata: {
        totalItems: result.metadata.total,
        totalPages: result.metadata.totalPages,
        currentPage: result.metadata.page,
        limit: result.metadata.limit,
      },
      message: reviews.length === 0 ? "No reviews found" : undefined,
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop feedback");
  }
};

const getShopFeedbackStats = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's feedback stats");
    }

    // Thống kê tổng quan
    const totalReviews = await reviewModel.countDocuments({ shop_id: shopId });
    const repliedReviews = await reviewModel.countDocuments({ 
      shop_id: shopId,
      "shop_reply.reply": { $exists: true, $ne: null }
    });
    const pendingReplies = totalReviews - repliedReviews;

    // Thống kê đánh giá theo sao
    const ratingStats = await reviewModel.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratings: { $push: "$rating" }
        }
      }
    ]);

    // Phân bố đánh giá theo sao
    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (ratingStats.length > 0) {
      ratingStats[0].ratings.forEach(rating => {
        const star = Math.round(rating);
        if (ratingDistribution[star] !== undefined) {
          ratingDistribution[star]++;
        }
      });
    }

    // Thống kê đánh giá 30 ngày gần đây
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentReviews = await reviewModel.countDocuments({
      shop_id: shopId,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Thống kê đánh giá theo tháng (12 tháng gần đây)
    const monthlyReviews = await reviewModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 12)) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Top reviewers (users who reviewed most)
    const topReviewers = await reviewModel.aggregate([
      { $match: { shop_id: new mongoose.Types.ObjectId(shopId) } },
      {
        $group: {
          _id: "$user_id",
          reviewCount: { $sum: 1 },
          avgRating: { $avg: "$rating" }
        }
      },
      { $sort: { reviewCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $project: {
          user: { $arrayElemAt: ["$user", 0] },
          reviewCount: 1,
          avgRating: 1
        }
      }
    ]);

    return {
      overview: {
        totalReviews,
        repliedReviews,
        pendingReplies,
        recentReviews,
        avgRating: ratingStats.length > 0 ? Math.round(ratingStats[0].avgRating * 10) / 10 : 0,
        satisfactionRate: totalReviews > 0 ? Math.round((ratingStats.length > 0 ? ratingStats[0].avgRating : 0) / 5 * 100) : 0
      },
      ratingDistribution,
      monthlyReviews,
      topReviewers: topReviewers.map(reviewer => ({
        user: getInfoData({
          fields: ["_id", "full_name", "avatar", "vip_status"],
          object: reviewer.user
        }),
        reviewCount: reviewer.reviewCount,
        avgRating: Math.round(reviewer.avgRating * 10) / 10
      }))
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop feedback stats");
  }
};

const replyToReview = async (req) => {
  try {
    const { shopId, reviewId } = req.params;
    const { userId } = req.user;
    const { reply } = req.body;

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to reply to reviews for this shop");
    }

    // Kiểm tra review tồn tại
    const review = await reviewModel.findOne({ _id: reviewId, shop_id: shopId });
    if (!review) {
      throw new NotFoundError("Review not found");
    }

    // Kiểm tra đã reply chưa
    if (review.shop_reply && review.shop_reply.reply) {
      throw new BadRequestError("You have already replied to this review");
    }

    // Validate reply
    if (!reply || reply.trim().length === 0) {
      throw new BadRequestError("Reply content is required");
    }

    if (reply.length > 1000) {
      throw new BadRequestError("Reply cannot exceed 1000 characters");
    }

    // Cập nhật review với reply
    const updatedReview = await reviewModel.findByIdAndUpdate(
      reviewId,
      {
        shop_reply: {
          reply: reply.trim(),
          replied_by: userId,
          replied_at: new Date()
        }
      },
      { new: true }
    ).populate([
      { path: "user_id", select: "_id full_name avatar vip_status" },
      { path: "shop_reply.replied_by", select: "_id full_name" }
    ]);

    return {
      review: getInfoData({
        fields: [
          "_id",
          "shop_id",
          "user_id",
          "rating",
          "comment",
          "images",
          "shop_reply",
          "createdAt",
          "updatedAt"
        ],
        object: updatedReview,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to reply to review");
  }
};

// ===== SHOP ANALYTICS SERVICES =====
const getShopAnalyticsOverview = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const { period = "30" } = req.query; // days

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's analytics");
    }

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Thống kê tổng quan
    const totalReservations = await reservationModel.countDocuments({ 
      shop_id: shopId,
      createdAt: { $gte: startDate }
    });

    const totalCustomers = await reservationModel.distinct("user_id", {
      shop_id: shopId,
      createdAt: { $gte: startDate }
    });

    const totalRevenue = await paymentModel.aggregate([
      {
        $match: {
          user_id: { $in: totalCustomers },
          status: "success",
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    const avgRating = await reviewModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // So sánh với kỳ trước
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousReservations = await reservationModel.countDocuments({
      shop_id: shopId,
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const previousCustomers = await reservationModel.distinct("user_id", {
      shop_id: shopId,
      createdAt: { $gte: previousStartDate, $lt: startDate }
    });

    const previousRevenue = await paymentModel.aggregate([
      {
        $match: {
          user_id: { $in: previousCustomers },
          status: "success",
          created_at: { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" }
        }
      }
    ]);

    // Tính phần trăm thay đổi
    const reservationChange = previousReservations > 0 
      ? ((totalReservations - previousReservations) / previousReservations * 100).toFixed(1)
      : totalReservations > 0 ? 100 : 0;

    const customerChange = previousCustomers.length > 0
      ? ((totalCustomers.length - previousCustomers.length) / previousCustomers.length * 100).toFixed(1)
      : totalCustomers.length > 0 ? 100 : 0;

    const revenueChange = previousRevenue.length > 0 && previousRevenue[0].total > 0
      ? ((totalRevenue.length > 0 ? totalRevenue[0].total : 0) - previousRevenue[0].total) / previousRevenue[0].total * 100
      : totalRevenue.length > 0 ? 100 : 0;

    return {
      overview: {
        totalReservations,
        totalCustomers: totalCustomers.length,
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        avgRating: avgRating.length > 0 ? Math.round(avgRating[0].avgRating * 10) / 10 : 0,
        totalReviews: avgRating.length > 0 ? avgRating[0].totalReviews : 0
      },
      changes: {
        reservations: {
          current: totalReservations,
          previous: previousReservations,
          change: parseFloat(reservationChange),
          trend: parseFloat(reservationChange) >= 0 ? "up" : "down"
        },
        customers: {
          current: totalCustomers.length,
          previous: previousCustomers.length,
          change: parseFloat(customerChange),
          trend: parseFloat(customerChange) >= 0 ? "up" : "down"
        },
        revenue: {
          current: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
          previous: previousRevenue.length > 0 ? previousRevenue[0].total : 0,
          change: parseFloat(revenueChange.toFixed(1)),
          trend: revenueChange >= 0 ? "up" : "down"
        }
      },
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop analytics overview");
  }
};

const getShopRevenueAnalytics = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const { period = "6" } = req.query; // months

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's revenue analytics");
    }

    const months = parseInt(period);
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    // Lấy tất cả user đã đặt chỗ tại shop này
    const shopCustomers = await reservationModel.distinct("user_id", {
      shop_id: shopId,
      createdAt: { $gte: startDate }
    });

    // Thống kê doanh thu theo tháng
    const monthlyRevenue = await paymentModel.aggregate([
      {
        $match: {
          user_id: { $in: shopCustomers },
          status: "success",
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" }
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Thống kê doanh thu theo ngày (30 ngày gần đây)
    const dailyRevenue = await paymentModel.aggregate([
      {
        $match: {
          user_id: { $in: shopCustomers },
          status: "success",
          created_at: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$created_at" },
            month: { $month: "$created_at" },
            day: { $dayOfMonth: "$created_at" }
          },
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Thống kê doanh thu theo loại gói
    const revenueByPackage = await paymentModel.aggregate([
      {
        $match: {
          user_id: { $in: shopCustomers },
          status: "success",
          created_at: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: "packages",
          localField: "package_id",
          foreignField: "_id",
          as: "package"
        }
      },
      {
        $unwind: "$package"
      },
      {
        $group: {
          _id: "$package.name",
          revenue: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // Tổng doanh thu
    const totalRevenue = await paymentModel.aggregate([
      {
        $match: {
          user_id: { $in: shopCustomers },
          status: "success",
          created_at: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      }
    ]);

    return {
      monthlyRevenue: monthlyRevenue.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        revenue: item.revenue,
        count: item.count
      })),
      dailyRevenue: dailyRevenue.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        revenue: item.revenue,
        count: item.count
      })),
      revenueByPackage,
      summary: {
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        totalTransactions: totalRevenue.length > 0 ? totalRevenue[0].count : 0,
        avgTransactionValue: totalRevenue.length > 0 && totalRevenue[0].count > 0 
          ? totalRevenue[0].total / totalRevenue[0].count 
          : 0
      },
      period: {
        months,
        startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop revenue analytics");
  }
};

const getShopCustomerAnalytics = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const { period = "30" } = req.query; // days

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's customer analytics");
    }

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Lấy tất cả khách hàng đã đặt chỗ
    const customerReservations = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$user_id",
          reservationCount: { $sum: 1 },
          totalPeople: { $sum: "$number_of_people" },
          firstVisit: { $min: "$createdAt" },
          lastVisit: { $max: "$createdAt" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user"
        }
      },
      {
        $unwind: "$user"
      }
    ]);

    // Phân loại khách hàng
    const customerSegments = {
      new: 0, // Khách mới (1 lần đặt chỗ)
      returning: 0, // Khách quay lại (2-5 lần)
      loyal: 0, // Khách trung thành (6+ lần)
      vip: 0 // Khách VIP
    };

    customerReservations.forEach(customer => {
      if (customer.user.vip_status) {
        customerSegments.vip++;
      } else if (customer.reservationCount >= 6) {
        customerSegments.loyal++;
      } else if (customer.reservationCount >= 2) {
        customerSegments.returning++;
      } else {
        customerSegments.new++;
      }
    });

    // Thống kê khách hàng theo tháng
    const monthlyCustomers = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          uniqueCustomers: { $addToSet: "$user_id" }
        }
      },
      {
        $project: {
          month: { $concat: [{ $toString: "$_id.year" }, "-", { $toString: "$_id.month" }] },
          customerCount: { $size: "$uniqueCustomers" }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Top khách hàng
    const topCustomers = customerReservations
      .sort((a, b) => b.reservationCount - a.reservationCount)
      .slice(0, 10)
      .map(customer => ({
        user: getInfoData({
          fields: ["_id", "full_name", "email", "avatar", "vip_status"],
          object: customer.user
        }),
        reservationCount: customer.reservationCount,
        totalPeople: customer.totalPeople,
        firstVisit: customer.firstVisit,
        lastVisit: customer.lastVisit
      }));

    return {
      summary: {
        totalCustomers: customerReservations.length,
        totalReservations: customerReservations.reduce((sum, c) => sum + c.reservationCount, 0),
        totalPeople: customerReservations.reduce((sum, c) => sum + c.totalPeople, 0),
        avgReservationsPerCustomer: customerReservations.length > 0 
          ? (customerReservations.reduce((sum, c) => sum + c.reservationCount, 0) / customerReservations.length).toFixed(1)
          : 0
      },
      segments: customerSegments,
      monthlyCustomers,
      topCustomers,
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop customer analytics");
  }
};

const getShopReservationAnalytics = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const { period = "30" } = req.query; // days

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's reservation analytics");
    }

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Thống kê đặt chỗ theo trạng thái
    const reservationsByStatus = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê đặt chỗ theo loại
    const reservationsByType = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$reservation_type",
          count: { $sum: 1 }
        }
      }
    ]);

    // Thống kê đặt chỗ theo ngày trong tuần
    const reservationsByDayOfWeek = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$reservation_date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Thống kê đặt chỗ theo giờ
    const reservationsByHour = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: "$reservation_date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Thống kê đặt chỗ theo tháng
    const monthlyReservations = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Thống kê ghế được sử dụng nhiều nhất
    const popularSeats = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: "$seat_id",
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "shopseats",
          localField: "_id",
          foreignField: "_id",
          as: "seat"
        }
      },
      {
        $unwind: "$seat"
      },
      {
        $project: {
          seatName: "$seat.seat_name",
          count: 1
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    return {
      summary: {
        totalReservations: await reservationModel.countDocuments({
          shop_id: shopId,
          createdAt: { $gte: startDate }
        }),
        confirmedReservations: await reservationModel.countDocuments({
          shop_id: shopId,
          status: "Confirmed",
          createdAt: { $gte: startDate }
        }),
        completedReservations: await reservationModel.countDocuments({
          shop_id: shopId,
          status: "Completed",
          createdAt: { $gte: startDate }
        }),
        cancelledReservations: await reservationModel.countDocuments({
          shop_id: shopId,
          status: "Cancelled",
          createdAt: { $gte: startDate }
        })
      },
      byStatus: reservationsByStatus,
      byType: reservationsByType,
      byDayOfWeek: reservationsByDayOfWeek.map(item => ({
        day: item._id,
        dayName: ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][item._id - 1],
        count: item.count
      })),
      byHour: reservationsByHour,
      monthly: monthlyReservations.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      })),
      popularSeats,
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop reservation analytics");
  }
};

const getShopPopularItemsAnalytics = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const { period = "30" } = req.query; // days

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's popular items analytics");
    }

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Lấy tất cả menu items của shop
    const menuItems = await shopMenuItemModel.find({ shop_id: shopId })
      .populate("category", "name")
      .select("name description price category images is_available")
      .lean();

    // Thống kê đánh giá theo menu item (nếu có)
    const itemReviews = await reviewModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 }
        }
      }
    ]);

    // Top menu items theo đánh giá (giả sử có liên kết giữa review và menu item)
    const popularItemsByRating = menuItems
      .filter(item => item.is_available)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10)
      .map(item => ({
        item: getInfoData({
          fields: ["_id", "name", "description", "price", "category", "images"],
          object: item
        }),
        rating: item.rating || 0,
        reviewCount: item.reviewCount || 0
      }));

    // Thống kê theo danh mục
    const itemsByCategory = await shopMenuItemModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          is_available: true
        }
      },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgPrice: { $avg: "$price" }
        }
      },
      {
        $lookup: {
          from: "menuitemcategories",
          localField: "_id",
          foreignField: "_id",
          as: "category"
        }
      },
      {
        $unwind: "$category"
      },
      {
        $project: {
          categoryName: "$category.name",
          count: 1,
          avgPrice: { $round: ["$avgPrice", 2] }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Thống kê giá trung bình
    const priceStats = await shopMenuItemModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          is_available: true
        }
      },
      {
        $group: {
          _id: null,
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
          totalItems: { $sum: 1 }
        }
      }
    ]);

    return {
      summary: {
        totalItems: menuItems.length,
        availableItems: menuItems.filter(item => item.is_available).length,
        avgRating: itemReviews.length > 0 ? Math.round(itemReviews[0].avgRating * 10) / 10 : 0,
        totalReviews: itemReviews.length > 0 ? itemReviews[0].totalReviews : 0
      },
      popularItemsByRating,
      itemsByCategory,
      priceStats: priceStats.length > 0 ? {
        avgPrice: Math.round(priceStats[0].avgPrice * 100) / 100,
        minPrice: priceStats[0].minPrice,
        maxPrice: priceStats[0].maxPrice,
        totalItems: priceStats[0].totalItems
      } : null,
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop popular items analytics");
  }
};

const getShopTimeBasedAnalytics = async (req) => {
  try {
    const { shopId } = req.params;
    const { userId, role } = req.user;
    const { period = "30" } = req.query; // days

    // Kiểm tra shop tồn tại và quyền truy cập
    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view this shop's time-based analytics");
    }

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Thống kê đặt chỗ theo giờ trong ngày
    const hourlyReservations = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: "$reservation_date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Lấy time slots thực tế của shop
    const shopTimeSlots = await shopTimeSlotModel.find({ 
      shop_id: shopId, 
      is_active: true 
    }).select('day_of_week start_time end_time').lean();

    // Tạo các khoảng thời gian từ time slots thực tế
    const timeSlots = [];
    const processedSlots = new Set();

    shopTimeSlots.forEach(slot => {
      const startHour = parseInt(slot.start_time.split(':')[0]);
      const endHour = parseInt(slot.end_time.split(':')[0]);
      
      // Tạo key để tránh duplicate
      const slotKey = `${startHour}-${endHour}`;
      if (!processedSlots.has(slotKey)) {
        processedSlots.add(slotKey);
        timeSlots.push({
          range: `${startHour}-${endHour}h`,
          start: startHour,
          end: endHour,
          label: `${slot.start_time} - ${slot.end_time}`
        });
      }
    });

    // Nếu không có time slots, sử dụng khoảng mặc định
    if (timeSlots.length === 0) {
      timeSlots.push(
        { range: "7-9h", start: 7, end: 9, label: "7:00 - 9:00" },
        { range: "9-11h", start: 9, end: 11, label: "9:00 - 11:00" },
        { range: "11-13h", start: 11, end: 13, label: "11:00 - 13:00" },
        { range: "13-15h", start: 13, end: 15, label: "13:00 - 15:00" },
        { range: "15-17h", start: 15, end: 17, label: "15:00 - 17:00" },
        { range: "17-19h", start: 17, end: 19, label: "17:00 - 19:00" },
        { range: "19-21h", start: 19, end: 21, label: "19:00 - 21:00" },
        { range: "21-23h", start: 21, end: 23, label: "21:00 - 23:00" }
      );
    }

    // Sắp xếp time slots theo giờ bắt đầu
    timeSlots.sort((a, b) => a.start - b.start);

    const groupedHourlyData = timeSlots.map(slot => {
      const count = hourlyReservations
        .filter(item => item._id >= slot.start && item._id < slot.end)
        .reduce((sum, item) => sum + item.count, 0);
      
      return {
        hour: slot.range,
        label: slot.label,
        count: count
      };
    });

    // Thống kê đặt chỗ theo ngày trong tuần
    const dailyReservations = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dayOfWeek: "$reservation_date" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    // Thống kê đặt chỗ theo tháng
    const monthlyReservations = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Thống kê đặt chỗ theo ngày (30 ngày gần đây)
    const dailyTrend = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    // Thống kê thời gian đặt chỗ trước
    const advanceBookingStats = await reservationModel.aggregate([
      {
        $match: {
          shop_id: new mongoose.Types.ObjectId(shopId),
          createdAt: { $gte: startDate }
        }
      },
      {
        $project: {
          advanceDays: {
            $ceil: {
              $divide: [
                { $subtract: ["$reservation_date", "$createdAt"] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      },
      {
        $group: {
          _id: null,
          avgAdvanceDays: { $avg: "$advanceDays" },
          minAdvanceDays: { $min: "$advanceDays" },
          maxAdvanceDays: { $max: "$advanceDays" }
        }
      }
    ]);

    return {
      hourly: groupedHourlyData,
      daily: dailyReservations.map(item => ({
        day: item._id,
        dayName: ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"][item._id - 1],
        count: item.count
      })),
      monthly: monthlyReservations.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      })),
      dailyTrend: dailyTrend.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        count: item.count
      })),
      advanceBooking: advanceBookingStats.length > 0 ? {
        avgAdvanceDays: Math.round(advanceBookingStats[0].avgAdvanceDays * 10) / 10,
        minAdvanceDays: advanceBookingStats[0].minAdvanceDays,
        maxAdvanceDays: advanceBookingStats[0].maxAdvanceDays
      } : null,
      period: {
        days,
        startDate,
        endDate: new Date()
      }
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to get shop time-based analytics");
  }
};

module.exports = {
  createShop,
  updateShop,
  getShop,
  uploadShopImage,
  assignThemes,
  createSeat,
  updateSeat,
  createMenuItem,
  updateMenuItem,
  createTimeSlot,
  updateTimeSlot,
  submitVerification,
  getAllShops,
  getAllPublicShops,
  createShopByAdmin,
  getMyShop,
  getShopStats,
  getAllSeats,
  deleteSeat,
  getAllMenuItems,
  deleteMenuItem,
  getShopForStaff,
  getStaffList,
  getStaffById,
  createStaff,
  updateStaff,
  getShopFeedback,
  getShopFeedbackStats,
  replyToReview,
  getShopAnalyticsOverview,
  getShopRevenueAnalytics,
  getShopCustomerAnalytics,
  getShopReservationAnalytics,
  getShopPopularItemsAnalytics,
  getShopTimeBasedAnalytics
};
