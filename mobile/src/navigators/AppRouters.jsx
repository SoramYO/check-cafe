import React, { useEffect, useState } from "react";
import AuthNavigator from "./AuthNavigator";
import MainNavigatorCustomer from "./customer/MainNavigatorCustomer";
import { addAuth, authSelector, removeAuth } from "../redux/reducers/authReducer";
import { useSelector, useDispatch } from "react-redux";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import MainNavigatorStaff from "./staff/MainNavigatorStaff";
import userAPI from "../services/userAPI";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setLogoutHandler } from "../services/axiosClient";
import { View, Text, Button } from "react-native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

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
        const response = await userAPI.HandleUser("/profile");
        
        if (response.status === 200) {
          const user = response.data.user;
          
          dispatch(addAuth({ token, user }));
          await setUserData(JSON.stringify(user));
        }
      } catch (error) { 
        
        // Check if it's a 401 error (token expired/invalid) or 530 error (server unreachable)
        if (error.response?.status === 401 || error.response?.status === 530) {
          const errorType = error.response?.status === 401 ? "Token expired or invalid" : "Server unreachable (530)";
          
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
              } else {
                await setToken(null);
              }
            }
          } catch (cacheError) {
            // Clear invalid token
            await setToken(null);
          }
        }
      }
    } else {
    }
    
    setIsLoading(false);
  };



  if (isLoading) {
    return null;
  }
  
  if (!auth.token) {
    return <AuthNavigator />;
  }

  // Ensure user has valid data before routing
  if (!auth.user || (!auth.user._id && !auth.user.id)) {
    return <AuthNavigator />;
  }

  if (auth.user.role === "CUSTOMER") {
    return <MainNavigatorCustomer />;
  }
  if (auth.user.role === "STAFF") {
    return <MainNavigatorStaff />;
  }

  // Nếu là SHOP_OWNER thì hiển thị thông báo không có quyền truy cập
  if (auth.user.role === "SHOP_OWNER") {
    const handleLogoutAndGoToLogin = async () => {
      try {
        await dispatch(removeAuth()); // Xóa Redux auth
        // Xóa AsyncStorage token/userData nếu cần
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("userData");
        navigation.navigate('Login');
      } catch (e) {
        // fallback
        navigation.navigate('Login');
      }
    };
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#E53935" />
        <Text style={{ fontSize: 20, color: '#E53935', fontWeight: 'bold', marginTop: 16 }}>Bạn không có quyền truy cập</Text>
        <Text style={{ fontSize: 16, color: '#333', marginTop: 8, textAlign: 'center', maxWidth: 300 }}>
          Vui lòng đăng nhập bằng tài khoản khách hàng để sử dụng ứng dụng này.
        </Text>
        <Button style={{ marginTop: 16 }} title="Đăng nhập" onPress={handleLogoutAndGoToLogin} />
      </View>
    );
  }

  return <AuthNavigator />;
};

export default AppRouters;