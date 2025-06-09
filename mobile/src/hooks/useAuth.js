import AsyncStorage from "@react-native-async-storage/async-storage";
import { addAuth, removeAuth } from "../redux/reducers/authReducer";
import { useDispatch } from "react-redux";
import { mobileAnalyticsTracker } from "../utils/analytics";
import { registerAndSaveTokenForLogin, clearPushToken } from "../utils/notifications";

export const useAuth = () => {
  const dispatch = useDispatch();

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


      dispatch(addAuth({ token, user }));

      // Initialize analytics session after successful login
      await mobileAnalyticsTracker.initializeAfterLogin();

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
      await mobileAnalyticsTracker.endSession();

      // Clear push token
      await clearPushToken();

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("userData");

      // Clear analytics session
      await mobileAnalyticsTracker.clearSession();

      dispatch(removeAuth());
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
