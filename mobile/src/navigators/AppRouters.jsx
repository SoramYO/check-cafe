import React, { useEffect, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import AuthNavigator from "./AuthNavigator";
import MainNavigator from "./MainNavigator";
import { addAuth, authSelector } from "../redux/reducers/authReducer";
import { useSelector, useDispatch } from "react-redux";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

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

  return auth.token ? <MainNavigator /> : <AuthNavigator />;
};

export default AppRouters;
