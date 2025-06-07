import React, { useEffect, useState } from "react";
import AuthNavigator from "./AuthNavigator";
import MainNavigatorCustomer from "./customer/MainNavigatorCustomer";
// import MainNavigatorStaff from "./staff/MainNavigatorStaff";
import { addAuth, authSelector } from "../redux/reducers/authReducer";
import { useSelector, useDispatch } from "react-redux";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import MainNavigatorStaff from "./staff/MainNavigatorStaff";
import userAPI from "../services/userAPI";

const AppRouters = () => {
  const auth = useSelector(authSelector);
  const { getItem: getToken, setItem: setToken } = useAsyncStorage("token");
  const { getItem: getUserData, setItem: setUserData } =
    useAsyncStorage("userData");
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    handleGetData();
  }, []);

  // const handleGetData = async () => {
  //   await checkLogin();
  // };

  const checkLogin = async () => {
    const token = await getToken();
    const userData = await getUserData();
    token &&
      userData &&
      dispatch(addAuth({ token, user: JSON.parse(userData) }));
  };
  const handleGetData = async () => {
    const token = await getToken();
    if (token) {
      try {
        const response = await userAPI.HandleUser("/profile");
        if (response.status === 200) {
          const user = response.data.user;
          dispatch(addAuth({ token, user }));
          await setUserData(JSON.stringify(user));
        }
      } catch (error) {
        console.error("Lỗi khi gọi /profile để lấy user:", error);
        // If profile call fails, try to use cached data
        try {
          const userData = await getUserData();
          if (userData) {
            dispatch(addAuth({ token, user: JSON.parse(userData) }));
          }
        } catch (cacheError) {
          console.error("Failed to load cached user data:", cacheError);
          // Clear invalid token
          await setToken(null);
        }
      }
    }
    setIsLoading(false);
  };

  if (isLoading) return null;
  if (!auth.token) {
    return <AuthNavigator />;
  }

  if (auth.user.role === "CUSTOMER") return <MainNavigatorCustomer />;
  if (auth.user.role === "STAFF") return <MainNavigatorStaff />;

  return <AuthNavigator />;
};

export default AppRouters;
