"use strict";

const QRCode = require("qrcode");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../configs/error.response");
const reservationModel = require("../models/reservation.model");
const shopModel = require("../models/shop.model");
const shopSeatModel = require("../models/shopSeat.model");
const shopTimeSlotModel = require("../models/shopTimeSlot.model");
const { RESERVATION_STATUS, RESERVATION_TYPE } = require("../constants/enum");
const { getInfoData, getSelectData } = require("../utils");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const { isValidObjectId } = require("mongoose");

const createReservation = async (req) => {
  try {
    const { userId } = req.user;
    const {
      shop_id,
      seat_id,
      time_slot_id,
      reservation_type,
      reservation_date,
      number_of_people,
      notes,
    } = req.body;

    // Kiểm tra input
    if (
      !shop_id ||
      !seat_id ||
      !time_slot_id ||
      !reservation_type ||
      !reservation_date ||
      !number_of_people
    ) {
      throw new BadRequestError("Missing required fields");
    }

    // Kiểm tra quán
    const shop = await shopModel.findById(shop_id);
    if (!shop || shop.status !== "Active") {
      throw new NotFoundError("Shop not found or not active");
    }

    // Kiểm tra ghế
    const seat = await shopSeatModel.findById(seat_id);
    if (!seat || seat.shop_id.toString() !== shop_id || !seat.is_available) {
      throw new NotFoundError("Seat not found, not available, or does not belong to this shop");
    }
    if (seat.capacity < number_of_people) {
      throw new BadRequestError("Number of people exceeds seat capacity");
    }

    // Kiểm tra khung giờ
    const timeSlot = await shopTimeSlotModel.findById(time_slot_id);
    if (!timeSlot || timeSlot.shop_id.toString() !== shop_id) {
      throw new NotFoundError("Time slot not found or does not belong to this shop");
    }

    // Kiểm tra trùng lịch
    const existingReservation = await reservationModel.findOne({
      shop_id,
      seat_id,
      time_slot_id,
      reservation_date: new Date(reservation_date),
      status: { $in: [RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED] },
    });
    if (existingReservation) {
      throw new BadRequestError("This seat is already reserved for the selected time slot");
    }

    // Tạo QR code
    const reservationData = { userId, shop_id, seat_id, time_slot_id, reservation_date };
    const qrCode = await QRCode.toDataURL(JSON.stringify(reservationData));

    // Tạo đơn đặt chỗ
    const reservation = await reservationModel.create({
      user_id: userId,
      shop_id,
      seat_id,
      time_slot_id,
      reservation_type,
      reservation_date: new Date(reservation_date),
      number_of_people,
      notes,
      qr_code: qrCode,
      status: RESERVATION_STATUS.PENDING,
    });

    return {
      reservation: getInfoData({
        fields: [
          "_id",
          "user_id",
          "shop_id",
          "seat_id",
          "time_slot_id",
          "reservation_type",
          "reservation_date",
          "number_of_people",
          "notes",
          "qr_code",
          "status",
          "createdAt",
          "updatedAt",
        ],
        object: reservation,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to create reservation");
  }
};

const confirmReservation = async (req) => {
  try {
    const { reservationId } = req.params;
    const { userId, role } = req.user;

    // Tìm đơn đặt chỗ
    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    // Kiểm tra quyền
    if (
      reservation.user_id.toString() !== userId &&
      role !== "SHOP_OWNER" &&
      role !== "ADMIN"
    ) {
      throw new ForbiddenError("You are not authorized to confirm this reservation");
    }

    // Kiểm tra trạng thái
    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new BadRequestError("Reservation is not in pending status");
    }

    // Cập nhật trạng thái
    reservation.status = RESERVATION_STATUS.CONFIRMED;
    await reservation.save();

    return {
      reservation: getInfoData({
        fields: [
          "_id",
          "user_id",
          "shop_id",
          "seat_id",
          "time_slot_id",
          "reservation_type",
          "reservation_date",
          "number_of_people",
          "notes",
          "qr_code",
          "status",
          "createdAt",
          "updatedAt",
        ],
        object: reservation,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to confirm reservation");
  }
};

const cancelReservation = async (req) => {
  try {
    const { reservationId } = req.params;
    const { userId } = req.user;

    // Tìm đơn đặt chỗ
    const reservation = await reservationModel.findById(reservationId);
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    // Kiểm tra quyền
    if (reservation.user_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to cancel this reservation");
    }

    // Kiểm tra trạng thái
    if (
      reservation.status === RESERVATION_STATUS.CANCELLED ||
      reservation.status === RESERVATION_STATUS.COMPLETED
    ) {
      throw new BadRequestError("Reservation is already cancelled or completed");
    }

    // Cập nhật trạng thái
    reservation.status = RESERVATION_STATUS.CANCELLED;
    await reservation.save();

    return {
      reservation: getInfoData({
        fields: [
          "_id",
          "user_id",
          "shop_id",
          "seat_id",
          "time_slot_id",
          "reservation_type",
          "reservation_date",
          "number_of_people",
          "notes",
          "qr_code",
          "status",
          "createdAt",
          "updatedAt",
        ],
        object: reservation,
      }),
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError
      ? error
      : new BadRequestError(error.message || "Failed to cancel reservation");
  }
};

const getAllReservations = async (req) => {
    try {
      const { shopId } = req.params;
      const { userId, role } = req.user;
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "desc",
        status,
        reservation_date,
      } = req.query;
  
      // Validate shopId
      if (!isValidObjectId(shopId)) {
        throw new BadRequestError("Invalid shopId");
      }
  
      // Kiểm tra quán
      const shop = await shopModel.findById(shopId);
      if (!shop) {
        throw new NotFoundError("Shop not found");
      }
  
      // Kiểm tra quyền
      if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
        throw new ForbiddenError("You are not authorized to view reservations for this shop");
      }
  
      // Xây dựng query
      const query = { shop_id: shopId };
      if (status && Object.values(RESERVATION_STATUS).includes(status)) {
        query.status = status;
      }
      if (reservation_date) {
        const date = new Date(reservation_date);
        if (isNaN(date.getTime())) {
          throw new BadRequestError("Invalid reservation_date format");
        }
        const startDate = new Date(date.setHours(0, 0, 0, 0));
        const endDate = new Date(date.setHours(23, 59, 59, 999));
        query.reservation_date = { $gte: startDate, $lte: endDate };
      }
  
      // Xây dựng sort
      const validSortFields = ["createdAt", "reservation_date", "status", "number_of_people"];
      if (sortBy && !validSortFields.includes(sortBy)) {
        throw new BadRequestError(`Invalid sortBy. Must be one of: ${validSortFields.join(", ")}`);
      }
      const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
  
      // Chuẩn bị tham số cho getPaginatedData
      const paginateOptions = {
        model: reservationModel,
        query,
        page,
        limit,
        select: getSelectData([
          "_id",
          "user_id",
          "shop_id",
          "seat_id",
          "time_slot_id",
          "reservation_type",
          "reservation_date",
          "number_of_people",
          "notes",
          "qr_code",
          "status",
          "createdAt",
          "updatedAt",
        ]),
        populate: [
          { path: "user_id", select: "_id email username" },
          { path: "seat_id", select: "_id name capacity" },
          { path: "time_slot_id", select: "_id start_time end_time" },
        ],
        sort,
      };
  
      // Gọi getPaginatedData
      const result = await getPaginatedData(paginateOptions);
  
      // Xử lý dữ liệu trả về
      const reservations = result.data.map((reservation) =>
        getInfoData({
          fields: [
            "_id",
            "user_id",
            "shop_id",
            "seat_id",
            "time_slot_id",
            "reservation_type",
            "reservation_date",
            "number_of_people",
            "notes",
            "qr_code",
            "status",
            "createdAt",
            "updatedAt",
          ],
          object: reservation,
        })
      );
  
      return {
        reservations,
        metadata: {
          totalItems: result.metadata.total,
          totalPages: result.metadata.totalPages,
          currentPage: result.metadata.page,
          limit: result.metadata.limit,
        },
        message: reservations.length === 0 ? "No reservations found" : undefined,
      };
    } catch (error) {
      throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
        ? error
        : new BadRequestError(error.message || "Failed to retrieve reservations");
    }
};

const getReservationDetail = async (req) => {
    try {
      const { shopId, reservationId } = req.params;
      const { userId, role } = req.user;
  
      // Kiểm tra quán
      const shop = await shopModel.findById(shopId);
      if (!shop) {
        throw new NotFoundError("Shop not found");
      }
  
      // Kiểm tra quyền
      if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
        throw new ForbiddenError("You are not authorized to view this reservation");
      }
  
      // Lấy chi tiết đơn
      const reservation = await reservationModel
        .findOne({ _id: reservationId, shop_id: shopId })
        .populate([
          { path: "user_id", select: "_id email username" },
          { path: "seat_id", select: "_id name capacity" },
          { path: "time_slot_id", select: "_id start_time end_time" },
        ])
        .select(
          getSelectData([
            "_id",
            "user_id",
            "shop_id",
            "seat_id",
            "time_slot_id",
            "reservation_type",
            "reservation_date",
            "number_of_people",
            "notes",
            "qr_code",
            "status",
            "createdAt",
            "updatedAt",
          ])
        )
        .lean();
  
      if (!reservation) {
        throw new NotFoundError("Reservation not found");
      }
  
      return {
        reservation: getInfoData({
          fields: [
            "_id",
            "user_id",
            "shop_id",
            "seat_id",
            "time_slot_id",
            "reservation_type",
            "reservation_date",
            "number_of_people",
            "notes",
            "qr_code",
            "status",
            "createdAt",
            "updatedAt",
          ],
          object: reservation,
        }),
      };
    } catch (error) {
      throw error instanceof NotFoundError || error instanceof ForbiddenError
        ? error
        : new BadRequestError(error.message || "Failed to retrieve reservation details");
    }
};

const completeReservation = async (req) => {
    try {
      const { shopId, reservationId } = req.params;
      const { userId, role } = req.user;
  
      const shop = await shopModel.findById(shopId);
      if (!shop) {
        throw new NotFoundError("Shop not found");
      }
  
      if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
        throw new ForbiddenError("You are not authorized to complete this reservation");
      }
  
      const reservation = await reservationModel.findOne({ _id: reservationId, shop_id: shopId });
      if (!reservation) {
        throw new NotFoundError("Reservation not found");
      }
  
      if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
        throw new BadRequestError("Reservation is not in confirmed status");
      }
  
      reservation.status = RESERVATION_STATUS.COMPLETED;
      await reservation.save();
  
      return {
        reservation: getInfoData({
          fields: [
            "_id",
            "user_id",
            "shop_id",
            "seat_id",
            "time_slot_id",
            "reservation_type",
            "reservation_date",
            "number_of_people",
            "notes",
            "qr_code",
            "status",
            "createdAt",
            "updatedAt",
          ],
          object: reservation,
        }),
      };
    } catch (error) {
      throw error instanceof NotFoundError || error instanceof ForbiddenError
        ? error
        : new BadRequestError(error.message || "Failed to complete reservation");
    }
};

module.exports = {
  createReservation,
  confirmReservation,
  cancelReservation,
  getAllReservations,
  getReservationDetail,
  completeReservation,
};