"use strict";

const UserAnalytics = require("../models/userAnalytics.model");
const User = require("../models/user.model");
const { v4: uuidv4 } = require('uuid');

class UserAnalyticsService {
  
  // Tạo session mới cho user
  static async createSession(userId, deviceInfo = {}, locationInfo = {}, referrerInfo = {}) {
    try {
      const sessionId = uuidv4();
      
      
      
      const analytics = new UserAnalytics({
        user_id: userId,
        session_id: sessionId,
        device_info: deviceInfo,
        location_info: locationInfo,
        referrer_info: referrerInfo,
        session_data: {
          start_time: new Date(),
          is_active: true
        }
      });
      
      await analytics.save();
      return { sessionId, analyticsId: analytics._id };
    } catch (error) {
      throw new Error(`Error creating session: ${error.message}`);
    }
  }
  
  // Ghi lại hoạt động của user
  static async recordActivity(sessionId, activityData) {
    try {
      // Try to find active session first
      let analytics = await UserAnalytics.findOne({ 
        session_id: sessionId, 
        'session_data.is_active': true 
      });
      
      // If no active session, find any session with this ID and reactivate if recently ended
      if (!analytics) {
        analytics = await UserAnalytics.findOne({ session_id: sessionId });
        
        if (!analytics) {
          throw new Error('Session not found');
        }
        
        // If session ended recently (within 5 minutes), reactivate it
        const now = new Date();
        const endTime = analytics.session_data.end_time;
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        if (endTime && endTime > fiveMinutesAgo) {
          analytics.session_data.is_active = true;
          analytics.session_data.end_time = undefined;
          console.log(`Reactivating session ${sessionId} for activity recording`);
        } else {
          throw new Error('Session has expired');
        }
      }
      
      await analytics.addActivity(activityData);
      return analytics;
    } catch (error) {
      throw new Error(`Error recording activity: ${error.message}`);
    }
  }
  
  // Kết thúc session
  static async endSession(sessionId) {
    try {
      const analytics = await UserAnalytics.findOne({ 
        session_id: sessionId,
        'session_data.is_active': true 
      });
      
      if (!analytics) {
        throw new Error('Active session not found');
      }
      
      await analytics.endSession();
      return analytics;
    } catch (error) {
      throw new Error(`Error ending session: ${error.message}`);
    }
  }
  
