import AsyncStorage from "@react-native-async-storage/async-storage";
import { addAuth, removeAuth } from "../redux/reducers/authReducer";
import { useDispatch } from "react-redux";
import { mobileAnalyticsTracker } from "../utils/analytics";
import { registerAndSaveTokenForLogin, clearPushToken } from "../utils/notifications";
import { setLogoutHandler } from "../services/axiosClient";
import { useEffect } from "react";

export const useAuth = () => {
  const dispatch = useDispatch();

  // Register logout handler with axios client on hook initialization
  useEffect(() => {
    const handleLogout = () => {
      console.log("Auto logout triggered by 401 error");
      dispatch(removeAuth());
    };
    
    setLogoutHandler(handleLogout);
  }, [dispatch]);

  const login = async (token, user) => {
    try {
      // Ensure user has required fields
      if (!user || (!user._id && !user.id)) {
        console.error('Invalid user data structure:', user);
        throw new Error('Invalid user data structure');
      }

      // Store auth data
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));

      // Log stored data for verification
      const storedToken = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("userData");
      console.log("✅ Auth data stored successfully");

      dispatch(addAuth({ token, user }));

      // Initialize analytics session after successful login
      try {
        await mobileAnalyticsTracker.initializeAfterLogin();
      } catch (analyticsError) {
        console.warn('⚠️ Failed to initialize analytics on login:', analyticsError);
        // Don't throw error here, login should still succeed
      }

      // Register and save Expo push token for new login
      try {
        await registerAndSaveTokenForLogin();
      } catch (tokenError) {
        console.warn('⚠️ Failed to register push token on login:', tokenError);
        // Don't throw error here, login should still succeed
      }
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // End analytics session before clearing data
      try {
        await mobileAnalyticsTracker.endSession();
      } catch (analyticsError) {
        console.warn('⚠️ Failed to end analytics session:', analyticsError);
      }

      // Clear push token
      try {
        await clearPushToken();
      } catch (tokenError) {
        console.warn('⚠️ Failed to clear push token:', tokenError);
      }

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("analytics_session");
      await AsyncStorage.removeItem("expo_push_token");

      // Clear analytics session
      try {
        await mobileAnalyticsTracker.clearSession();
      } catch (analyticsError) {
        console.warn('⚠️ Failed to clear analytics session:', analyticsError);
      }

      dispatch(removeAuth());
      console.log("✅ Logout completed successfully");
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  };

  const updateUser = async (user) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      dispatch(addAuth({ token, user }));
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  return {
    login,
    logout,
    updateUser,
  };
};
