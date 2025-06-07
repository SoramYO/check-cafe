import AsyncStorage from "@react-native-async-storage/async-storage";
import { addAuth, removeAuth } from "../redux/reducers/authReducer";
import { useDispatch } from "react-redux";
import { mobileAnalyticsTracker } from "../utils/analytics";

export const useAuth = () => {
  const dispatch = useDispatch();

  const login = async (token, user) => {
    try {
      console.log('🔍 Debug - Login attempt with user:', user);
      
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
      console.log('🔍 Debug - Stored token:', storedToken);
      console.log('🔍 Debug - Stored user:', storedUser);
      
      dispatch(addAuth({ token, user }));
      
      // Initialize analytics session after successful login
      await mobileAnalyticsTracker.initializeAfterLogin();
    } catch (error) {
      console.error("Error during login:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // End analytics session before clearing data
      await mobileAnalyticsTracker.endSession();
      
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
