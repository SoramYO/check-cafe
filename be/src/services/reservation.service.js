"use strict";

const QRCode = require("qrcode");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../configs/error.response");
const reservationModel = require("../models/reservation.model");
const shopModel = require("../models/shop.model");
const shopSeatModel = require("../models/shopSeat.model");
const shopTimeSlotModel = require("../models/shopTimeSlot.model");
const { RESERVATION_STATUS, RESERVATION_TYPE, NOTIFICATION_TYPE } = require("../constants/enum");
const { getInfoData, getSelectData } = require("../utils");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const { isValidObjectId } = require("mongoose");
const pointModel = require("../models/point.model");
const { createNotification } = require("./notification.service");



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

const createReservation = async (req) => {
  try {
    const { shopId, seatId, timeSlotId, reservation_date, number_of_people, notes, reservation_type } = req.body;

    const { userId } = req.user;
    const { emitNotification } = req.app.locals;

    // Validate inputs
    if (!isValidObjectId(shopId) || !isValidObjectId(seatId) || !isValidObjectId(timeSlotId)) {
      throw new BadRequestError("Invalid shopId, seatId, or timeSlotId");
    }

    // Kiểm tra quán
    const shop = await shopModel.findById(shopId);
    if (!shop || shop.status !== "Active") {
      throw new NotFoundError("Shop not found or inactive");
    }

    // Kiểm tra ghế
    const seat = await shopSeatModel.findById(seatId);
    if (!seat || seat.shop_id.toString() !== shopId || seat.capacity < number_of_people) {
      throw new BadRequestError("Invalid seat or insufficient capacity");
    }

    // Kiểm tra khung giờ
    const timeSlot = await shopTimeSlotModel.findById(timeSlotId);
    if (!timeSlot || timeSlot.shop_id.toString() !== shopId) {
      throw new BadRequestError("Invalid time slot");
    }

    // Kiểm tra ngày đặt
    const reservationDate = new Date(reservation_date);
    if (isNaN(reservationDate.getTime()) || reservationDate < new Date()) {
      throw new BadRequestError("Invalid reservation date");
    }

    // Tạo mã QR
    const qrData = `${shopId}-${seatId}-${timeSlotId}-${reservationDate.toISOString()}-${userId}`;
    const qrCode = await QRCode.toDataURL(qrData);

    // Tạo đơn đặt chỗ
    const reservation = await reservationModel.create({
      user_id: userId,
      shop_id: shopId,
      seat_id: seatId,
      time_slot_id: timeSlotId,
      reservation_type,
      reservation_date: reservationDate,
      number_of_people,
      notes,
      qr_code: qrCode,
      status: RESERVATION_STATUS.PENDING,
    });

    // Tạo thông báo cho CUSTOMER
    await createNotification({
      user_id: userId,
      title: "Reservation Created",
      content: `Your reservation at ${shop.name} on ${reservationDate.toLocaleDateString()} has been created.`,
      type: NOTIFICATION_TYPE.RESERVATION_CREATED,
      reference_id: reservation._id,
      emitNotification,
    });

    // Tạo thông báo cho SHOP_OWNER
    await createNotification({
      user_id: shop.owner_id,
      title: "New Reservation",
      content: `A new reservation (#${reservation._id}) has been created for ${shop.name} on ${reservationDate.toLocaleDateString()}.`,
      type: NOTIFICATION_TYPE.RESERVATION_CREATED,
      reference_id: reservation._id,
      emitNotification,
    });

    return getInfoData({
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
    });
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
    const { emitNotification } = req.app.locals;

    if (!isValidObjectId(reservationId)) {
      throw new BadRequestError("Invalid reservationId");
    }

    const reservation = await reservationModel.findById(reservationId).populate("shop_id");
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    if (role !== "ADMIN" && reservation.shop_id.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to confirm this reservation");
    }

    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new BadRequestError("Reservation is not in Pending status");
    }

    reservation.status = RESERVATION_STATUS.CONFIRMED;
    reservation.updatedAt = new Date();
    await reservation.save();

    // Tạo thông báo cho CUSTOMER
    await createNotification({
      user_id: reservation.user_id,
      title: "Reservation Confirmed",
      content: `Your reservation at ${reservation.shop_id.name} on ${reservation.reservation_date.toLocaleDateString()} has been confirmed.`,
      type: NOTIFICATION_TYPE.RESERVATION_CONFIRMED,
      reference_id: reservation._id,
      emitNotification,
    });

    return getInfoData({
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
    });
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to confirm reservation");
  }
};

