"use strict";

const { OK } = require("../configs/success.response");
const { NOTIFICATION_MESSAGE } = require("../constants/message");
const asyncHandler = require("../helpers/asyncHandler");
const notificationService = require("../services/notification.service");

class NotificationController {
  getUserNotifications = asyncHandler(async (req, res) => {
    const result = await notificationService.getUserNotifications(req);
    new OK({
      message: result.message || NOTIFICATION_MESSAGE.GET_ALL_SUCCESS,
      data: result,
    }).send(res);
  });

  markNotificationAsRead = asyncHandler(async (req, res) => {
    const result = await notificationService.markNotificationAsRead(req);
    new OK({
      message: NOTIFICATION_MESSAGE.MARK_READ_SUCCESS,
      data: result,
    }).send(res);
  });

  deleteNotification = asyncHandler(async (req, res) => {
    const result = await notificationService.deleteNotification(req);
    new OK({
      message: NOTIFICATION_MESSAGE.DELETE_SUCCESS,
      data: result,
    }).send(res);
  });
}

module.exports = new NotificationController();