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
    await checkLogin();
  };

  const checkLogin = async () => {
    const token = await getToken();
    const userData = await getUserData();
    token &&
      userData &&
      dispatch(addAuth({ token, user: JSON.parse(userData) }));
  };

  if (!auth.token) return <AuthNavigator />;
  if (auth.user.role === "CUSTOMER") return <MainNavigatorCustomer />;
  if (auth.user.role === "STAFF") return <MainNavigatorStaff />;

  return <AuthNavigator />;
};

export default AppRouters;
