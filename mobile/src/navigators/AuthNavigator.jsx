import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthNavigator = () => {
  const Stack = createNativeStackNavigator();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkIfFirstLaunch = async () => {
      try {
        const status = await AsyncStorage.getItem("onboardingStatus");
        if (status !== null) {
          setIsFirstLaunch(false);
        } else {
          setIsFirstLaunch(true);
        }
      } catch (err) {
        console.log("Error checking first launch:", err);
        setIsFirstLaunch(true); // fallback
      } finally {
        setLoading(false);
      }
    };

    checkIfFirstLaunch();
  }, []);

  if (loading || isFirstLaunch === null) {
    return <></>; // hoặc <SplashScreen />
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName={isFirstLaunch ? "Onboarding" : "Login"}
    >
      <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
