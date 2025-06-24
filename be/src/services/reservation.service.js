"use strict";

const QRCode = require("qrcode");
const mongoose = require("mongoose");
const { BadRequestError, NotFoundError, ForbiddenError } = require("../configs/error.response");
const reservationModel = require("../models/reservation.model");
const shopModel = require("../models/shop.model");
const shopSeatModel = require("../models/shopSeat.model");
const shopTimeSlotModel = require("../models/shopTimeSlot.model");
const { RESERVATION_STATUS, RESERVATION_TYPE, NOTIFICATION_TYPE } = require("../constants/enum");
const { getInfoData, getSelectData, getUnselectData } = require("../configs/success.response");
const { getPaginatedData } = require("../helpers/mongooseHelper");
const { isValidObjectId } = mongoose;
const pointModel = require("../models/point.model");
const { createNotification } = require("./notification.service");

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
    if (!timeSlot || timeSlot.shop_id.toString() !== shopId || !timeSlot.is_active) {
      throw new BadRequestError("Invalid or inactive time slot");
    }

    // Kiểm tra ngày đặt
    const reservationDate = new Date(reservation_date);
    console.log(reservationDate);
    
    // Kiểm tra xem ngày có hợp lệ không
    if (isNaN(reservationDate.getTime())) {
      throw new BadRequestError("Ngày đặt không hợp lệ");
    }

    // So sánh theo ngày (không bao gồm giờ/phút/giây)
    const today = new Date();
    const reservationDateOnly = new Date(reservationDate.getFullYear(), reservationDate.getMonth(), reservationDate.getDate());
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    if (reservationDateOnly < todayOnly) {
      throw new BadRequestError("Không thể đặt chỗ cho ngày trong quá khứ");
    }

    // Kiểm tra trùng reservation
    const startOfDay = new Date(reservationDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reservationDate.setHours(23, 59, 59, 999));
    const existingReservation = await reservationModel.findOne({
      shop_id: shopId,
      seat_id: seatId,
      time_slot_id: timeSlotId,
      reservation_date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [ RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.CHECKED_IN] },
    });
    if (existingReservation) {
      throw new BadRequestError("This seat and time slot are already reserved for the selected date");
    }

    // Kiểm tra giới hạn reservation của time slot
    const reservationCount = await reservationModel.countDocuments({
      shop_id: shopId,
      time_slot_id: timeSlotId,
      reservation_date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [ RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.CHECKED_IN] },
      reservation_type,
    });
    const maxReservations =
      reservation_type === RESERVATION_TYPE.PRIORITY
        ? timeSlot.max_premium_reservations
        : timeSlot.max_regular_reservations;
    if (reservationCount >= maxReservations) {
      throw new BadRequestError(`Maximum ${reservation_type.toLowerCase()} reservations reached for this time slot`);
    }

    // Tạo đơn đặt chỗ (không tạo QR code ở đây)
    const reservation = await reservationModel.create({
      user_id: userId,
      shop_id: shopId,
      seat_id: seatId,
      time_slot_id: timeSlotId,
      reservation_type,
      reservation_date: reservationDate,
      number_of_people,
      notes,
      status: RESERVATION_STATUS.PENDING,
    });

    // Tạo thông báo cho CUSTOMER
    await createNotification({
      user_id: userId,
      title: "Đặt chỗ thành công",
      message: `Đặt chỗ của bạn tại ${shop.name} vào ngày ${reservationDate.toLocaleDateString('vi-VN')} đã được tạo.`,
      type: NOTIFICATION_TYPE.INFO,
      category: NOTIFICATION_TYPE.BOOKING,
      priority: NOTIFICATION_TYPE.MEDIUM,
      related_id: reservation._id,
      related_type: "booking",
      emitNotification,
    });

    // Tạo thông báo cho SHOP_OWNER
    await createNotification({
      user_id: shop.owner_id,
      title: "Đặt chỗ mới",
      message: `Có đặt chỗ mới (#${reservation._id}) tại ${shop.name} vào ngày ${reservationDate.toLocaleDateString('vi-VN')}.`,
      type: NOTIFICATION_TYPE.INFO,
      category: NOTIFICATION_TYPE.BOOKING,
      priority: NOTIFICATION_TYPE.MEDIUM,
      related_id: reservation._id,
      related_type: "booking",
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
        "status",
        "createdAt",
        "updatedAt",
      ],
      object: reservation,
    });
  } catch (error) {
    console.log(error);
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

    if (role !== "ADMIN" && role !== "STAFF" && reservation.shop_id.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to confirm this reservation");
    }

    if(reservation.status === RESERVATION_STATUS.CONFIRMED) {
      throw new BadRequestError("Reservation is already confirmed");
    }


    if (reservation.status !== RESERVATION_STATUS.PENDING) {
      throw new BadRequestError("Reservation is not in Pending status");
    }


    // Kiểm tra trùng reservation
    const reservationDate = new Date(reservation.reservation_date);
    const startOfDay = new Date(reservationDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reservationDate.setHours(23, 59, 59, 999));
    const existingReservation = await reservationModel.findOne({
      _id: { $ne: reservationId },
      shop_id: reservation.shop_id,
      seat_id: reservation.seat_id,
      time_slot_id: reservation.time_slot_id,
      reservation_date: { $gte: startOfDay, $lte: endOfDay },
      status: { $in: [RESERVATION_STATUS.CONFIRMED, RESERVATION_STATUS.CHECKED_IN] },
    });
    if (existingReservation) {
      throw new BadRequestError("This seat and time slot are already confirmed for another reservation on the same date");
    }

    // Tạo mã QR khi confirm reservation
    const qrData = {
      shop_id: reservation.shop_id._id.toString(),
      seat_id: reservation.seat_id.toString(),
      time_slot_id: reservation.time_slot_id.toString(),
      user_id: reservation.user_id.toString()
    };
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    reservation.status = RESERVATION_STATUS.CONFIRMED;
    reservation.qr_code = qrCodeUrl;
    reservation.updatedAt = new Date();
    await reservation.save();

    // Tạo thông báo cho CUSTOMER
    await createNotification({
      user_id: reservation.user_id,
      title: "Đặt chỗ được xác nhận",
      message: `Đặt chỗ của bạn tại ${reservation.shop_id.name} vào ngày ${reservation.reservation_date.toLocaleDateString('vi-VN')} đã được xác nhận.`,
      type: NOTIFICATION_TYPE.SUCCESS,
      category: NOTIFICATION_TYPE.BOOKING,
      priority: NOTIFICATION_TYPE.MEDIUM,
      related_id: reservation._id,
      related_type: "booking",
      emitNotification,
    });

    return getInfoData({
      fields: [
        "_id",
        "user_id",
        // "shop_id",
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
      role !== "ADMIN" && role !== "STAFF" &&
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
      title: "Đặt chỗ bị hủy",
      message: `Đặt chỗ của bạn tại ${reservation.shop_id.name} vào ngày ${reservation.reservation_date.toLocaleDateString('vi-VN')} đã bị hủy.`,
      type: NOTIFICATION_TYPE.WARNING,
      category: NOTIFICATION_TYPE.BOOKING,
      priority: NOTIFICATION_TYPE.MEDIUM,
      related_id: reservation._id,
      related_type: "booking",
      emitNotification,
    });

    // Tạo thông báo cho SHOP_OWNER nếu CUSTOMER hủy
    if (reservation.user_id.toString() === userId) {
      await createNotification({
        user_id: reservation.shop_id.owner_id,
        title: "Đặt chỗ bị hủy",
        message: `Đặt chỗ (#${reservation._id}) tại ${reservation.shop_id.name} vào ngày ${reservation.reservation_date.toLocaleDateString('vi-VN')} đã bị hủy bởi khách hàng.`,
        type: NOTIFICATION_TYPE.WARNING,
        category: NOTIFICATION_TYPE.BOOKING,
        priority: NOTIFICATION_TYPE.MEDIUM,
        related_id: reservation._id,
        related_type: "booking",
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
      title: "Đặt chỗ hoàn thành",
      message: `Đặt chỗ của bạn tại ${reservation.shop_id.name} vào ngày ${reservation.reservation_date.toLocaleDateString('vi-VN')} đã hoàn thành.`,
      type: NOTIFICATION_TYPE.SUCCESS,
      category: NOTIFICATION_TYPE.BOOKING,
      priority: NOTIFICATION_TYPE.MEDIUM,
      related_id: reservation._id,
      related_type: "booking",
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

    if (!isValidObjectId(reservationId)) {
      throw new BadRequestError("Invalid reservationId");
    }

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

    if (reservation.user_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to check-in this reservation");
    }

    if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
      throw new BadRequestError("Reservation is not in Confirmed status");
    }

    // Validate and parse QR code (support both string and object format)
    let qrData;

    if (!qr_code) {
      throw new BadRequestError("QR code is required");
    }

    // Handle both string and object format
    if (typeof qr_code === 'string') {
      try {
        qrData = JSON.parse(qr_code);
      } catch (error) {
        throw new BadRequestError("Invalid QR code JSON format");
      }
    } else if (typeof qr_code === 'object') {
      qrData = qr_code;
    } else {
      throw new BadRequestError("QR code must be a JSON string or object");
    }

    // Generate QR code data URL to compare with stored QR code
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    // Validate QR code data matches reservation
    if (reservation.qr_code !== qrCodeUrl) {
      throw new BadRequestError("Invalid QR code");
    }

    const now = new Date();
    const reservationDate = new Date(reservation.reservation_date);
    const startOfDay = new Date(reservationDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reservationDate.setHours(23, 59, 59, 999));
    if (now < startOfDay || now > endOfDay) {
      throw new BadRequestError("Check-in is only allowed on the reservation date");
    }

    if (reservation.shop_id.status !== "Active") {
      throw new BadRequestError("Shop is not active");
    }

    const updatedReservation = await reservationModel
      .findByIdAndUpdate(
        reservationId,
        { status: RESERVATION_STATUS.COMPLETED, updatedAt: now },
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
          "status",
          "createdAt",
          "updatedAt",
        ])
      )
      .lean();

    const pointsPerPerson = 10;
    const pointsEarned = reservation.number_of_people * pointsPerPerson;

    await pointModel.create({
      user_id: userId,
      reservation_id: reservationId,
      shop_id: reservation.shop_id._id,
      points: pointsEarned,
      description: `Points earned from check-in reservation ${reservationId}`,
    });

    const totalPoints = await pointModel.aggregate([
      { $match: { user_id: mongoose.Types.ObjectId(userId) } },
      { $group: { _id: null, total: { $sum: "$points" } } },
    ]);

    await createNotification({
      user_id: reservation.shop_id.owner_id,
      title: "Khách hàng đã check-in",
      message: `Khách hàng đã check-in cho đặt chỗ (#${reservationId}) tại ${reservation.shop_id.name} vào ngày ${reservation.reservation_date.toLocaleDateString('vi-VN')}.`,
      type: NOTIFICATION_TYPE.INFO,
      category: NOTIFICATION_TYPE.BOOKING,
      priority: NOTIFICATION_TYPE.MEDIUM,
      related_id: reservationId,
      related_type: "booking",
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

    if (!isValidObjectId(shopId)) {
      throw new BadRequestError("Invalid shopId");
    }

    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    // if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
    //   throw new ForbiddenError("You are not authorized to perform this action");
    // }

    // Validate and parse QR code (support both string and object format)
    let qrData;

    if (!qr_code) {
      throw new BadRequestError("QR code is required");
    }

    // Handle both string and object format
    if (typeof qr_code === 'string') {
      try {
        qrData = JSON.parse(qr_code);
      } catch (error) {
        throw new BadRequestError("Invalid QR code JSON format");
      }
    } else if (typeof qr_code === 'object') {
      qrData = qr_code;
    } else {
      throw new BadRequestError("QR code must be a JSON string or object");
    }

    // Validate QR code has required fields
    if (!qrData.shop_id || !qrData.seat_id || !qrData.time_slot_id || !qrData.user_id) {
      throw new BadRequestError("QR code must contain shop_id, seat_id, time_slot_id, and user_id");
    }

    // Generate QR code data URL to compare with stored QR code
    const qrCodeUrl = await QRCode.toDataURL(JSON.stringify(qrData));

    // Find reservation by QR code data URL
    const reservation = await reservationModel
      .findOne({ 
        qr_code: qrCodeUrl,
        shop_id: qrData.shop_id
      })
      .populate([
        { path: "shop_id", select: "_id status name" },
        { path: "seat_id", select: "_id name capacity" },
        { path: "time_slot_id", select: "_id start_time end_time" },
      ])
      .lean();

    if (!reservation) {
      throw new NotFoundError("Reservation not found or invalid QR code");
    }

    // Validate shop matches
    if (reservation.shop_id._id.toString() !== shopId) {
      throw new BadRequestError("QR code does not belong to this shop");
    }

    if (reservation.status !== RESERVATION_STATUS.CONFIRMED) {
      throw new BadRequestError("Reservation is not in Confirmed status");
    }

    const now = new Date();
    const reservationDate = new Date(reservation.reservation_date);
    const startOfDay = new Date(reservationDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(reservationDate.setHours(23, 59, 59, 999));
    if (now < startOfDay || now > endOfDay) {
      throw new BadRequestError("Check-in is only allowed on the reservation date");
    }

    if (reservation.shop_id.status !== "Active") {
      throw new BadRequestError("Shop is not active");
    }

    const updatedReservation = await reservationModel
      .findByIdAndUpdate(
        reservation._id,
        { status: RESERVATION_STATUS.COMPLETED, updatedAt: now },
        { new: true }
      )
      .populate([
        { path: "shop_id", select: "_id name address" },
        { path: "seat_id", select: "_id seat_name capacity is_premium description" },
        { path: "time_slot_id", select: "_id start_time end_time day_of_week" },
        { path: "user_id", select: "_id email full_name avatar phone points vip_status" },
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

    const pointsPerPerson = 10;
    const pointsEarned = reservation.number_of_people * pointsPerPerson;

    await pointModel.create({
      user_id: reservation.user_id,
      reservation_id: reservation._id,
      shop_id: shopId,
      points: pointsEarned,
      description: `Points earned from check-in reservation ${reservation._id}`,
    });

    await createNotification({
      user_id: reservation.user_id,
      title: "Check-in được xác nhận",
      message: `Đặt chỗ của bạn tại ${reservation.shop_id.name} vào ngày ${reservation.reservation_date.toLocaleDateString('vi-VN')} đã được check-in.`,
      type: NOTIFICATION_TYPE.SUCCESS,
      category: NOTIFICATION_TYPE.BOOKING,
      priority: NOTIFICATION_TYPE.MEDIUM,
      related_id: reservation._id,
      related_type: "booking",
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

    if (!isValidObjectId(shopId)) {
      throw new BadRequestError("Invalid shopId");
    }

    const shop = await shopModel.findById(shopId);
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }

    if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
      throw new ForbiddenError("You are not authorized to view reservations for this shop");
    }

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

    const validSortFields = ["createdAt", "reservation_date", "status", "number_of_people"];
    if (sortBy && !validSortFields.includes(sortBy)) {
      throw new BadRequestError(`Invalid sortBy. Must be one of: ${validSortFields.join(", ")}`);
    }
    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

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

    const result = await getPaginatedData(paginateOptions);

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
    const { reservationId } = req.params;
    //const { shopId } = req.body;
    const { userId, role } = req.user;

    // if (!isValidObjectId(shopId) || !isValidObjectId(reservationId)) {
    //   throw new BadRequestError("Invalid shopId or reservationId");
    // }

    // const shop = await shopModel.findById(shopId);
    // if (!shop) {
    //   throw new NotFoundError("Shop not found");
    // }

    // if (role !== "ADMIN" && shop.owner_id.toString() !== userId) {
    //   throw new ForbiddenError("You are not authorized to view this reservation");
    // }

    const reservation = await reservationModel
      .findOne({ _id: reservationId })
      .populate([
        { path: "user_id", select: "_id email username" },
        { path: "seat_id", select: "_id name capacity" },
        { path: "time_slot_id", select: "_id start_time end_time" },
        {path: "shop_id", select: "_id name address", populate: { path: "shopImages", select: "url" } }
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

const getAllReservationsByUser = async (req) => {
  try {
    const { userId } = req.user;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      reservation_date,
      search,
    } = req.query;

    // Xây dựng query
    const query = { user_id: userId };
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
        { path: "shop_id", select: "_id name address opening_hours", populate: { path: "shopImages", select: "url " } },
        { path: "seat_id", select: "_id seat_name capacity" },
        { path: "time_slot_id", select: "_id start_time end_time" },
      ],
      search,
      searchFields: ["shop_id.name", "seat_id.seat_name", "time_slot_id.start_time", "time_slot_id.end_time"],
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
    throw error instanceof BadRequestError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve reservations");
  }
};

const getReservationForShopStaff = async (req) => {
  try {
    const { shopId } = req.params;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      reservation_date,
    } = req.query;

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
        { path: "user_id", select: "_id email full_name avatar" },
        { path: "seat_id", select: "_id name capacity seat_name" },
        { path: "time_slot_id", select: "_id start_time end_time" },
      ],
      sort,
    };

    const result = await getPaginatedData(paginateOptions);

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
    throw error instanceof BadRequestError || error instanceof NotFoundError
      ? error
      : new BadRequestError(error.message || "Failed to retrieve reservations");
  }
};


const getShopReservations = async (req) => {
  try {

    const { userId } = req.user;
    const {
      page = 1,
      limit = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      reservation_date,
    } = req.query;

    const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

    const shop = await shopModel.findOne({ owner_id: userId });
    if (!shop) {
      throw new NotFoundError("Shop not found");
    }
    const query = { shop_id: shop._id };
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
        { path: "user_id", select: "_id email full_name avatar phone" },
        { path: "seat_id", select: "_id seat_name capacity" },
        { path: "time_slot_id", select: "_id start_time end_time" },
      ],
      sort,
    };

    const result = await getPaginatedData(paginateOptions);

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
    throw error instanceof BadRequestError || error instanceof NotFoundError
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
  checkInReservationCustomer,
  getAllReservationsByUser,
  getReservationForShopStaff,
  getShopReservations,
};