const cancelReservation = async (req) => {
  try {
    const { reservationId } = req.params;
    const { userId, role } = req.user;
    const { emitNotification } = req.app.locals;

    if (!isValidObjectId(reservationId)) {
      throw new BadRequestError("Invalid reservationId");
    }

    const reservation = await reservationModel.findById(reservationId).populate("shop_id");
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    if (
      role !== "ADMIN" &&
      reservation.user_id.toString() !== userId &&
      reservation.shop_id.owner_id.toString() !== userId
    ) {
      throw new ForbiddenError("You are not authorized to cancel this reservation");
    }

    if (![RESERVATION_STATUS.PENDING, RESERVATION_STATUS.CONFIRMED].includes(reservation.status)) {
      throw new BadRequestError("Reservation cannot be cancelled");
    }

    reservation.status = RESERVATION_STATUS.CANCELLED;
    reservation.updatedAt = new Date();
    await reservation.save();

    // Tạo thông báo cho CUSTOMER
    await createNotification({
      user_id: reservation.user_id,
      title: "Reservation Cancelled",
      content: `Your reservation at ${reservation.shop_id.name} on ${reservation.reservation_date.toLocaleDateString()} has been cancelled.`,
      type: NOTIFICATION_TYPE.RESERVATION_CANCELLED,
      reference_id: reservation._id,
      emitNotification,
    });

    // Tạo thông báo cho SHOP_OWNER nếu CUSTOMER hủy
    if (reservation.user_id.toString() === userId) {
      await createNotification({
        user_id: reservation.shop_id.owner_id,
        title: "Reservation Cancelled",
        content: `Reservation (#${reservation._id}) at ${reservation.shop_id.name} on ${reservation.reservation_date.toLocaleDateString()} has been cancelled by customer.`,
        type: NOTIFICATION_TYPE.RESERVATION_CANCELLED,
        reference_id: reservation._id,
        emitNotification,
      });
    }

    return getInfoData({
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
    });
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to cancel reservation");
  }
};

const completeReservation = async (req) => {
  try {
    const { reservationId } = req.params;
    const { userId, role } = req.user;
    const { emitNotification } = req.app.locals;

    if (!isValidObjectId(reservationId)) {
      throw new BadRequestError("Invalid reservationId");
    }

    const reservation = await reservationModel.findById(reservationId).populate("shop_id");
    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    if (role !== "ADMIN" && reservation.shop_id.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to complete this reservation");
    }

    if (reservation.status !== RESERVATION_STATUS.CHECKED_IN) {
      throw new BadRequestError("Reservation is not in CheckedIn status");
    }

    reservation.status = RESERVATION_STATUS.COMPLETED;
    reservation.updatedAt = new Date();
    await reservation.save();

    // Tạo thông báo cho CUSTOMER
    await createNotification({
      user_id: reservation.user_id,
      title: "Reservation Completed",
      content: `Your reservation at ${reservation.shop_id.name} on ${reservation.reservation_date.toLocaleDateString()} has been completed.`,
      type: NOTIFICATION_TYPE.RESERVATION_COMPLETED,
      reference_id: reservation._id,
      emitNotification,
    });

    return getInfoData({
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
    });
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to complete reservation");
  }
};

