import React, { useEffect, useState } from "react";
import AuthNavigator from "./AuthNavigator";
import MainNavigatorCustomer from "./customer/MainNavigatorCustomer";
// import MainNavigatorStaff from "./staff/MainNavigatorStaff";
import { addAuth, authSelector, removeAuth } from "../redux/reducers/authReducer";
import { useSelector, useDispatch } from "react-redux";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import MainNavigatorStaff from "./staff/MainNavigatorStaff";
import userAPI from "../services/userAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLogoutHandler } from "../services/axiosClient";

const AppRouters = () => {
  const auth = useSelector(authSelector);
  const { getItem: getToken, setItem: setToken } = useAsyncStorage("token");
  const { getItem: getUserData, setItem: setUserData } =
    useAsyncStorage("userData");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up logout handler for axios interceptor
    setLogoutHandler(() => {
      dispatch(removeAuth());
    });
    
    handleGetData();
  }, [dispatch]);

  const handleGetData = async () => {
    const token = await getToken();
    if (token && token !== 'null') {
      try {
        console.log("Attempting to fetch user profile...");
        const response = await userAPI.HandleUser("/profile");
        
        if (response.status === 200) {
          const user = response.data.user;
          dispatch(addAuth({ token, user }));
          await setUserData(JSON.stringify(user));
          console.log("✅ Profile loaded successfully");
        }
      } catch (error) {
        console.error("Lỗi khi gọi /profile để lấy user:", error);
        
        // Check if it's a 401 error (token expired/invalid) or 530 error (server unreachable)
        if (error.response?.status === 401 || error.response?.status === 530) {
          const errorType = error.response?.status === 401 ? "Token expired or invalid" : "Server unreachable (530)";
          console.log(`${errorType}, clearing auth data and logging out`);
          
          // Clear invalid token and user data
          await setToken(null);
          await AsyncStorage.removeItem("userData");
          await AsyncStorage.removeItem("analytics_session");
          await AsyncStorage.removeItem("expo_push_token");
          dispatch(removeAuth());
        } else {
          // For other errors, try to use cached data
          try {
            const userData = await getUserData();
            if (userData && userData !== 'null') {
              const user = JSON.parse(userData);
              if (user && (user._id || user.id)) {
                dispatch(addAuth({ token, user }));
                console.log("Using cached user data as fallback");
              } else {
                console.log("Invalid cached user data, clearing token");
                await setToken(null);
              }
            }
          } catch (cacheError) {
            console.error("Failed to load cached user data:", cacheError);
            // Clear invalid token
            await setToken(null);
          }
        }
      }
    } else {
      console.log("No valid token found");
    }
    setIsLoading(false);
  };

  if (isLoading) return null;
  
  if (!auth.token) {
    return <AuthNavigator />;
  }

  // Ensure user has valid data before routing
  if (!auth.user || (!auth.user._id && !auth.user.id)) {
    console.log("Invalid user data, redirecting to auth");
    return <AuthNavigator />;
  }

  if (auth.user.role === "CUSTOMER") return <MainNavigatorCustomer />;
  if (auth.user.role === "STAFF") return <MainNavigatorStaff />;

  return <AuthNavigator />;
};

export default AppRouters;
