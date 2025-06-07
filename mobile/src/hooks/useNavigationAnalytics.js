import { useEffect, useRef } from 'react';
import { useNavigation, useRoute } from '@react-navigation/native';
import { mobileAnalyticsTracker } from '../utils/analytics';

export const useNavigationAnalytics = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const routeNameRef = useRef();

  useEffect(() => {
    const unsubscribe = navigation.addListener('state', (e) => {
      // Get the current route name
      const previousRouteName = routeNameRef.current;
      const currentRouteName = getCurrentRouteName(e.data.state);

      if (previousRouteName !== currentRouteName) {
        // Track screen view
        if (mobileAnalyticsTracker.isTrackingInitialized()) {
          mobileAnalyticsTracker.trackScreenView(currentRouteName, {
            previous_screen: previousRouteName,
            navigation_action: e.type,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Save the current route name for next time
      routeNameRef.current = currentRouteName;
    });

    return unsubscribe;
  }, [navigation]);

  // Track initial screen
  useEffect(() => {
    if (route.name && mobileAnalyticsTracker.isTrackingInitialized()) {
      mobileAnalyticsTracker.trackScreenView(route.name, {
        is_initial_screen: true,
        route_params: route.params,
        timestamp: new Date().toISOString()
      });
      routeNameRef.current = route.name;
    }
  }, [route.name]);

  return {
    trackScreenView: (screenName, params) => {
      if (mobileAnalyticsTracker.isTrackingInitialized()) {
        mobileAnalyticsTracker.trackScreenView(screenName, params);
      }
    }
  };
};

// Helper function to get current route name
const getCurrentRouteName = (state) => {
  if (!state || typeof state.index !== 'number') {
    return null;
  }

  const route = state.routes[state.index];

  if (route.state) {
    return getCurrentRouteName(route.state);
  }

  return route.name;
};

// HOC to automatically track screen views
export const withAnalytics = (WrappedComponent, screenName) => {
  return function AnalyticsWrapper(props) {
    const route = useRoute();
    
    useEffect(() => {
      const name = screenName || route.name;
      if (mobileAnalyticsTracker.isTrackingInitialized()) {
        mobileAnalyticsTracker.trackScreenView(name, {
          route_params: route.params,
          timestamp: new Date().toISOString()
        });
      }
    }, [route.name, route.params]);

    return <WrappedComponent {...props} />;
  };
}; 