import React, { createContext, useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useSelector } from 'react-redux';
import { mobileAnalyticsTracker } from '../utils/analytics';

const AnalyticsContext = createContext();

export const AnalyticsProvider = ({ children }) => {
  const { user, token } = useSelector(state => state.authReducer || {});
  const isAuthenticated = !!(user && token);

  useEffect(() => {
    // Initialize analytics session chỉ khi user đã đăng nhập
    if (isAuthenticated && user) {
      console.log('🔍 User authenticated, initializing analytics session');
      mobileAnalyticsTracker.initializeAfterLogin();
    } else {
      console.log('🔍 User not authenticated, skipping analytics init');
      // Clear session nếu user logout
      if (mobileAnalyticsTracker.isTrackingInitialized()) {
        mobileAnalyticsTracker.clearSession();
      }
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Handle app state changes
    const handleAppStateChange = (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App going to background - track app_pause event
        if (mobileAnalyticsTracker.isTrackingInitialized()) {
          mobileAnalyticsTracker.trackAppEvent('app_pause', {
            timestamp: new Date().toISOString()
          });
        }
      } else if (nextAppState === 'active') {
        // App coming to foreground - track app_resume event
        if (mobileAnalyticsTracker.isTrackingInitialized()) {
          mobileAnalyticsTracker.trackAppEvent('app_resume', {
            timestamp: new Date().toISOString()
          });
        } else if (isAuthenticated && user) {
          // Re-initialize if session was lost và user đã authenticated
          console.log('🔍 Re-initializing analytics session on app resume');
          mobileAnalyticsTracker.initializeAfterLogin();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Cleanup when user logs out
    return () => {
      if (mobileAnalyticsTracker.isTrackingInitialized()) {
        mobileAnalyticsTracker.endSession();
      }
    };
  }, []);

  const value = {
    tracker: mobileAnalyticsTracker,
    isTracking: mobileAnalyticsTracker.isTrackingInitialized()
  };

  return (
    <AnalyticsContext.Provider value={value}>
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalyticsContext = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalyticsContext must be used within an AnalyticsProvider');
  }
  return context;
}; 