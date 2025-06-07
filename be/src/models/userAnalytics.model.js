"use strict";
const mongoose = require("mongoose");

const DOCUMENT_NAME = "UserAnalytics";
const COLLECTION_NAME = "UserAnalytics";

const userAnalyticsSchema = new mongoose.Schema(
  {
    user_id: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      required: false,
      default: null
    },
    session_id: { type: String, required: true },
    device_info: {
      platform: { type: String }, // 'web', 'mobile', 'desktop'
      browser: { type: String },
      device_type: { type: String }, // 'mobile', 'tablet', 'desktop'
      os: { type: String },
      screen_resolution: { type: String },
      user_agent: { type: String }
    },
    location_info: {
      ip_address: { type: String },
      country: { type: String },
      city: { type: String },
      latitude: { type: Number },
      longitude: { type: Number }
    },
    session_data: {
      start_time: { type: Date, required: true },
      end_time: { type: Date },
      duration: { type: Number, default: 0 }, // in seconds
      pages_visited: { type: Number, default: 0 },
      actions_performed: { type: Number, default: 0 },
      is_active: { type: Boolean, default: true }
    },
    activity_log: [{
      action_type: { 
        type: String, 
        enum: ['page_view', 'click', 'search', 'filter', 'booking', 'review', 'favorite', 'logout', 'app_event'],
        required: true 
      },
      page_url: { type: String },
      element_clicked: { type: String },
      search_query: { type: String },
      booking_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
      shop_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop' },
      timestamp: { type: Date, default: Date.now },
      metadata: { type: mongoose.Schema.Types.Mixed } // Additional data for each action
    }],
    engagement_metrics: {
      bounce_rate: { type: Number, default: 0 }, // Time spent < 30s
      scroll_depth: { type: Number, default: 0 }, // Percentage of page scrolled
      click_through_rate: { type: Number, default: 0 },
      conversion_rate: { type: Number, default: 0 } // Bookings made / sessions
    },
    referrer_info: {
      source: { type: String }, // 'direct', 'google', 'facebook', etc.
      medium: { type: String }, // 'organic', 'cpc', 'social', etc.
      campaign: { type: String },
      referrer_url: { type: String }
    }
  },
  { 
    timestamps: true, 
    collection: COLLECTION_NAME,
    indexes: [
      { user_id: 1, createdAt: -1 },
      { session_id: 1 },
      { 'session_data.start_time': -1 },
      { 'activity_log.action_type': 1 }
    ]
  }
);

// Virtual for session duration in minutes
userAnalyticsSchema.virtual('session_duration_minutes').get(function() {
  return this.session_data.duration ? Math.round(this.session_data.duration / 60) : 0;
});

// Method to add activity to log
userAnalyticsSchema.methods.addActivity = function(activityData) {
  this.activity_log.push(activityData);
  this.session_data.actions_performed += 1;
  
  if (activityData.action_type === 'page_view') {
    this.session_data.pages_visited += 1;
  }
  
  return this.save();
};

// Method to end session
userAnalyticsSchema.methods.endSession = function() {
  if (!this.session_data.end_time) {
    this.session_data.end_time = new Date();
    this.session_data.duration = Math.floor(
      (this.session_data.end_time - this.session_data.start_time) / 1000
    );
    this.session_data.is_active = false;
    
    // Calculate bounce rate (if session < 30 seconds)
    this.engagement_metrics.bounce_rate = this.session_data.duration < 30 ? 1 : 0;
  }
  
  return this.save();
};

// Static method to get user analytics summary
userAnalyticsSchema.statics.getUserSummary = function(userId, dateRange = {}) {
  const matchQuery = userId ? { user_id: new mongoose.Types.ObjectId(userId) } : { user_id: null };
  
  if (dateRange.start && dateRange.end) {
    matchQuery.createdAt = {
      $gte: new Date(dateRange.start),
      $lte: new Date(dateRange.end)
    };
  }
  
  return this.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$user_id",
        total_sessions: { $sum: 1 },
        total_duration: { $sum: "$session_data.duration" },
        avg_session_duration: { $avg: "$session_data.duration" },
        total_pages_visited: { $sum: "$session_data.pages_visited" },
        total_actions: { $sum: "$session_data.actions_performed" },
        bounce_sessions: { $sum: { $cond: [{ $eq: ["$engagement_metrics.bounce_rate", 1] }, 1, 0] } },
        last_activity: { $max: "$session_data.start_time" },
        devices_used: { $addToSet: "$device_info.platform" },
        most_common_actions: { $push: "$activity_log.action_type" }
      }
    },
    {
      $addFields: {
        bounce_rate_percentage: { 
          $multiply: [{ $divide: ["$bounce_sessions", "$total_sessions"] }, 100] 
        },
        avg_session_duration_minutes: { $divide: ["$avg_session_duration", 60] }
      }
    }
  ]);
};

module.exports = mongoose.model(DOCUMENT_NAME, userAnalyticsSchema); 