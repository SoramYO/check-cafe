import { mobileAnalyticsTracker } from './analytics';

// Helper để track navigation actions
export const trackNavigation = (fromScreen, toScreen, params = {}) => {
  if (mobileAnalyticsTracker.isTrackingInitialized()) {
    mobileAnalyticsTracker.trackAppEvent('navigation', {
      from_screen: fromScreen,
      to_screen: toScreen,
      params: params,
      timestamp: new Date().toISOString()
    });
  }
};

// HOC để wrap navigation và auto-track
export const withNavigationAnalytics = (navigation, currentScreenName) => {
  const originalNavigate = navigation.navigate;
  const originalGoBack = navigation.goBack;
  const originalReset = navigation.reset;

  return {
    ...navigation,
    navigate: (screenName, params) => {
      trackNavigation(currentScreenName, screenName, params);
      return originalNavigate(screenName, params);
    },
    goBack: () => {
      trackNavigation(currentScreenName, 'previous_screen');
      return originalGoBack();
    },
    reset: (resetConfig) => {
      trackNavigation(currentScreenName, 'reset', resetConfig);
      return originalReset(resetConfig);
    }
  };
};

// Track common UI interactions
export const trackButtonPress = (buttonName, metadata = {}) => {
  if (mobileAnalyticsTracker.isTrackingInitialized()) {
    mobileAnalyticsTracker.trackTap(buttonName, {
      ...metadata,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackFormSubmission = (formName, formData = {}) => {
  if (mobileAnalyticsTracker.isTrackingInitialized()) {
    mobileAnalyticsTracker.trackAppEvent('form_submission', {
      form_name: formName,
      form_data: formData,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackError = (errorType, errorMessage, context = {}) => {
  if (mobileAnalyticsTracker.isTrackingInitialized()) {
    mobileAnalyticsTracker.trackAppEvent('error', {
      error_type: errorType,
      error_message: errorMessage,
      context: context,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackApiCall = (endpoint, method, status, duration = null) => {
  if (mobileAnalyticsTracker.isTrackingInitialized()) {
    mobileAnalyticsTracker.trackAppEvent('api_call', {
      endpoint: endpoint,
      method: method,
      status: status,
      duration: duration,
      timestamp: new Date().toISOString()
    });
  }
};

export const trackUserAction = (actionType, actionDetails = {}) => {
  if (mobileAnalyticsTracker.isTrackingInitialized()) {
    mobileAnalyticsTracker.trackAppEvent('user_action', {
      action_type: actionType,
      ...actionDetails,
      timestamp: new Date().toISOString()
    });
  }
}; 