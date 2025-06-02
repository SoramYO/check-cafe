import React, { useEffect, useState } from "react";
import AuthNavigator from "./AuthNavigator";
import MainNavigatorCustomer from "./customer/MainNavigatorCustomer";
// import MainNavigatorStaff from "./staff/MainNavigatorStaff";
import { addAuth, authSelector } from "../redux/reducers/authReducer";
import { useSelector, useDispatch } from "react-redux";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";
import MainNavigatorStaff from "./staff/MainNavigatorStaff";

const AppRouters = () => {
  const auth = useSelector(authSelector);
  const { getItem: getToken } = useAsyncStorage("token");
  const { getItem: getUserData } = useAsyncStorage("userData");
  const dispatch = useDispatch();

  useEffect(() => {
    handleGetData();
  }, []);

  const handleGetData = async () => {
    console.log("🔎 Getting login data...");
    await checkLogin();
  };

  const checkLogin = async () => {
    const token = await getToken();
    const userData = await getUserData();
    console.log("🪪 Token:", token);
    console.log("👤 UserData:", userData);
    token &&
      userData &&
      dispatch(addAuth({ token, user: JSON.parse(userData) }));
  };

  if (!auth.token) {
    console.log("🚫 No token -> render AuthNavigator");
    return <AuthNavigator />;
  }

  console.log("✅ Token:", auth.token);
  console.log("✅ Role:", auth.user?.role);
  if (auth.user.role === "CUSTOMER") return <MainNavigatorCustomer />;
  if (auth.user.role === "STAFF") return <MainNavigatorStaff />;

  return <AuthNavigator />;
};

export default AppRouters;