const checkInReservationCustomer = async (req) => {
  try {
    const { reservationId } = req.params;
    const { qr_code } = req.body;
    const { userId } = req.user;
    const { emitNotification } = req.app.locals;

    // Validate reservationId
    if (!isValidObjectId(reservationId)) {
      throw new BadRequestError("Invalid reservationId");
    }

    // Tìm đơn đặt chỗ
    const reservation = await reservationModel
      .findById(reservationId)
      .populate([
        { path: "shop_id", select: "_id status name owner_id" },
        { path: "seat_id", select: "_id name capacity" },
        { path: "time_slot_id", select: "_id start_time end_time" },
      ])
      .lean();

    if (!reservation) {
      throw new NotFoundError("Reservation not found");
    }

    // Kiểm tra quyền
    if (reservation.user_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to check-in this reservation");
    }

    // Kiểm tra trạng thái
    if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
      throw new BadRequestError("Reservation is not in Confirmed status");
    }

    // Kiểm tra mã QR
    if (reservation.qr_code !== qr_code) {
      throw new BadRequestError("Invalid QR code");
    }

    // Kiểm tra thời gian check-in
    const now = new Date();
    const reservationDate = new Date(reservation.reservation_date);
    const startOfDay = new Date(reservationDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reservationDate.setHours(23, 59, 59, 999));
    if (now < startOfDay || now > endOfDay) {
      throw new BadRequestError("Check-in is only allowed on the reservation date");
    }

    // Kiểm tra quán Active
    if (reservation.shop_id.status !== "Active") {
      throw new BadRequestError("Shop is not active");
    }

    // Cập nhật trạng thái check-in
    const updatedReservation = await reservationModel
      .findByIdAndUpdate(
        reservationId,
        { status: RESERVATION_STATUS.CHECKED_IN, updatedAt: now },
        { new: true }
      )
      .populate([
        { path: "shop_id", select: "_id name address" },
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

    // Tính điểm (10 điểm/người)
    const pointsPerPerson = 10;
    const pointsEarned = reservation.number_of_people * pointsPerPerson;

    // Lưu lịch sử tích điểm
    await pointModel.create({
      user_id: userId,
      reservation_id: reservationId,
      shop_id: reservation.shop_id._id,
      points: pointsEarned,
      description: `Points earned from check-in reservation ${reservationId}`,
    });

    // Tính tổng điểm của user
    const totalPoints = await pointModel.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);

    // Tạo thông báo cho SHOP_OWNER
    await createNotification({
      user_id: reservation.shop_id.owner_id,
      title: "Customer Check-in",
      content: `Customer checked in for reservation (#${reservationId}) at ${reservation.shop_id.name} on ${reservation.reservation_date.toLocaleDateString()}.`,
      type: NOTIFICATION_TYPE.CHECK_IN,
      reference_id: reservationId,
      emitNotification,
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
        object: updatedReservation,
      }),
      points_earned: pointsEarned,
      total_points: totalPoints.length > 0 ? totalPoints[0].total : 0,
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to check-in reservation");
  }
};

const checkInReservationByShop = async (req) => {
  try {
    const { shopId } = req.params;
    const { qr_code } = req.body;
    const { userId, role } = req.user;
    const { emitNotification } = req.app.locals;

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
      throw new ForbiddenError("You are not authorized to perform this action");
    }

    // Tìm đơn đặt chỗ theo qr_code và shop_id
    const reservation = await reservationModel
      .findOne({ qr_code, shop_id: shopId })
      .populate([
        { path: "shop_id", select: "_id status name" },
        { path: "seat_id", select: "_id name capacity" },
        { path: "time_slot_id", select: "_id start_time end_time" },
      ])
      .lean();

    if (!reservation) {
      throw new NotFoundError("Reservation not found or invalid QR code");
    }

    // Kiểm tra trạng thái
    if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
      throw new BadRequestError("Reservation is not in Confirmed status");
    }

    // Kiểm tra thời gian check-in
    const now = new Date();
    const reservationDate = new Date(reservation.reservation_date);
    const startOfDay = new Date(reservationDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reservationDate.setHours(23, 59, 59, 999));
    if (now < startOfDay || now > endOfDay) {
      throw new BadRequestError("Check-in is only allowed on the reservation date");
    }

    // Kiểm tra quán Active
    if (reservation.shop_id.status !== "Active") {
      throw new BadRequestError("Shop is not active");
    }

    // Cập nhật trạng thái check-in
    const updatedReservation = await reservationModel
      .findByIdAndUpdate(
        reservation._id,
        { status: RESERVATION_STATUS.CHECKED_IN, updatedAt: now },
        { new: true }
      )
      .populate([
        { path: "shop_id", select: "_id name address" },
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

    // Tính điểm (10 điểm/người)
    const pointsPerPerson = 10;
    const pointsEarned = reservation.number_of_people * pointsPerPerson;

    // Lưu lịch sử tích điểm
    await pointModel.create({
      user_id: reservation.user_id,
      reservation_id: reservation._id,
      shop_id: shopId,
      points: pointsEarned,
      description: `Points earned from check-in reservation ${reservation._id}`,
    });

    // Tạo thông báo cho CUSTOMER
    await createNotification({
      user_id: reservation.user_id,
      title: "Check-in Confirmed",
      content: `Your reservation at ${reservation.shop_id.name} on ${reservation.reservation_date.toLocaleDateString()} has been checked in.`,
      type: NOTIFICATION_TYPE.CHECK_IN,
      reference_id: reservation._id,
      emitNotification,
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
        object: updatedReservation,
      }),
      points_earned: pointsEarned,
      customer_id: reservation.user_id,
    };
  } catch (error) {
    throw error instanceof NotFoundError || error instanceof ForbiddenError || error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to check-in reservation");
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

module.exports = {
  createReservation,
  confirmReservation,
  cancelReservation,
  getAllReservations,
  getReservationDetail,
  completeReservation,
  checkInReservationByShop,
  checkInReservationCustomer
};