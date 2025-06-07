"use strict";

const { OK, CREATED } = require("../configs/success.response");
const UserAnalyticsService = require("../services/userAnalytics.service");

class AnalyticsController {
  
  // Tạo session tracking mới
  createSession = async (req, res, next) => {
    try {
      // Support both authenticated and anonymous users
      const userId = req.user?.userId || null;
      console.log('🔍 Debug - User ID:', req.user);
      const { deviceInfo, locationInfo, referrerInfo } = req.body;
      
      const session = await UserAnalyticsService.createSession(
        userId, 
        deviceInfo, 
        locationInfo, 
        referrerInfo
      );
      
      new CREATED({
        message: "Session created successfully",
        data: session
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // Ghi lại hoạt động của user
  recordActivity = async (req, res, next) => {
    try {
      const { sessionId, activityData } = req.body;
      
      const result = await UserAnalyticsService.recordActivity(sessionId, activityData);
      
      new OK({
        message: "Activity recorded successfully",
        metadata: { recorded: true }
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // Kết thúc session
  endSession = async (req, res, next) => {
    try {
      const { sessionId } = req.body;
      
      const result = await UserAnalyticsService.endSession(sessionId);
      
      new OK({
        message: "Session ended successfully",
        metadata: { 
          duration: result.session_data.duration,
          actions: result.session_data.actions_performed 
        }
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // [ADMIN] Lấy thống kê tổng quan
  getOverallAnalytics = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const dateRange = {};
      
      if (startDate) dateRange.start = startDate;
      if (endDate) dateRange.end = endDate;
      
      const analytics = await UserAnalyticsService.getOverallAnalytics(dateRange);
      
      new OK({
        message: "Overall analytics retrieved successfully",
        data: analytics
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // [ADMIN] Lấy thống kê của một user cụ thể
  getUserAnalytics = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const dateRange = {};
      
      if (startDate) dateRange.start = startDate;
      if (endDate) dateRange.end = endDate;
      
      const analytics = await UserAnalyticsService.getUserAnalytics(userId, dateRange);
      
      new OK({
        message: "User analytics retrieved successfully",
        data: analytics
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // [ADMIN] Lấy top users theo hoạt động
  getTopActiveUsers = async (req, res, next) => {
    try {
      const { limit = 10, startDate, endDate } = req.query;
      const dateRange = {};
      
      if (startDate) dateRange.start = startDate;
      if (endDate) dateRange.end = endDate;
      
      const topUsers = await UserAnalyticsService.getTopActiveUsers(
        parseInt(limit), 
        dateRange
      );
      
      new OK({
        message: "Top active users retrieved successfully",
        data: topUsers
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // [ADMIN] Lấy thống kê hoạt động theo thời gian
  getActivityByTime = async (req, res, next) => {
    try {
      const { period = 'daily', startDate, endDate } = req.query;
      const dateRange = {};
      
      if (startDate) dateRange.start = startDate;
      if (endDate) dateRange.end = endDate;
      
      const activity = await UserAnalyticsService.getActivityByTime(period, dateRange);
      
      new OK({
        message: "Activity by time retrieved successfully",
        data: activity
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // [ADMIN] Lấy thống kê theo platform
  getPlatformAnalytics = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const dateRange = {};
      
      if (startDate) dateRange.start = startDate;
      if (endDate) dateRange.end = endDate;
      
      const platforms = await UserAnalyticsService.getPlatformAnalytics(dateRange);
      
      new OK({
        message: "Platform analytics retrieved successfully",
        data: platforms
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // [ADMIN] Lấy thống kê hành vi
  getActionAnalytics = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const dateRange = {};
      
      if (startDate) dateRange.start = startDate;
      if (endDate) dateRange.end = endDate;
      
      const actions = await UserAnalyticsService.getActionAnalytics(dateRange);
      
      new OK({
        message: "Action analytics retrieved successfully",
        data: actions
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
  
  // [ADMIN] Dashboard analytics - Tổng hợp tất cả thống kê cho dashboard
  getDashboardAnalytics = async (req, res, next) => {
    try {
      const { startDate, endDate } = req.query;
      const dateRange = {};
      
      if (startDate) dateRange.start = startDate;
      if (endDate) dateRange.end = endDate;
      
      // Lấy tất cả thống kê cần thiết
      const [
        overallStats,
        topUsers, 
        activityByTime,
        platformStats,
        actionStats
      ] = await Promise.all([
        UserAnalyticsService.getOverallAnalytics(dateRange),
        UserAnalyticsService.getTopActiveUsers(5, dateRange),
        UserAnalyticsService.getActivityByTime('daily', dateRange),
        UserAnalyticsService.getPlatformAnalytics(dateRange),
        UserAnalyticsService.getActionAnalytics(dateRange)
      ]);
      
      new OK({
        message: "Dashboard analytics retrieved successfully",
        data: {
          overall: overallStats,
          topUsers,
          activityByTime,
          platforms: platformStats,
          actions: actionStats
        }
      }).send(res);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = new AnalyticsController(); 