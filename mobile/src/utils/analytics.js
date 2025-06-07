import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as Application from 'expo-application';
import * as Crypto from 'expo-crypto';
import { Platform, Dimensions } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import * as Location from 'expo-location';
import analyticsAPI from '../services/analyticsAPI';


class MobileAnalyticsTracker {
  constructor() {
    this.sessionData = {};
    this.isInitialized = false;
    this.currentLocation = null;
    this.initializationPromise = null; // Add promise tracking
  }

  // Check if user is authenticated
  async isUserAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('userData');
      
      if (!token || !user || token === 'null' || user === 'null') {
        return false;
      }

      try {
        const userData = JSON.parse(user);
        
        if (!userData) {
          return false;
        }
        
        if (!userData._id && !userData.id) {
          return false;
        }

        return true;
      } catch (parseError) {
        return false;
      }
    } catch (error) {
      return false;
    }
  }

  // Initialize session tracking (chỉ khi user đã đăng nhập)
  async initializeSession(forceInit = false) {
    // Prevent multiple simultaneous initializations
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    this.initializationPromise = (async () => {
      try {
    if (this.isInitialized) {
      console.log('Analytics session already initialized');
      return;
    }

    const isAuth = await this.isUserAuthenticated();
    
    if (!forceInit && !isAuth) {
      console.log('User not authenticated, skipping analytics session initialization');
      return;
    }
    
    try {
          // Check network connectivity first
          const netInfo = await NetInfo.fetch();
          if (!netInfo.isConnected) {
            console.log('No network connection available, will retry later');
            await AsyncStorage.setItem('analytics_pending_init', 'true');
            return;
          }

      console.log('Initializing mobile analytics session...');
      const deviceInfo = await this.getDeviceInfo();
      const locationInfo = await this.getLocationInfo();
      const referrerInfo = this.getReferrerInfo();

          try {
            const response = await analyticsAPI.HandleAnalytics("/session/create", {
        deviceInfo,
        locationInfo,
        referrerInfo
            }, "post");

            console.log('🔍 Analytics Response SUCCESS:', response);

            // Response đã được processed bởi axios interceptor
            if (response && (response.status === 201 || response.sessionId)) {
              // Lưu đúng cấu trúc session data
              this.sessionData = response.data || response;
              this.isInitialized = true;
              
              // Save session to AsyncStorage
              await AsyncStorage.setItem('analytics_session', JSON.stringify(this.sessionData));
              await AsyncStorage.removeItem('analytics_pending_init');
              
              console.log('🔍 Saved session data:', this.sessionData);
              
              // Track initial app open
              this.trackActivity({
                action_type: 'page_view',
                page_url: 'app_open',
                metadata: {
                  timestamp: new Date().toISOString(),
                  app_version: Application.nativeApplicationVersion || '1.0.0'
                }
              });
              
              console.log('🔍 Analytics session initialized successfully');
            }
          } catch (apiError) {
            // Axios interceptor có thể throw error cho status 201
            console.log('🔍 API Error (checking for 201 status):', apiError.message);
            
            // Kiểm tra nếu server actually trả về 201 nhưng interceptor throw error
            if (apiError.response && apiError.response.status === 201) {
              console.log('🔍 Status 201 detected, processing as success');
              const successData = apiError.response.data;
              
              // Lưu đúng cấu trúc session data
              this.sessionData = successData.data || successData;
        this.isInitialized = true;
        
        // Save session to AsyncStorage
        await AsyncStorage.setItem('analytics_session', JSON.stringify(this.sessionData));
              await AsyncStorage.removeItem('analytics_pending_init');
              
              console.log('🔍 Saved session data (from 201):', this.sessionData);
        
        // Track initial app open
        this.trackActivity({
          action_type: 'page_view',
          page_url: 'app_open',
          metadata: {
            timestamp: new Date().toISOString(),
            app_version: Application.nativeApplicationVersion || '1.0.0'
          }
        });
              
              console.log('🔍 Analytics session initialized successfully (from 201)');
            } else {
              throw apiError; // Re-throw if it's a real error
            }
      }
    } catch (error) {
      console.error('Failed to initialize analytics session:', error);
          await AsyncStorage.setItem('analytics_pending_init', 'true');
        }
      } finally {
        this.initializationPromise = null;
    }
    })();

    return this.initializationPromise;
  }

  // Get device information using Expo modules
  async getDeviceInfo() {
    try {
      const { width, height } = Dimensions.get('window');
      const platform = Platform.OS;
      
      // Get device info using Expo modules
      const deviceType = Device.deviceType === Device.DeviceType.TABLET ? 'tablet' : 'mobile';
      const deviceName = Device.deviceName || 'Unknown Device';
      const modelName = Device.modelName || 'Unknown Model';
      const brand = Device.brand || 'Unknown Brand';
      const osName = Device.osName || Platform.OS;
      const osVersion = Device.osVersion || 'Unknown';
      
      // Get app info
      const appVersion = Application.nativeApplicationVersion || '1.0.0';
      const buildVersion = Application.nativeBuildVersion || '1';
      const bundleId = Application.applicationId || 'com.unknown.app';
      const appName = Application.applicationName || 'CheckAfe';

      return {
        platform: platform,
        browser: 'native_app',
        device_type: deviceType,
        os: `${osName} ${osVersion}`,
        screen_resolution: `${width}x${height}`,
        user_agent: `${bundleId}/${appVersion} (${platform}; ${modelName}; ${osVersion})`,
        device_info: {
          device_id: await this.getDeviceId(),
          device_name: deviceName,
          brand: brand,
          model: modelName,
          build_number: buildVersion,
          app_version: appVersion,
          bundle_id: bundleId,
          app_name: appName,
          is_tablet: deviceType === 'tablet',
          manufacturer: Device.manufacturer || 'Unknown',
          device_year_class: Device.deviceYearClass || null,
          total_memory: Device.totalMemory || 0
        }
      };
    } catch (error) {
      console.error('Error getting device info:', error);
      return {
        platform: Platform.OS,
        browser: 'native_app',
        device_type: 'mobile',
        os: 'unknown',
        screen_resolution: `${Dimensions.get('window').width}x${Dimensions.get('window').height}`,
        user_agent: 'unknown'
      };
    }
  }

  // Get unique device identifier
  async getDeviceId() {
    try {
      // Try to get stored device ID first
      let deviceId = await AsyncStorage.getItem('device_id');
      
      if (!deviceId) {
        // Generate new device ID if not exists
        deviceId = Crypto.randomUUID();
        await AsyncStorage.setItem('device_id', deviceId);
      }
      
      return deviceId;
    } catch (error) {
      console.error('Error getting device ID:', error);
      return Crypto.randomUUID(); // Fallback to new UUID
    }
  }

  // Get location information using Expo Location
  async getLocationInfo() {
    try {
      // Get network info
      const netInfo = await NetInfo.fetch();
      
      // Try to get GPS location (with permission)
      const location = await this.getCurrentPosition();
      
      // Try to get IP-based location as fallback
      let ipLocation = {};
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch('https://ipleak.net/json/', {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'CheckAfe-Mobile/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          ipLocation = await response.json();
        }
      } catch (error) {
        console.log('Failed to get IP location:', error);
      }

      return {
        latitude: location?.latitude || ipLocation.latitude,
        longitude: location?.longitude || ipLocation.longitude,
        country: ipLocation.country_name,
        city: ipLocation.city_name,
        region: ipLocation.region_name,
        continent: ipLocation.continent_name,
        ip_address: ipLocation.ip,
        isp: ipLocation.isp_name,
        network_type: netInfo.type,
        is_connected: netInfo.isConnected,
        is_wifi: netInfo.type === 'wifi',
        accuracy: location?.accuracy,
        timezone: ipLocation.time_zone
      };
    } catch (error) {
      console.error('Failed to get location info:', error);
      return {};
    }
  }

  // Get current GPS position using Expo Location
  async getCurrentPosition() {
    try {
      // Check permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.log('Location permission not granted');
        return null;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
        maximumAge: 300000, // 5 minutes
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      };
    } catch (error) {
      console.log('GPS Error:', error);
      return null;
    }
  }

  // Get referrer info (for mobile, this might be deep links or app store)
  getReferrerInfo() {
    // This would need to be implemented based on how your app handles deep links
    // and app store referrals
    return {
      source: 'direct',
      medium: 'mobile_app',
      campaign: null,
      referrer_url: null
    };
  }

  // Track activity
  async trackActivity(activityData) {
    console.log('🔍 trackActivity called with:', activityData);
    
    // Kiểm tra user đã authenticate hay chưa trước
    const isAuth = await this.isUserAuthenticated();
    if (!isAuth) {
      console.log('🔍 User not authenticated, skipping activity tracking');
      return;
    }

    console.log('🔍 User authenticated, checking session...');
    console.log('🔍 isInitialized:', this.isInitialized);
    console.log('🔍 sessionData:', this.sessionData);

    // Kiểm tra sessionId từ đúng vị trí
    const sessionId = this.sessionData?.sessionId || this.sessionData?.data?.sessionId;
    console.log('🔍 Extracted sessionId:', sessionId);

    if (!this.isInitialized || !this.sessionData || !sessionId) {
      console.log('🔍 Session not ready, trying to restore or initialize...');
      
      // Try to restore session from AsyncStorage
      try {
        const savedSession = await AsyncStorage.getItem('analytics_session');
        console.log('🔍 Saved session:', savedSession);
        
        if (savedSession && savedSession !== 'undefined') {
          try {
            this.sessionData = JSON.parse(savedSession);
            this.isInitialized = true;
            console.log('🔍 Session restored from storage:', this.sessionData);
          } catch (parseError) {
            console.log('🔍 Failed to parse saved session, initializing new session');
            await this.initializeSession(true);
          }
        } else {
          console.log('🔍 No saved session, initializing new session');
          await this.initializeSession(true);
        }
      } catch (error) {
        console.error('🔍 Error restoring session:', error);
        return;
      }
    }

    // Kiểm tra lại có sessionId hay không
    const finalSessionId = this.sessionData?.sessionId || this.sessionData?.data?.sessionId;
    if (!finalSessionId) {
      console.log('🔍 No valid session ID after restore/init, skipping activity tracking');
      return;
    }

    console.log('🔍 Tracking activity with sessionId:', finalSessionId);

    try {
      await analyticsAPI.HandleAnalytics("/activity/record", {
        sessionId: finalSessionId,
        activityData
      }, "post");
      
      console.log('🔍 Activity tracked successfully');
    } catch (error) {
      console.error('🔍 Failed to track activity:', error);
    }
  }

  // Track screen view
  async trackScreenView(screenName, params = {}) {
    await this.trackActivity({
      action_type: 'page_view',
      page_url: screenName,
      metadata: {
        timestamp: new Date().toISOString(),
        screen_name: screenName,
        screen_params: params
      }
    });
  }

  // Track button/element tap
  async trackTap(elementName, metadata = {}) {
    await this.trackActivity({
      action_type: 'click',
      element_clicked: elementName,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  // Track search
  async trackSearch(query, metadata = {}) {
    await this.trackActivity({
      action_type: 'search',
      search_query: query,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  // Track filter usage
  async trackFilter(filterData, metadata = {}) {
    await this.trackActivity({
      action_type: 'filter',
      metadata: {
        timestamp: new Date().toISOString(),
        filter_data: filterData,
        ...metadata
      }
    });
  }

  // Track booking
  async trackBooking(bookingId, shopId, metadata = {}) {
    await this.trackActivity({
      action_type: 'booking',
      booking_id: bookingId,
      shop_id: shopId,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    });
  }

  // Track review
  async trackReview(shopId, rating, metadata = {}) {
    await this.trackActivity({
      action_type: 'review',
      shop_id: shopId,
      metadata: {
        timestamp: new Date().toISOString(),
        rating,
        ...metadata
      }
    });
  }

  // Track favorite
  async trackFavorite(shopId, action = 'add', metadata = {}) {
    await this.trackActivity({
      action_type: 'favorite',
      shop_id: shopId,
      metadata: {
        timestamp: new Date().toISOString(),
        favorite_action: action, // 'add' or 'remove'
        ...metadata
      }
    });
  }

  // Track app events
  async trackAppEvent(eventName, metadata = {}) {
    await this.trackActivity({
      action_type: 'app_event',
      metadata: {
        timestamp: new Date().toISOString(),
        event_name: eventName,
        ...metadata
      }
    });
  }

  // End session
  async endSession() {
    const sessionId = this.sessionData?.sessionId || this.sessionData?.data?.sessionId;
    if (!this.sessionData || !sessionId) return;

    try {
      await analyticsAPI.HandleAnalytics("/session/end", {
        sessionId: sessionId
      }, "post");
      
      // Cleanup
      await AsyncStorage.removeItem('analytics_session');
      this.sessionData = {};
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  // Get session data
  getSessionData() {
    return this.sessionData;
  }

  // Check if tracking is initialized
  isTrackingInitialized() {
    return this.isInitialized;
  }

  // Method để manually init session sau khi user login
  async initializeAfterLogin() {
    if (!this.isInitialized) {
      await this.initializeSession(true); // Force init
    }
  }

  // Method để clear session khi user logout
  async clearSession() {
    try {
      this.sessionData = {};
      this.isInitialized = false;
      await AsyncStorage.removeItem('analytics_session');
      console.log('Mobile analytics session cleared');
    } catch (error) {
      console.error('Error clearing mobile analytics session:', error);
    }
  }

  // Add method to check and retry pending initialization
  async checkAndRetryPendingInit() {
    try {
      const pendingInit = await AsyncStorage.getItem('analytics_pending_init');
      if (pendingInit === 'true') {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
          console.log('Retrying pending analytics initialization...');
          await this.initializeSession(true);
        }
      }
    } catch (error) {
      console.error('Error checking pending initialization:', error);
    }
  }
}

// Export singleton instance
export const mobileAnalyticsTracker = new MobileAnalyticsTracker();

// React Hook for easy usage
export const useAnalytics = () => {
  return {
    trackScreenView: (screenName, params) => mobileAnalyticsTracker.trackScreenView(screenName, params),
    trackTap: (elementName, metadata) => mobileAnalyticsTracker.trackTap(elementName, metadata),
    trackSearch: (query, metadata) => mobileAnalyticsTracker.trackSearch(query, metadata),
    trackFilter: (filterData, metadata) => mobileAnalyticsTracker.trackFilter(filterData, metadata),
    trackBooking: (bookingId, shopId, metadata) => mobileAnalyticsTracker.trackBooking(bookingId, shopId, metadata),
    trackReview: (shopId, rating, metadata) => mobileAnalyticsTracker.trackReview(shopId, rating, metadata),
    trackFavorite: (shopId, action, metadata) => mobileAnalyticsTracker.trackFavorite(shopId, action, metadata),
    trackAppEvent: (eventName, metadata) => mobileAnalyticsTracker.trackAppEvent(eventName, metadata),
    initializeSession: () => mobileAnalyticsTracker.initializeSession(),
    initializeAfterLogin: () => mobileAnalyticsTracker.initializeAfterLogin(),
    clearSession: () => mobileAnalyticsTracker.clearSession(),
    endSession: () => mobileAnalyticsTracker.endSession(),
    getSessionData: () => mobileAnalyticsTracker.getSessionData(),
    isInitialized: () => mobileAnalyticsTracker.isTrackingInitialized(),
    isAuthenticated: () => mobileAnalyticsTracker.isUserAuthenticated()
  };
}; 