  // Lấy thống kê tổng quan cho admin
  static async getOverallAnalytics(dateRange = {}) {
    try {
      const matchQuery = {};
      
      if (dateRange.start && dateRange.end) {
        matchQuery.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        };
      }
      
      const analytics = await UserAnalytics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            total_sessions: { $sum: 1 },
            unique_users: { $addToSet: "$user_id" },
            total_duration: { $sum: "$session_data.duration" },
            avg_session_duration: { $avg: "$session_data.duration" },
            total_pages_visited: { $sum: "$session_data.pages_visited" },
            total_actions: { $sum: "$session_data.actions_performed" },
            bounce_sessions: { 
              $sum: { $cond: [{ $eq: ["$engagement_metrics.bounce_rate", 1] }, 1, 0] } 
            }
          }
        },
        {
          $project: {
            _id: 0,
            total_sessions: 1,
            unique_users_count: { $size: "$unique_users" },
            total_duration: 1,
            avg_session_duration: 1,
            avg_session_duration_minutes: { $divide: ["$avg_session_duration", 60] },
            total_pages_visited: 1,
            total_actions: 1,
            bounce_sessions: 1,
            bounce_rate_percentage: { 
              $multiply: [{ $divide: ["$bounce_sessions", "$total_sessions"] }, 100] 
            }
          }
        }
      ]);
      
      // Get platform distribution separately
      const platformStats = await UserAnalytics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$device_info.platform",
            count: { $sum: 1 }
          }
        }
      ]);
      
      // Get top countries
      const countryStats = await UserAnalytics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$location_info.country",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]);
      
      const result = analytics[0] || {
        total_sessions: 0,
        unique_users_count: 0,
        total_duration: 0,
        avg_session_duration: 0,
        avg_session_duration_minutes: 0,
        total_pages_visited: 0,
        total_actions: 0,
        bounce_sessions: 0,
        bounce_rate_percentage: 0
      };
      
      result.platform_distribution = platformStats;
      result.top_countries = countryStats;
      
      console.log('Overall analytics result:', result);
      return result;
    } catch (error) {
      console.error('Error in getOverallAnalytics:', error);
      throw new Error(`Error getting overall analytics: ${error.message}`);
    }
  }
  
  // Lấy thống kê theo từng user
  static async getUserAnalytics(userId, dateRange = {}) {
    try {
      const summary = await UserAnalytics.getUserSummary(userId, dateRange);
      const result = summary[0] || {
        total_sessions: 0,
        total_duration: 0,
        avg_session_duration: 0,
        avg_session_duration_minutes: 0,
        total_pages_visited: 0,
        total_actions: 0,
        bounce_sessions: 0,
        bounce_rate_percentage: 0,
        last_activity: null,
        devices_used: [],
        most_common_actions: []
      };
      
      console.log('User analytics result:', result);
      return result;
    } catch (error) {
      console.error('Error in getUserAnalytics:', error);
      throw new Error(`Error getting user analytics: ${error.message}`);
    }
  }
  
  // Lấy top users theo hoạt động
  static async getTopActiveUsers(limit = 10, dateRange = {}) {
    try {
      const matchQuery = {};
      
      if (dateRange.start && dateRange.end) {
        matchQuery.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        };
      }
      
      // Only include users with user_id (not anonymous sessions)
      matchQuery.user_id = { $ne: null };
      
      const topUsers = await UserAnalytics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: "$user_id",
            total_sessions: { $sum: 1 },
            total_duration: { $sum: "$session_data.duration" },
            total_actions: { $sum: "$session_data.actions_performed" },
            last_activity: { $max: "$session_data.start_time" }
          }
        },
        {
          $lookup: {
            from: "Users",
            localField: "_id",
            foreignField: "_id",
            as: "user_info"
          }
        },
        { $unwind: { path: "$user_info", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            user_id: "$_id",
            full_name: { $ifNull: ["$user_info.full_name", "Unknown User"] },
            email: { $ifNull: ["$user_info.email", "No Email"] },
            avatar: { $ifNull: ["$user_info.avatar", null] },
            total_sessions: 1,
            total_duration: 1,
            total_actions: 1,
            last_activity: 1,
            avg_session_duration: { 
              $cond: [
                { $gt: ["$total_sessions", 0] },
                { $divide: ["$total_duration", "$total_sessions"] },
                0
              ]
            }
          }
        },
        { $sort: { total_actions: -1 } },
        { $limit: limit }
      ]);
      
      console.log('Top users result:', topUsers);
      return topUsers;
    } catch (error) {
      console.error('Error in getTopActiveUsers:', error);
      throw new Error(`Error getting top active users: ${error.message}`);
    }
  }
  
  // Lấy thống kê hoạt động theo thời gian
  static async getActivityByTime(period = 'daily', dateRange = {}) {
    try {
      const matchQuery = {};
      
      if (dateRange.start && dateRange.end) {
        matchQuery.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        };
      }
      
      let groupBy;
      switch (period) {
        case 'hourly':
          groupBy = {
            year: { $year: "$session_data.start_time" },
            month: { $month: "$session_data.start_time" },
            day: { $dayOfMonth: "$session_data.start_time" },
            hour: { $hour: "$session_data.start_time" }
          };
          break;
        case 'weekly':
          groupBy = {
            year: { $year: "$session_data.start_time" },
            week: { $week: "$session_data.start_time" }
          };
          break;
        case 'monthly':
          groupBy = {
            year: { $year: "$session_data.start_time" },
            month: { $month: "$session_data.start_time" }
          };
          break;
        default: // daily
          groupBy = {
            year: { $year: "$session_data.start_time" },
            month: { $month: "$session_data.start_time" },
            day: { $dayOfMonth: "$session_data.start_time" }
          };
      }
      
      const activity = await UserAnalytics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: groupBy,
            sessions: { $sum: 1 },
            unique_users: { $addToSet: "$user_id" },
            total_duration: { $sum: "$session_data.duration" },
            total_actions: { $sum: "$session_data.actions_performed" }
          }
        },
        {
          $project: {
            _id: 1,
            sessions: 1,
            unique_users_count: { $size: "$unique_users" },
            total_duration: 1,
            total_actions: 1,
            avg_session_duration: { 
              $cond: [
                { $gt: ["$sessions", 0] },
                { $divide: ["$total_duration", "$sessions"] },
                0
              ]
            }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.hour": 1, "_id.week": 1 } }
      ]);
      
      return activity;
    } catch (error) {
      console.error('Error in getActivityByTime:', error);
      throw new Error(`Error getting activity by time: ${error.message}`);
    }
  }
  
  // Lấy thống kê theo platform/device
  static async getPlatformAnalytics(dateRange = {}) {
    try {
      const matchQuery = {};
      
      if (dateRange.start && dateRange.end) {
        matchQuery.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        };
      }
      
      const platforms = await UserAnalytics.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              platform: "$device_info.platform",
              device_type: "$device_info.device_type",
              browser: "$device_info.browser",
              os: "$device_info.os"
            },
            sessions: { $sum: 1 },
            unique_users: { $addToSet: "$user_id" },
            avg_duration: { $avg: "$session_data.duration" },
            total_actions: { $sum: "$session_data.actions_performed" }
          }
        },
        {
          $project: {
            _id: 1,
            sessions: 1,
            unique_users_count: { $size: "$unique_users" },
            avg_duration: 1,
            total_actions: 1
          }
        },
        { $sort: { sessions: -1 } }
      ]);
      
      return platforms;
    } catch (error) {
      console.error('Error in getPlatformAnalytics:', error);
      throw new Error(`Error getting platform analytics: ${error.message}`);
    }
  }
  
  // Lấy thống kê hành vi (action types)
  static async getActionAnalytics(dateRange = {}) {
    try {
      const matchQuery = {};
      
      if (dateRange.start && dateRange.end) {
        matchQuery.createdAt = {
          $gte: new Date(dateRange.start),
          $lte: new Date(dateRange.end)
        };
      }
      
      const actions = await UserAnalytics.aggregate([
        { $match: matchQuery },
        { $unwind: { path: "$activity_log", preserveNullAndEmptyArrays: false } },
        {
          $group: {
            _id: "$activity_log.action_type",
            count: { $sum: 1 },
            unique_users: { $addToSet: "$user_id" },
            unique_sessions: { $addToSet: "$session_id" }
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            unique_users_count: { $size: "$unique_users" },
            unique_sessions_count: { $size: "$unique_sessions" }
          }
        },
        { $sort: { count: -1 } }
      ]);
      
      console.log('Action analytics result:', actions);
      return actions;
    } catch (error) {
      console.error('Error in getActionAnalytics:', error);
      throw new Error(`Error getting action analytics: ${error.message}`);
    }
  }
}

module.exports = UserAnalyticsService; 