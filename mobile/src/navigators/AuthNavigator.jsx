import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { useAsyncStorage } from "@react-native-async-storage/async-storage";

const AuthNavigator = () => {
  const Stack = createNativeStackNavigator();
  const [isFirstLaunch, setIsFirstLaunch] = useState(true);
  const { getItem: getOnboardingStatus, setItem: setOnboardingStatus } = useAsyncStorage("onboardingStatus");

  useEffect(() => {
    checkIfFirstLaunch();
  }, []);

  const checkIfFirstLaunch = async () => {
    try {
      const status = await getOnboardingStatus();
      if (status !== null) {
        setIsFirstLaunch(false);
      }
    } catch (err) {
      console.log('Error checking first launch:', err);
    }
  };

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={isFirstLaunch ? "Onboarding" : "Login"}
    >
      {isFirstLaunch && <Stack.Screen name="Onboarding" component={OnboardingScreen} />}
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
